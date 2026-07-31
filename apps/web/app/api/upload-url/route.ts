import { NextResponse } from "next/server";
import { generateUploadPresignedUrl } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Missing fileName or contentType in request body" },
        { status: 400 }
      );
    }

    const { url, key } = await generateUploadPresignedUrl(fileName, contentType);

    return NextResponse.json({ uploadUrl: url, storageKey: key });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
