import { NextResponse } from "next/server";

const RAW_BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, ""); // remove trailing slash

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const yearsParam = url.searchParams.get("years") || "5";

    if (!q) {
      return NextResponse.json(
        { error: "Parameter q (company name) is required" },
        { status: 400 }
      );
    }

    // Build URL using clean base
    const backendUrl = `${BACKEND_URL}/api/search/company?q=${encodeURIComponent(
      q
    )}&years=${yearsParam}`;

    const backendResponse = await fetch(backendUrl, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Backend search failed" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Error proxying to backend:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
