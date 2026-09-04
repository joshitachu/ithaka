import { NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"

// GET a single company
export async function GET(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params

    const response = await fetch(`${BACKEND_URL}/crm/companies/${Id}`, {
      method: "GET",
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to fetch company: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}

// PATCH - Update a company
export async function PATCH(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/crm/companies/${Id}`, {
      method: "PATCH",
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to update company: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}

// DELETE a company
// NOTE: the backend exposes no DELETE /crm/companies/{id}; this proxies through
// and will surface the backend's 405 until that route exists.
export async function DELETE(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params

    const response = await fetch(`${BACKEND_URL}/crm/companies/${Id}`, {
      method: "DELETE",
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to delete company: ${error}` }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}
