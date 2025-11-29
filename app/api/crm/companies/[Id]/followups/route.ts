import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const res = await fetch(`${BACKEND_URL}/crm/companies/${Id}/followups`)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Error fetching followups:", error)
    return NextResponse.json({ error: "Failed to fetch followups", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/crm/companies/${Id}/followups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Error creating followup:", error)
    return NextResponse.json({ error: "Failed to create followup", details: error.message }, { status: 500 })
  }
}
