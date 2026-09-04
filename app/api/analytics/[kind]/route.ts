import { NextRequest, NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"

export async function GET(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!["buyers", "competitors", "re-tenders"].includes(kind)) return NextResponse.json({ error: "Unknown report" }, { status: 404 })
  const response = await fetch(`${BACKEND_URL}/analytics/${kind}${request.nextUrl.search}`, { headers: backendHeaders(request), cache: "no-store" })
  return NextResponse.json(await response.json(), { status: response.status })
}
