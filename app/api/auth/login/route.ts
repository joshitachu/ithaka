// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, username, password } = body;

    // Code-based login
    if (code) {
      const trimmedCode = code.toString().trim();
      if (!/^\d{12}$/.test(trimmedCode)) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
      }

      // Validate the code against the backend
      const vresp = await fetch(`${BACKEND_URL}/validate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmedCode }),
      });

      if (!vresp.ok) {
        const txt = await vresp.text().catch(() => "");
        return NextResponse.json(
          { error: "Code validation failed", detail: txt },
          { status: 401 }
        );
      }

      // Set HttpOnly cookie
      const maxAge = 7 * 24 * 60 * 60;
      const sameSite = "Lax";
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      const res = NextResponse.json({ ok: true });
      res.headers.set(
        "Set-Cookie",
        `user_code=${trimmedCode}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure}`
      );
      return res;
    }

    // Username/password login
    if (username && password) {
      // Validate credentials against the backend
      const vresp = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!vresp.ok) {
        const txt = await vresp.text().catch(() => "");
        return NextResponse.json(
          { error: "Login failed", detail: txt },
          { status: 401 }
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

      // Set HttpOnly cookie with the user's code
      const maxAge = 7 * 24 * 60 * 60;
      const sameSite = "Lax";
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      const res = NextResponse.json({ ok: true });
      res.headers.set(
        "Set-Cookie",
        `user_code=${userCode}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=${sameSite}${secure}`
      );
      return res;
    }

    return NextResponse.json(
      { error: "Code or username/password required" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to login", detail: err?.message },
      { status: 500 }
    );
  }
}
