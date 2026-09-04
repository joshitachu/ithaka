// Shared helpers for proxying to the FastAPI backend.

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

/**
 * Build the headers for a backend call, forwarding the caller's user code.
 *
 * The backend guards most endpoints with `validate_user_code`, which reads the
 * `X-User-Code` header. Browsers only carry the HttpOnly `user_code` cookie set
 * by /api/auth/login, so every proxy route has to translate cookie -> header.
 */
export function backendHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }

  const userCode =
    request.headers.get("x-user-code") || readCookie(request, "user_code")
  if (userCode) headers["X-User-Code"] = userCode

  return headers
}

function readCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie")
  if (!cookie) return undefined

  for (const part of cookie.split(";")) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return undefined
}
