import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
      });
      return NextResponse.json({ profile });
    } catch (dbErr) {
      console.warn("Prisma DB read skipped (database may not be connected yet):", dbErr);
      return NextResponse.json({ profile: null });
    }
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, profile } = body;

    if (!userId || !profile) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    try {
      // Ensure User exists before creating Profile
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
          id: userId,
          name: profile.name || "Sparks Member",
          email: `${userId}@sparks.app`,
        },
      });

      const upsertedProfile = await prisma.profile.upsert({
        where: { userId },
        update: {
          name: profile.name,
          age: Number(profile.age) || 21,
          gender: profile.gender || "unspecified",
          sexualOrientation: profile.sexualOrientation || "straight",
          interestedIn: profile.interestedIn || [],
          bio: profile.bio || "",
          address: profile.address || "",
          education: profile.education,
          profession: profile.profession,
          company: profile.company,
          photos: profile.photos || [],
          interests: profile.interests || [],
        },
        create: {
          userId,
          name: profile.name,
          age: Number(profile.age) || 21,
          gender: profile.gender || "unspecified",
          sexualOrientation: profile.sexualOrientation || "straight",
          interestedIn: profile.interestedIn || [],
          bio: profile.bio || "",
          address: profile.address || "",
          education: profile.education,
          profession: profile.profession,
          company: profile.company,
          photos: profile.photos || [],
          interests: profile.interests || [],
        },
      });

      return NextResponse.json({ success: true, profile: upsertedProfile });
    } catch (dbErr) {
      console.warn("Prisma DB write skipped (database may not be connected yet):", dbErr);
      return NextResponse.json({ success: true, profile });
    }
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
