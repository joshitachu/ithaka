import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

// POST /api/auth/request
export async function POST(request: NextRequest) {
  try {
    // Call backend to generate a code
    const resp = await fetch(`${BACKEND_URL}/auth/request-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      return NextResponse.json({ error: "Failed to request code", detail: txt }, { status: 500 });
    }

    const body = await resp.json().catch(() => ({}));
    if (!body || !body.code) {
      return NextResponse.json({ error: "Invalid response from backend" }, { status: 500 });
    }

    // Return the generated code to the client (no cookie set here)
    return NextResponse.json({ code: body.code });
  } catch (err: any) {
    return NextResponse.json({ error: "Request failed", detail: err?.message }, { status: 500 });
  }
}
