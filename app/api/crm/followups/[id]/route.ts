import { NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

// PATCH - Update a followup in Salesforce
export async function PATCH(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    const body = await request.json()
    
    
    const response = await fetch(`${BACKEND_URL}/api/followups/${Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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

// DELETE a followup from Salesforce
export async function DELETE(request: Request, { params }: { params: Promise<{ Id: string }> }) {
  try {
    const { Id } = await params
    
    const response = await fetch(`${BACKEND_URL}/api/followups/${Id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
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