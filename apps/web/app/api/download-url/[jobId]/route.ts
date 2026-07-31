import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateDownloadPresignedUrl } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const resolvedParams = await params;
    const { jobId } = resolvedParams;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
    }

    const job = await db.conversionJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "COMPLETED" || !job.storageKeyResult) {
      return NextResponse.json({ error: "Job is not completed yet" }, { status: 404 });
    }

    const downloadUrl = await generateDownloadPresignedUrl(job.storageKeyResult);

    // Provide a default fallback file name based on source + new extension
    const fileName = job.sourceFileName.replace(`.${job.sourceFormat}`, `.${job.targetFormat}`);

    return NextResponse.json({ downloadUrl, fileName });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
