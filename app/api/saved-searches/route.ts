import { NextRequest, NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"
export async function GET(request: NextRequest) { const r = await fetch(`${BACKEND_URL}/saved-searches`, { headers: backendHeaders(request), cache: "no-store" }); return NextResponse.json(await r.json(), { status: r.status }) }
export async function POST(request: NextRequest) { const r = await fetch(`${BACKEND_URL}/saved-searches`, { method: "POST", headers: backendHeaders(request), body: await request.text() }); return NextResponse.json(await r.json(), { status: r.status }) }
