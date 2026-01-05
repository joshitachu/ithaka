
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    // Send registration request to backend
    const vresp = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!vresp.ok) {
      const txt = await vresp.text().catch(() => "");
      return NextResponse.json(
        { error: "Registration failed", detail: txt },
        { status: vresp.status }
      );
    }

    const data = await vresp.json();
    const userCode = data?.code;

    if (!userCode) {
      return NextResponse.json(
        { error: "No code returned from backend" },
        { status: 500 }
      );
    }

    // Set HttpOnly cookie with the new user's code
    const maxAge = 7 * 24 * 60 * 60;
    const sameSite = "Lax";
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const res = NextResponse.json({ ok: true, code: userCode });
    res.headers.set(
      "Set-Cookie",
      `user_code=${userCode}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure}`
    );
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to register", detail: err?.message },
      { status: 500 }
    );
  }
}
