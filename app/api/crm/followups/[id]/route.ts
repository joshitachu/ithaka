import { NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"

// PATCH - Update a followup
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/crm/followups/${id}`, {
      method: "PATCH",
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to update followup: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating followup:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}

// DELETE a followup
// NOTE: the backend exposes no DELETE /crm/followups/{id}; this proxies through
// and will surface the backend's 405 until that route exists.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const response = await fetch(`${BACKEND_URL}/crm/followups/${id}`, {
      method: "DELETE",
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to delete followup: ${error}` }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting followup:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}
