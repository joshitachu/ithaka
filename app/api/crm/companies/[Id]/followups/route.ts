import { NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"

// GET all followups for a company
export async function GET(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params

    const response = await fetch(`${BACKEND_URL}/crm/companies/${Id}/followups`, {
      method: "GET",
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to fetch followups: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching followups:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}

// POST - Create a new followup for a company
export async function POST(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/crm/companies/${Id}/followups`, {
      method: "POST",
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to create followup: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating followup:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}
