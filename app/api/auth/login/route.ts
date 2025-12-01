import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = (body?.code || "").toString().trim();
    if (!/^\d{12}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    // Validate the code against the backend (server-side validation)
    const vresp = await fetch(`${BACKEND_URL}/validate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!vresp.ok) {
      const txt = await vresp.text().catch(() => "")
      return NextResponse.json({ error: "Code validation failed", detail: txt }, { status: 401 });
    }

    // Set HttpOnly cookie with max-age 7 days
    const maxAge = 7 * 24 * 60 * 60; // seconds
    const sameSite = "Lax";
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    const res = NextResponse.json({ ok: true });
    res.headers.set(
      "Set-Cookie",
      `user_code=${code}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure}`
    );
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to login", detail: err?.message }, { status: 500 });
  }
}
