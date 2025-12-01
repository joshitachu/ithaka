import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  // Clear the user_code cookie by setting it expired
  const res = NextResponse.json({ ok: true, message: "Logged out" });
  // Set cookie to expired
  res.headers.set("Set-Cookie", `user_code=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);
  return res;
}
