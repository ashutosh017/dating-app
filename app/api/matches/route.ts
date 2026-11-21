import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ matches: [] });
    }

    try {
      const matches = await prisma.match.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: {
          user1: { include: { profile: true } },
          user2: { include: { profile: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formattedMatches = matches.map((m: any) => {
        const otherUser = m.user1Id === userId ? m.user2 : m.user1;
        const otherProfile = otherUser.profile;
        const lastMsg = m.messages[0];

        return {
          id: m.id,
          matchedAt: m.createdAt.toISOString(),
          user: {
            id: otherUser.id,
            name: otherProfile?.name || "Member",
            age: otherProfile?.age || 0,
            photos: otherProfile?.photos || [],
            profession: otherProfile?.profession || otherProfile?.address || "",
            address: otherProfile?.address || "",
            verified: otherProfile?.verified || false,
          },
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.content,
                createdAt: lastMsg.createdAt.toISOString(),
                senderId: lastMsg.senderId,
              }
            : undefined,
        };
      });

      return NextResponse.json({ matches: formattedMatches });
    } catch (dbErr) {
      console.warn("Could not query matches from database:", dbErr);
      return NextResponse.json({ matches: [] });
    }
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/matches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
