import { NextResponse } from "next/server"
import { BACKEND_URL, backendHeaders } from "@/lib/backend"

// GET all companies
export async function GET(request: Request) {
  try {
    const response = await fetch(`${BACKEND_URL}/crm/companies`, {
      method: "GET",
      headers: backendHeaders(request),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to fetch companies: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}

// POST - Create a new company
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/crm/companies`, {
      method: "POST",
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ error: `Failed to create company: ${error}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 })
  }
}
