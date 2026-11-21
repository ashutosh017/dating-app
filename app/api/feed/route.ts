import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let swipedUserIds: string[] = [];
    const whereClause: any = {};

    if (userId) {
      swipedUserIds.push(userId); // Never show self

      try {
        const [pastSwipes, userProfile] = await Promise.all([
          prisma.swipe.findMany({
            where: { swiperId: userId },
            select: { targetId: true },
          }),
          prisma.profile.findUnique({
            where: { userId },
            select: { interestedIn: true },
          }),
        ]);

        swipedUserIds.push(...pastSwipes.map((s: { targetId: string }) => s.targetId));

        // Automatically match the user's saved orientation preference
        if (
          userProfile?.interestedIn &&
          userProfile.interestedIn.length > 0 &&
          !userProfile.interestedIn.includes("everyone")
        ) {
          whereClause.gender = { in: userProfile.interestedIn };
        }
      } catch (e) {
        console.warn("Could not load user filters from DB:", e);
      }
    }

    whereClause.userId = { notIn: swipedUserIds };

    try {
      const profiles = await prisma.profile.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: 30,
      });

      return NextResponse.json({ profiles });
    } catch (dbErr) {
      console.warn("Database feed query error:", dbErr);
      return NextResponse.json({ profiles: [] });
    }
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("GET /api/feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
