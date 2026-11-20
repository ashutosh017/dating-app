import { NextRequest, NextResponse } from "next/server";
import { uploadImageBuffer, isCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (isCloudinaryConfigured) {
      const uploadResult = await uploadImageBuffer(buffer);
      return NextResponse.json({ url: uploadResult.url });
    } else {
      // Local dev preview: convert to base64 data URL
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: base64,
        warning: "Cloudinary credentials not set. Using local preview data URL.",
      });
    }
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
