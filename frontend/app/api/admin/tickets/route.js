import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";

const prisma = new PrismaClient();

export async function GET(request) {
  const authUser = await getAuthUser(request);
  if (!authUser || !checkPermission(authUser, "ticket:resolve")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const countResult = await prisma.$runCommandRaw({
      count: "Ticket"
    });
    
    if (countResult.n === 0) {
      // Auto-seed if empty
      await prisma.$runCommandRaw({
        insert: "Ticket",
        documents: [
          { type: 'Order', subject: 'Delivery delayed — XW-48291', priority: 'High', status: 'Open', escalation: 'Level 1', aiStatus: 'Draft sent', createdAt: { $date: new Date().toISOString() }, updatedAt: { $date: new Date().toISOString() } },
          { type: 'Client', subject: 'Refund request for duplicate charge', priority: 'Medium', status: 'In Progress', escalation: 'None', aiStatus: 'Monitoring', createdAt: { $date: new Date().toISOString() }, updatedAt: { $date: new Date().toISOString() } },
          { type: 'Writer', subject: 'Plagiarism flag on Project #902', priority: 'High', status: 'Open', escalation: 'Level 2', aiStatus: 'Alerted', createdAt: { $date: new Date().toISOString() }, updatedAt: { $date: new Date().toISOString() } },
          { type: 'Order', subject: 'Formatting issue in final draft', priority: 'Low', status: 'Resolved', escalation: 'None', createdAt: { $date: new Date().toISOString() }, updatedAt: { $date: new Date().toISOString() } },
          { type: 'Client', subject: 'Cannot access downloaded file', priority: 'Medium', status: 'Resolved', escalation: 'None', createdAt: { $date: new Date().toISOString() }, updatedAt: { $date: new Date().toISOString() } },
        ]
      });
    }

    const findResult = await prisma.$runCommandRaw({
      find: "Ticket",
      sort: { createdAt: -1 }
    });

    const tickets = findResult.cursor.firstBatch;

    // Map to match frontend expectations
    const mappedTickets = tickets.map(t => {
      const id = t._id.$oid || t._id;
      const clientId = t.clientId?.$oid || t.clientId;
      const writerId = t.writerId?.$oid || t.writerId;
      
      const createdAt = t.createdAt?.$date || t.createdAt;
      
      return {
        id: id,
        ticketId: `TKT-${id.toString().slice(-4).toUpperCase()}`,
        type: t.type,
        subject: t.subject,
        client: clientId ? `Client #${clientId.toString().slice(-4).toUpperCase()}` : 'N/A',
        writer: writerId ? `Writer #${writerId.toString().slice(-4).toUpperCase()}` : 'N/A',
        priority: t.priority,
        status: t.status,
        created: formatTime(createdAt),
        escalation: t.escalation || 'None',
        aiStatus: t.aiStatus || 'None',
      };
    });

    return NextResponse.json(mappedTickets);
  } catch (error) {
    console.error("Failed to fetch tickets via raw command:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const authUser = await getAuthUser(request);
  if (!authUser || !checkPermission(authUser, "ticket:resolve")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, status, priority, escalation, aiStatus } = await request.json();

    // Level 3 escalation requires ADMIN role (financial refunds, systemic errors)
    if (escalation === "Level 3" && authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Level 3 escalation requires Admin privileges. Contact a Super Admin." }, { status: 403 });
    }

    const updateDoc = {};
    if (status) updateDoc.status = status;
    if (priority) updateDoc.priority = priority;
    if (escalation) updateDoc.escalation = escalation;
    if (aiStatus) updateDoc.aiStatus = aiStatus;
    updateDoc.updatedAt = { $date: new Date().toISOString() };

    const result = await prisma.$runCommandRaw({
      update: "Ticket",
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: updateDoc }
        }
      ]
    });
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Failed to update ticket via raw command:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

function formatTime(date) {
  if (!date) return "N/A";
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}
