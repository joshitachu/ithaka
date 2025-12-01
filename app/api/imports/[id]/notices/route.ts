import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ unwrap the Promise
  const { id } = await params;

  try {
    const userCode = request.headers.get("x-user-code") || request.cookies.get("user_code")?.value
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (userCode) headers["X-User-Code"] = userCode

    const response = await fetch(`${BACKEND_URL}/imports/${id}/notices`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: "Failed to fetch notices", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to connect to backend", message: error.message },
      { status: 500 }
    );
  }
}
