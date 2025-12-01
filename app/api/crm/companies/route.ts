import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")
    const status = searchParams.get("status")

    let url = `${BACKEND_URL}/crm/companies`
    const params = new URLSearchParams()
    if (q) params.append("q", q)
    if (status) params.append("status", status)
    if (params.toString()) url += `?${params.toString()}`

  const userCode = request.headers.get("x-user-code") || request.cookies.get("user_code")?.value
  const headers: Record<string, string> = {}
  if (userCode) headers["X-User-Code"] = userCode

  const res = await fetch(url, { headers })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies", details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const userCode = request.headers.get("x-user-code") || request.cookies.get("user_code")?.value
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (userCode) headers["X-User-Code"] = userCode

    const res = await fetch(`${BACKEND_URL}/crm/companies`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company", details: error.message }, { status: 500 })
  }
}
