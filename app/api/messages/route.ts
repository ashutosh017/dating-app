import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { triggerPusherEvent } from "@/lib/pusher/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 });
    }

    try {
      const messages = await prisma.message.findMany({
        where: { matchId },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json({ messages });
    } catch (dbErr) {
      console.warn("Prisma DB read skipped:", dbErr);
      return NextResponse.json({ messages: [] });
    }
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { matchId, senderId, content, id: clientMessageId } = await req.json();

    if (!matchId || !senderId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Preserve client-assigned ID for seamless optimistic UI reconciliation and deduplication
    const messageId =
      typeof clientMessageId === "string" && clientMessageId.trim()
        ? clientMessageId.trim()
        : `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newMessage = {
      id: messageId,
      matchId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
    };

    try {
      await prisma.message.create({
        data: {
          id: newMessage.id,
          matchId,
          senderId,
          content,
        },
      });
    } catch (dbErr) {
      console.warn("Prisma DB write skipped:", dbErr);
    }

    // Broadcast message instantly to everyone subscribed to this match room
    await triggerPusherEvent(`match-${matchId}`, "new-message", newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
