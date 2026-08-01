import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ error: "Missing job ID" }, { status: 400 });
    }

    const job = await db.conversionJob.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        errorMessage: true,
        sourceFileName: true,
        createdAt: true,
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
