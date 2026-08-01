import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ratelimit } from "@/lib/rate-limit";
import { FORMATS } from "@repo/shared";
import { fileTypeFromBuffer } from "file-type";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { conversionQueue } from "@/lib/queue-producer";

const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucketName = process.env.S3_BUCKET_NAME;

const getS3Client = () => {
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing S3 storage credentials in environment variables.");
  }
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
};

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    // 2. Parse Body
    const body = await request.json();
    const { sourceFileName, sourceFormat, targetFormat, storageKeySource } = body;

    if (!sourceFileName || !sourceFormat || !targetFormat || !storageKeySource) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Validate Formats
    const sourceDef = FORMATS.find(f => f.id === sourceFormat.toLowerCase());
    const targetDef = FORMATS.find(f => f.id === targetFormat.toLowerCase());

    if (!sourceDef || !targetDef) {
      return NextResponse.json({ error: "Invalid format specified" }, { status: 400 });
    }

    if (sourceDef.category !== targetDef.category) {
      return NextResponse.json({ error: "Cross-category conversion is not supported" }, { status: 400 });
    }

    if (!sourceDef.phase1 || !targetDef.phase1) {
      return NextResponse.json({ error: "Format not available in Phase 1" }, { status: 400 });
    }

    // 4. File-type Validation (download first 4100 bytes from S3)
    try {
      const s3 = getS3Client();
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: storageKeySource,
        Range: "bytes=0-4100"
      });
      
      const s3Obj = await s3.send(command);
      const byteArray = await s3Obj.Body?.transformToByteArray();
      
      if (byteArray) {
        const fileInfo = await fileTypeFromBuffer(byteArray);
        
        if (fileInfo) {
          console.log(`[Validation] Uploaded file signature matches: ${fileInfo.ext} (${fileInfo.mime})`);
          // Note: file-type checks binary signatures (magic numbers).
          // If a user uploaded a renamed exe as a pdf, file-type would reveal the true type.
          // For now we log it. If you want strict rejection:
          // if (fileInfo.ext !== sourceFormat.toLowerCase() && fileInfo.ext !== "cfb") { ... reject ... }
        } else {
          console.log(`[Validation] Could not detect binary file type (could be plain text like CSV/TXT/HTML).`);
        }
      }
    } catch (s3Err) {
      console.error("Error fetching file header from S3 for validation:", s3Err);
      return NextResponse.json({ error: "Could not read uploaded file from storage" }, { status: 400 });
    }

    // 5. Create Job Record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const job = await db.conversionJob.create({
      data: {
        sourceFileName,
        sourceFormat: sourceFormat.toLowerCase(),
        targetFormat: targetFormat.toLowerCase(),
        storageKeySource,
        status: "PENDING",
        expiresAt,
      },
    });

    // 6. Trigger Queue
    const payload = {
      jobId: job.id,
      storageKeySource,
      sourceFormat: sourceFormat.toLowerCase(),
      targetFormat: targetFormat.toLowerCase(),
    };
    await conversionQueue.add("convert", payload);

    return NextResponse.json({ jobId: job.id }, { status: 201 });

  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
