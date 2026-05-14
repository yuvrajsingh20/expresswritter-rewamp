"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * useChat — shared hook for all dashboard chat panels.
 *
 * @param {object} opts
 * @param {string}  opts.projectId   - DB project ID (null = not in a project chat)
 * @param {string}  opts.userId      - Authenticated user's DB id
 * @param {string}  opts.role        - "STUDENT" | "FREELANCER" | "ADMIN" | "SUB_ADMIN"
 * @param {string}  [opts.chatType]  - "CLIENT_CHAT" | "INTERNAL_CHAT" | "ADMIN_CHAT"
 * @param {string}  [opts.receiverId]- For ADMIN_CHAT direct messages
 */
export function useChat({ projectId, userId, role, chatType = "CLIENT_CHAT", receiverId } = {}) {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [errorAlert, setErrorAlert] = useState(null);
  const socketRef = useRef(null);

  // ── 1. Connect Socket.IO once per mount ──────────────────────────────────
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    // Join the right room(s)
    socket.emit("join_chat", { projectId, userId, role });

    // Incoming messages
    socket.on("receive_message", (data) => {
      // Only accept messages for the current channel
      if (data.chatType && data.chatType !== chatType) return;
      if (data.projectId && data.projectId !== projectId) return;

      setMessages((prev) => {
        if (data.id && prev.some((m) => m.id === data.id)) return prev;
        return [...prev, normalise(data)];
      });
    });

    // Server-side filter block
    socket.on("error_alert", ({ message }) => {
      setErrorAlert(message);
      setTimeout(() => setErrorAlert(null), 5000);
    });

    // System alerts (reassignment etc.)
    socket.on("system_alert", ({ message }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: message, senderId: "SYSTEM", isSystem: true, createdAt: new Date() },
      ]);
    });

    return () => socket.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, userId, role, chatType, receiverId]);

  // ── 2. Load history from REST API ────────────────────────────────────────
  useEffect(() => {
    if (!projectId && !receiverId) return;
    setLoading(true);
    const params = new URLSearchParams({ type: chatType });
    if (projectId) params.set("projectId", projectId);
    if (receiverId) params.set("receiverId", receiverId);
    // Only filter by senderId for direct chats (ADMIN_CHAT) without a project
    if (userId && chatType === 'ADMIN_CHAT' && !projectId) params.set("senderId", userId);

    fetch(`/api/messages?${params}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data.map(normalise) : []))
      .catch((e) => { console.error("Chat history fetch failed:", e); setError("Could not load messages."); })
      .finally(() => setLoading(false));
  }, [projectId, userId, chatType, receiverId]);

  // ── 3. Send ───────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content, attachments = []) => {
    if (!content?.trim() && (!attachments || attachments.length === 0)) return;
    if (!userId) { setErrorAlert("You must be logged in to send messages."); return; }

    try {
      // Persist first
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, content, chatType, receiverId: receiverId || null, attachments }),
      });

      if (!res.ok) throw new Error(await res.text());

      const saved = await res.json();

      // Emit via Socket.IO (server will broadcast to room)
      socketRef.current?.emit("send_message", {
        id: saved.id,
        content: saved.content,
        attachments: saved.attachments,
        projectId,
        chatType,
        senderId: userId,
        senderRole: role,
        senderName: saved.sender?.name || null,
        receiverId: receiverId || null,
      });

      // Optimistic local add
      setMessages((prev) => [...prev, normalise(saved)]);
    } catch (e) {
      console.error("Send failed:", e);
      setErrorAlert("Message failed to send. Please try again.");
      setTimeout(() => setErrorAlert(null), 4000);
    }
  }, [projectId, userId, role, chatType, receiverId]);

  return { messages, loading, error, errorAlert, sendMessage };
}

// Normalise DB record → consistent shape used by UI
function normalise(m) {
  return {
    id:        m.id        || Date.now().toString(),
    content:   m.content,
    senderId:  m.senderId  || m.sender?.id || null,
    senderRole: m.senderRole || m.sender?.role || 'STUDENT',
    senderName: m.senderName || m.sender?.name || null,
    isSystem:  m.isSystem  || false,
    createdAt: m.createdAt ? new Date(m.createdAt) : (m.timestamp ? new Date(m.timestamp) : new Date()),
    chatType:  m.chatType,
    projectId: m.projectId,
    attachments: m.attachments || [],
  };
}
