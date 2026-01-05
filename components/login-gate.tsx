"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Key, Eye, EyeOff, Building2 } from "lucide-react"

type LoginMethod = "credentials" | "code"
type AuthMode = "login" | "register"

export default function LoginGate() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("credentials")
  const [authMode, setAuthMode] = useState<AuthMode>("login")
  const [code, setCode] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [requestedCode, setRequestedCode] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const router = useRouter()
  const timerRef = useRef<number | null>(null)

  // Prevent background scrolling
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

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const submitCode = (e?: React.FormEvent) => {
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
        setLoggedIn(true)
        setError(null)
        setLoading(true)
        timerRef.current = window.setTimeout(() => router.push("/"), 3000)
      } catch (err) {
        setError("Kon code niet verzenden")
      }
    })()
  }

  const submitCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const u = username.trim()
    const p = password
    if (!u || !p) {
      setError("Vul gebruikersnaam en wachtwoord in")
      return
    }
    ;(async () => {
      try {
        const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register"
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p }),
        })
        if (!r.ok) {
          const j = await r.json().catch(() => ({}))
          setError(j?.error || (authMode === "login" ? "Login failed" : "Registratie mislukt"))
          return
        }
        const j = await r.json()
        if (authMode === "register" && j?.code) {
          setRequestedCode(j.code)
          setShowCodeModal(true)
        }
        setLoggedIn(true)
        setError(null)
        setLoading(true)
        timerRef.current = window.setTimeout(() => router.push("/"), 3000)
      } catch (err) {
        setError("Kon niet verzenden")
      }
    })()
  }

  const copyRequestedCode = async () => {
    if (!requestedCode) return
    try {
      await navigator.clipboard.writeText(requestedCode)
    } catch (e) {
      // ignore
    }
  }

  if (showCodeModal && requestedCode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Success Header */}
          <div className="p-6 text-center border-b border-[#2a2a2a]">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Account Created!</h2>
            <p className="text-sm text-[#888]">Your access code has been generated</p>
          </div>

          {/* Code Display */}
          <div className="p-6">
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 mb-4">
              <label className="block text-xs font-medium text-[#888] mb-3 uppercase tracking-wide text-center">
                Your Access Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#1a1a1a] border border-green-500/30 px-4 py-3 rounded-md font-mono text-lg tracking-wider text-center text-green-400">
                  {requestedCode}
                </code>
                <button
                  onClick={copyRequestedCode}
                  className="px-4 py-3 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-md transition-colors whitespace-nowrap text-sm font-medium"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <p className="text-xs text-amber-400 flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span>Save this code securely. You can use it to login without your username and password.</span>
              </p>
            </div>

            <button
              onClick={() => {
                setShowCodeModal(false)
                setLoading(true)
                timerRef.current = window.setTimeout(() => router.push("/"), 3000)
              }}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-2.5 rounded-md transition-colors text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-8 w-full max-w-sm shadow-2xl text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-[#2563eb]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2563eb]/20">
              <Building2 className="w-8 h-8 text-[#2563eb]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Bezig met inloggen</h2>
            <p className="text-sm text-[#888]">Even geduld...</p>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#2a2a2a] border-t-[#2563eb]" />
          </div>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 text-center border-b border-[#2a2a2a]">
            <div className="w-16 h-16 bg-[#2563eb]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#2563eb]/20">
              <Building2 className="w-8 h-8 text-[#2563eb]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-1">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-sm text-[#888]">
              {authMode === "login" ? "Log in to continue" : "Sign up to get started"}
            </p>
          </div>

          <div className="p-6">
            {/* Method Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  setLoginMethod("credentials")
                  setError(null)
                }}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  loginMethod === "credentials"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-[#888] hover:text-white hover:bg-[#232323]"
                }`}
              >
                <User className="w-4 h-4" />
                Account
              </button>
              <button
                onClick={() => {
                  setLoginMethod("code")
                  setError(null)
                }}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  loginMethod === "code"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-[#888] hover:text-white hover:bg-[#232323]"
                }`}
              >
                <Key className="w-4 h-4" />
                Code
              </button>
            </div>

            {/* Credentials Login/Register */}
            {loginMethod === "credentials" && (
              <form onSubmit={submitCredentials} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-2 uppercase tracking-wide">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      autoFocus
                      type="text"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-md focus:border-[#2563eb] focus:outline-none transition-colors text-white text-sm placeholder-[#555]"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-2 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-md focus:border-[#2563eb] focus:outline-none transition-colors text-white text-sm placeholder-[#555]"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete={authMode === "login" ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#888] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2.5 rounded-md text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-2.5 rounded-md transition-colors text-sm"
                >
                  {authMode === "login" ? "Login" : "Sign Up"}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "register" : "login")
                      setError(null)
                    }}
                    className="text-xs text-[#888] hover:text-white transition-colors"
                  >
                    {authMode === "login"
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Login"}
                  </button>
                </div>
              </form>
            )}

            {/* Code Login */}
            {loginMethod === "code" && (
              <form onSubmit={submitCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-2 uppercase tracking-wide">
                    Access Code
                  </label>
                  <input
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[#0f0f0f] border border-[#2a2a2a] rounded-md focus:border-[#2563eb] focus:outline-none transition-colors font-mono text-base tracking-wider text-center text-white placeholder-[#555]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000000000"
                    maxLength={12}
                    inputMode="numeric"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2.5 rounded-md text-xs">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium py-2.5 rounded-md transition-colors text-sm"
                >
                  Login
                </button>

                <p className="text-xs text-[#666] text-center">
                  No code? Create an account to get one
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}