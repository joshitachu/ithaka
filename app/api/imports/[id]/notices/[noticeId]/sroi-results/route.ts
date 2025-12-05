import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string; noticeId: string }> }
) {
  try {
    const { id: importId, noticeId } = await params

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const userCode = req.cookies.get("user_code")?.value

    if (!userCode) {
      return NextResponse.json({ error: "Unauthorized - no user code" }, { status: 401 })
    }

    const res = await fetch(
      `${backendUrl}/imports/${importId}/notices/${noticeId}/sroi-results`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Code": userCode,
        },
      },
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.detail || "Failed to fetch SROI results" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error fetching SROI results:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}