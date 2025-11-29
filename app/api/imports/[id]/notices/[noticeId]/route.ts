import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noticeId: string }> }  // Changed importId to id
) {
  try {
    // Await params in Next.js 15+x
    const { id, noticeId } = await params;  // Changed importId to id
    
    // Add validation
    if (!id || !noticeId) {
      console.error("Missing params:", { id, noticeId });
      return NextResponse.json(
        { error: "Missing id or noticeId" },
        { status: 400 }
      );
    }

    console.log(`Fetching notice detail: importId=${id}, noticeId=${noticeId}`);

    // Call FastAPI backend
    const response = await fetch(
      `${BACKEND_URL}/imports/${encodeURIComponent(id)}/notices/${encodeURIComponent(noticeId)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Notice not found" },
          { status: 404 }
        );
      }

      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      console.error("Backend error:", errorData);
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch notice details" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched notice: ${data.titel || "No title"}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching notice detail:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch notice details",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}