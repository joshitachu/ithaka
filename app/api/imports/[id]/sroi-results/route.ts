import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const importId = params.id;

    const userCode = request.headers.get("x-user-code") || request.cookies.get("user_code")?.value
    const headers: Record<string, string> = {}
    if (userCode) headers['X-User-Code'] = userCode

    const response = await fetch(`${BACKEND_URL}/imports/${importId}/sroi-results`, {
      cache: 'no-store',
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { detail: text };
      }
      
      return NextResponse.json(
        { error: data.detail || 'Failed to get SROI results' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting SROI results:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: importId } = await context.params

    const userCode = request.headers.get("x-user-code") || request.cookies.get("user_code")?.value
    const headers: Record<string, string> = {}
    if (userCode) headers['X-User-Code'] = userCode

    const response = await fetch(`${BACKEND_URL}/imports/${importId}/sroi-results`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = { detail: text }
      }

      return NextResponse.json(
        { error: data.detail || "Failed to delete SROI results" },
        { status: response.status }
      )
    }

    // meestal geen body nodig, maar voor de zekerheid doorzetten
    const data = await response
      .json()
      .catch(() => ({ detail: "SROI results deleted" }))

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error deleting SROI results:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
