import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000"

export async function GET(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const res = await fetch(`${BACKEND_URL}/crm/companies/${Id}`)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Error fetching company:", error)
    return NextResponse.json({ error: "Failed to fetch company", details: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const body = await request.json()

    const res = await fetch(`${BACKEND_URL}/crm/companies/${Id}`, {
      method: "PATCH",
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
    console.error("[API] Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company", details: error.message }, { status: 500 })
  }
}
