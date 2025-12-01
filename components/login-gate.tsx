"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

const COOKIE_NAME = "user_code"

function setCookie(name: string, value: string, days = 7) {
  const maxAge = days * 24 * 60 * 60
  // Add SameSite and Secure where appropriate. Secure only when page is served over https
  const sameSite = "Lax"
  const secure = typeof window !== "undefined" && window.location && window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=${sameSite}${secure}`
}

function getLocalCode(): string | null {
  try {
    return window.localStorage.getItem(COOKIE_NAME)
  } catch {
    return null
  }
}

export default function LoginGate() {
  const [code, setCode] = useState("")
  const [requestedCode, setRequestedCode] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const c = getLocalCode()
    if (c && c.length === 12 && /^\d{12}$/.test(c)) {
      // Try to (re-)establish an HttpOnly cookie on the server by calling the login API.
      // If successful, the middleware and server-side proxies will see the cookie.
      (async () => {
        try {
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: c }),
          })
          if (r.ok) {
            setLoggedIn(true)
            // show loading for 3 seconds, then redirect
            setLoading(true)
            timerRef.current = window.setTimeout(() => router.push("/"), 3000)
          } else {
            // If server-side cookie couldn't be set, clear local stored code to force fresh login
            window.localStorage.removeItem(COOKIE_NAME)
          }
        } catch (e) {
          console.warn("Login re-establish failed", e)
        }
      })()
    }
  }, [])

  // prevent background scrolling while login gate is shown or while loading before redirect
  useEffect(() => {
    if (!loggedIn || loading) {
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = prev
      }
    }
    return
  }, [loggedIn, loading])

  // clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const v = code.trim()
    if (v.length !== 12 || !/^\d{12}$/.test(v)) {
      setError("Voer een geldige 12-cijfer code in")
      return
    }
    ;(async () => {
      try {
        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: v }),
        })
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          setError(j?.error || "Login failed")
          return
        }
  // Persist locally so we can re-auth on next load (HttpOnly cookie is set server-side)
  window.localStorage.setItem(COOKIE_NAME, v)
  setLoggedIn(true)
  setError(null)
  // show loading for 3 seconds, then redirect
  setLoading(true)
  timerRef.current = window.setTimeout(() => router.push("/"), 3000)
      } catch (err) {
        setError("Kon code niet verzenden")
      }
    })()
  }

  const requestCode = async () => {
    setRequesting(true)
    setError(null)
    try {
      const r = await fetch("/api/auth/request", { method: "POST" })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setError(j?.error || "Kon geen code aanvragen")
        setRequesting(false)
        return
      }
      const j = await r.json()
      if (j?.code) {
        // autofill the input and show the requested code
        setRequestedCode(j.code)
        setCode(j.code)
      } else {
        setError("Ongeldige respons van server")
      }
    } catch (e) {
      setError("Kon geen code aanvragen")
    } finally {
      setRequesting(false)
    }
  }

  const copyRequestedCode = async () => {
    if (!requestedCode) return
    try {
      await navigator.clipboard.writeText(requestedCode)
    } catch (e) {
      // ignore
    }
  }

  // show login form when not logged in; show loading overlay when logging in
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Bezig met inloggen…</h2>
          <p className="text-sm text-slate-600 mb-6">Even geduld, je wordt doorgestuurd.</p>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Inloggen</h2>
          <p className="text-sm text-slate-600 mb-4">Voer uw 12-cijferige toegangscode in om verder te gaan.</p>
          <form onSubmit={submit} className="space-y-4">
            <input
              autoFocus
              className="w-full border rounded px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456789012"
              maxLength={12}
              inputMode="numeric"
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button type="button" onClick={requestCode} disabled={requesting} className="bg-gray-200 text-slate-800 px-3 py-2 rounded">
                  {requesting ? "Aanvragen…" : "Vraag code aan"}
                </button>
                {requestedCode && (
                  <div className="ml-2 text-sm">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded">{requestedCode}</span>
                    <button type="button" onClick={copyRequestedCode} className="ml-2 text-xs text-blue-600">Kopieer</button>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Inloggen</button>
              </div>
            </div>
          </form>
          <p className="text-xs text-slate-400 mt-3">De code wordt lokaal opgeslagen en verzonden naar de backend als X-User-Code.</p>
        </div>
      </div>
    )
  }

  return null
}
