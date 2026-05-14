// Creates a DB notification for a user and broadcasts it via Socket.IO
export async function createNotification(prisma, { userId, type, title, msg, icon, link }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message: JSON.stringify({ type, title, msg, icon, link: link || null }),
      },
    });

    // Notify via socket
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, title, msg, icon }),
      }).catch(err => console.error("Socket notification error:", err));
    }

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
// notification docs