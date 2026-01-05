
// app/api/auth/request/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Request a new code from backend
    const vresp = await fetch(`${BACKEND_URL}/auth/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!vresp.ok) {
      const txt = await vresp.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to request code", detail: txt },
        { status: vresp.status }
      );
    }

    const data = await vresp.json();
    return NextResponse.json({ code: data?.code });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to request code", detail: err?.message },
      { status: 500 }
    );
  }
}