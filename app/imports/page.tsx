"use client"
import { useEffect, useState } from "react"
import {
  Calendar,
  Filter,
  TrendingUp,
  Sparkles,
  Plus,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Trash2,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"

type ImportRow = {
  id: string
  name: string
  date_from: string | null
  date_to: string | null
  total_records: number | null
  created_at: string
}

type SROIStatus = {
  status: "not_started" | "pending" | "running" | "completed" | "failed"
  progress: number
  current: number
  total: number
  results_summary?: {
    total: number
    compliant: number
    non_compliant: number
    compliance_rate: number
    average_score: number
  }
  error?: string
}

type SROIResult = {
  id: number
  notice_id: string
  publicatie_id: string | null
  winner_name: string | null
  analyzed_url: string | null
  url_source: string | null
  sroi_compliant: boolean
  confidence: string
  score: number
  evidence: string[]
  summary: string
  pages_checked: number
  error: string | null
}

type Toast = {
  type: "success" | "error" | "info" | "warning"
  message: string
}

type PendingAction = { type: "deleteImport"; importId: string } | { type: "deleteSROI"; importId: string } | null

export default function ImportsPage() {
  const router = useRouter()
  const [imports, setImports] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [cpvList, setCpvList] = useState<{ code: string; label: string }[]>([])
  const [selectedCpvCode, setSelectedCpvCode] = useState<string>("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [message, setMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sroiStatus, setSroiStatus] = useState<Record<string, SROIStatus>>({})
  const [sroiResults, setSroiResults] = useState<SROIResult[]>([])
  const [viewingSROI, setViewingSROI] = useState<string | null>(null)
  const [loadingSROI, setLoadingSROI] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  const showToast = (payload: Toast) => {
    setToast(payload)
  }

  const closeToast = () => setToast(null)

  const loadImports = async () => {
    const res = await fetch("/api/imports")
    const data = await res.json()
    setImports(data)
    if (data && data.length > 0) {
      for (const imp of data) {
        checkSROIStatus(imp.id)
      }
    }
  }

  const checkSROIStatus = async (importId: string) => {
    try {
      const res = await fetch(`/api/imports/${importId}/sroi-status`)
      const data = await res.json()
      if (data && data.status) {
        setSroiStatus((prev) => ({
          ...prev,
          [importId]: data,
        }))
      }
    } catch (err) {
      console.error(`Error checking SROI status for ${importId}:`, err)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/cpv")
        if (!res.ok) {
          console.warn("CPV API not available or returned error:", res.status)
          return
        }
        const contentType = res.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("CPV API did not return JSON")
          return
        }
        const data = await res.json()
        setCpvList(data || [])
      } catch (err) {
        console.error("Failed to load CPV list", err)
        // Silently fail - CPV list is optional
      }
    }
    load()
    loadImports()
  }, [])

  useEffect(() => {
    const runningImports = Object.entries(sroiStatus)
      .filter(([_, status]) => status.status === "running" || status.status === "pending")
      .map(([id]) => id)
    if (runningImports.length === 0) return

    const interval = setInterval(async () => {
      for (const importId of runningImports) {
        try {
          const res = await fetch(`/api/imports/${importId}/sroi-status`)
          const data = await res.json()
          setSroiStatus((prev) => ({
            ...prev,
            [importId]: data,
          }))
        } catch (err) {
          console.error("Error polling SROI status:", err)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sroiStatus])

  const handleStartImport = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const payload: any = {
        date_from: dateFrom,
        date_to: dateTo,
      }
      if (selectedCpvCode) {
        payload.cpv_codes = [selectedCpvCode]
      }
      if (selectedRegion) {
        payload.region = selectedRegion
      }
      const res = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = `Fout bij import: ${data.detail || "onbekende fout"}`
        setMessage(msg)
        showToast({ type: "error", message: msg })
      } else {
        const msg = `Import gestart: ${data.name} (${data.total_records} records)`
        setMessage(msg)
        showToast({ type: "success", message: msg })
        await loadImports()
      }
    } catch (err: any) {
      const msg = `Fout: ${err.message}`
      setMessage(msg)
      showToast({ type: "error", message: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (id: string, format: "excel" | "csv") => {
    const url = `/api/imports/${id}/download?format=${format}`
    window.location.href = url
  }

  const handleStartSROI = async (importId: string) => {
    try {
      const res = await fetch(`/api/imports/${importId}/sroi-analyze`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 400 && data.error?.includes("bestaan al SROI resultaten")) {
          showToast({
            type: "warning",
            message:
              "Er zijn al SROI resultaten voor deze import. Klik op 'Resultaten' om ze te bekijken, of 'Reset' om opnieuw te analyseren.",
          })
        } else {
          showToast({
            type: "error",
            message: `Fout: ${data.error || data.detail || "Onbekende fout"}`,
          })
        }
        return
      }
      setSroiStatus((prev) => ({
        ...prev,
        [importId]: {
          status: "pending",
          progress: 0,
          current: 0,
          total: 0,
        },
      }))
      showToast({
        type: "info",
        message: "SROI analyse gestart! De analyse draait op de achtergrond.",
      })
    } catch (err: any) {
      showToast({
        type: "error",
        message: `Fout bij starten SROI analyse: ${err.message}`,
      })
    }
  }

  const handleViewSROI = async (importId: string) => {
    setViewingSROI(importId)
    setLoadingSROI(true)
    setSroiResults([])
    try {
      const res = await fetch(`/api/imports/${importId}/sroi-results`)
      const data = await res.json()
      setSroiResults(data.results || [])
      if (data.summary) {
        setSroiStatus((prev) => ({
          ...prev,
          [importId]: {
            status: "completed",
            progress: 100,
            current: data.summary.total,
            total: data.summary.total,
            results_summary: data.summary,
          },
        }))
      }
    } catch (err) {
      console.error("Fout bij ophalen SROI resultaten:", err)
      setSroiResults([])
      showToast({
        type: "error",
        message: "Fout bij ophalen SROI resultaten.",
      })
    } finally {
      setLoadingSROI(false)
    }
  }

  const handleDeleteImport = (importId: string) => {
    setPendingAction({ type: "deleteImport", importId })
  }

  const handleDeleteSROI = (importId: string) => {
    setPendingAction({ type: "deleteSROI", importId })
  }

  const performDeleteImport = async () => {
    if (!pendingAction || pendingAction.type !== "deleteImport") return
    const importId = pendingAction.importId
    try {
      const res = await fetch(`/api/imports/${importId}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        showToast({
          type: "error",
          message: data.error || data.detail || "Fout bij verwijderen van import",
        })
        return
      }
      setImports((prev) => prev.filter((imp) => imp.id !== importId))
      setSroiStatus((prev) => {
        const copy = { ...prev }
        delete copy[importId]
        return copy
      })
      if (viewingSROI === importId) {
        setViewingSROI(null)
        setSroiResults([])
      }
      showToast({ type: "success", message: "Import succesvol verwijderd" })
    } catch (err: any) {
      console.error("Error deleting import:", err)
      showToast({
        type: "error",
        message: `Fout bij verwijderen van import: ${err.message}`,
      })
    } finally {
      setPendingAction(null)
    }
  }

  const performDeleteSROI = async () => {
    if (!pendingAction || pendingAction.type !== "deleteSROI") return
    const importId = pendingAction.importId
    try {
      const res = await fetch(`/api/imports/${importId}/sroi-results`, {
        method: "DELETE",
      })
      if (res.ok) {
        setSroiStatus((prev) => {
          const newStatus = { ...prev }
          delete newStatus[importId]
          return newStatus
        })
        if (viewingSROI === importId) {
          setViewingSROI(null)
          setSroiResults([])
        }
        showToast({ type: "success", message: "SROI resultaten verwijderd" })
      } else {
        showToast({
          type: "error",
          message: "Fout bij verwijderen van SROI resultaten",
        })
      }
    } catch (err: any) {
      showToast({
        type: "error",
        message: `Fout bij verwijderen: ${err.message}`,
      })
    } finally {
      setPendingAction(null)
    }
  }

  const filteredImports = imports.filter((imp) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      imp.name.toLowerCase().includes(query) ||
      imp.date_from?.toLowerCase().includes(query) ||
      imp.date_to?.toLowerCase().includes(query)
    )
  })

  const currentImport = viewingSROI ? imports.find((imp) => imp.id === viewingSROI) : null
  const currentSummary = viewingSROI ? sroiStatus[viewingSROI]?.results_summary : undefined

  const isDeleteImportAction = pendingAction?.type === "deleteImport"
  const isDeleteSROIAction = pendingAction?.type === "deleteSROI"

  return (
    <>
      {/* Toast - Mobile optimized */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 z-50">
          <div className="max-w-sm mx-auto sm:mx-0 rounded-2xl border border-slate-200 bg-white shadow-lg px-4 py-3 flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
              {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-red-600" />}
              {toast.type === "info" && <Sparkles className="w-5 h-5 text-blue-600" />}
              {toast.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            </div>
            <div className="flex-1 text-sm text-slate-800">{toast.message}</div>
            <button onClick={closeToast} className="p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Confirm dialog - Mobile optimized */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPendingAction(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {isDeleteImportAction ? "Import verwijderen" : "SROI resultaten verwijderen"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {isDeleteImportAction
                      ? "Weet je zeker dat je deze import (en alle gekoppelde data) permanent wilt verwijderen? Dit kan niet ongedaan worden."
                      : "Weet je zeker dat je de SROI resultaten wilt verwijderen? Dit kan niet ongedaan worden."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPendingAction(null)}
                className="p-1 shrink-0 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingAction(null)}
                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuleer
              </button>
              <button
                onClick={isDeleteImportAction ? performDeleteImport : performDeleteSROI}
                className="w-full sm:w-auto px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Ja, verwijderen
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Header - Mobile optimized */}
          <header className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Imports</h1>
            <p className="text-sm sm:text-base text-slate-600">
              Importeer en beheer TenderNed gegevens met geavanceerde filtering en SROI-analyse
            </p>
          </header>

          {/* Nieuwe Import - Mobile optimized */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Nieuwe Import</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Vul een datumbereik in en start de import. De resultaten kunnen daarna op SROI worden geanalyseerd.
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartImport}
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                {loading ? "Bezig..." : "Start Import"}
              </button>
            </div>

            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-sm text-blue-900">{message}</p>
              </div>
            )}

            {/* Form grid - Mobile stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Datumbereik */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Datumbereik</h3>
                    <p className="text-xs text-slate-600">Selecteer periode</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Van</label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Tot</label>
                    <input
                      type="date"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* CPV */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">CPV Filters</h3>
                    <p className="text-xs text-slate-600">Optioneel</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">CPV codes</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={selectedCpvCode}
                    onChange={(e) => setSelectedCpvCode(e.target.value)}
                  >
                    <option value="">-- Kies een CPV --</option>
                    {cpvList.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Regio */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 shrink-0 bg-orange-600 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Regio Filter</h3>
                    <p className="text-xs text-slate-600">Optioneel</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Provincie</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">-- Kies een provincie --</option>
                    <option value="Drenthe">Drenthe</option>
                    <option value="Flevoland">Flevoland</option>
                    <option value="Friesland">Friesland</option>
                    <option value="Gelderland">Gelderland</option>
                    <option value="Groningen">Groningen</option>
                    <option value="Limburg">Limburg</option>
                    <option value="Noord-Brabant">Noord-Brabant</option>
                    <option value="Noord-Holland">Noord-Holland</option>
                    <option value="Overijssel">Overijssel</option>
                    <option value="Utrecht">Utrecht</option>
                    <option value="Zeeland">Zeeland</option>
                    <option value="Zuid-Holland">Zuid-Holland</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Import Geschiedenis - Mobile optimized */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 shrink-0 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">Import Geschiedenis</h2>
                  <p className="text-xs sm:text-sm text-slate-600">{filteredImports.length} imports gevonden</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Zoek imports..."
                  className="w-full sm:w-64 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Mobile: Card view, Desktop: Table view */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Naam</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Datum Van</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Datum Tot</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Records</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">SROI Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredImports.map((imp) => {
                    const status = sroiStatus[imp.id]
                    const hasResults = status?.status === "completed"
                    const isAnalyzing = status?.status === "running" || status?.status === "pending"
                    return (
                      <tr
                        key={imp.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/import/${imp.id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-slate-900">{imp.name}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{imp.date_from || "-"}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{imp.date_to || "-"}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{imp.total_records ?? 0}</td>
                        <td className="py-3 px-4">
                          {status?.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Voltooid
                            </span>
                          ) : status?.status === "running" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                              Bezig {status.progress.toFixed(0)}%
                            </span>
                          ) : status?.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                              In wachtrij
                            </span>
                          ) : status?.status === "failed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              Mislukt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                              Niet gestart
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDownload(imp.id, "excel")}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download Excel"
                            >
                              <Download className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDownload(imp.id, "csv")}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Download CSV"
                            >
                              <Download className="w-4 h-4 text-slate-600" />
                            </button>
                            {!hasResults && !isAnalyzing && (
                              <button
                                onClick={() => handleStartSROI(imp.id)}
                                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                Start SROI
                              </button>
                            )}
                            {hasResults && (
                              <>
                                <button
                                  onClick={() => handleViewSROI(imp.id)}
                                  className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  Resultaten
                                </button>
                                <button
                                  onClick={() => handleDeleteSROI(imp.id)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Reset
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteImport(imp.id)}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors flex items-center gap-1"
                              title="Verwijder volledige import"
                            >
                              <Trash2 className="w-3 h-3" />
                              Verwijder
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredImports.map((imp) => {
                const status = sroiStatus[imp.id]
                const hasResults = status?.status === "completed"
                const isAnalyzing = status?.status === "running" || status?.status === "pending"
                return (
                  <div
                    key={imp.id}
                    className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3"
                    onClick={() => router.push(`/import/${imp.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm">{imp.name}</h3>
                        <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                          <p>Van: {imp.date_from || "-"}</p>
                          <p>Tot: {imp.date_to || "-"}</p>
                          <p>Records: {imp.total_records ?? 0}</p>
                        </div>
                      </div>
                      <div>
                        {status?.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />
                            Voltooid
                          </span>
                        ) : status?.status === "running" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap">
                            {status.progress.toFixed(0)}%
                          </span>
                        ) : status?.status === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                            Wachtrij
                          </span>
                        ) : status?.status === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium whitespace-nowrap">
                            <AlertTriangle className="w-3 h-3" />
                            Fout
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium whitespace-nowrap">
                            Niet gestart
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions for mobile */}
                    <div
                      className="flex flex-wrap gap-2 pt-2 border-t border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleDownload(imp.id, "excel")}
                        className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Excel
                      </button>
                      <button
                        onClick={() => handleDownload(imp.id, "csv")}
                        className="flex-1 min-w-[100px] px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                      </button>
                      {!hasResults && !isAnalyzing && (
                        <button
                          onClick={() => handleStartSROI(imp.id)}
                          className="w-full px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Start SROI
                        </button>
                      )}
                      {hasResults && (
                        <>
                          <button
                            onClick={() => handleViewSROI(imp.id)}
                            className="flex-1 min-w-[120px] px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Resultaten
                          </button>
                          <button
                            onClick={() => handleDeleteSROI(imp.id)}
                            className="flex-1 min-w-[100px] px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Reset
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteImport(imp.id)}
                        className="w-full px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Verwijder Import
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* SROI Resultaten panel - Mobile optimized */}
        {viewingSROI && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => {
                setViewingSROI(null)
                setSroiResults([])
              }}
            />
            <div className="relative ml-auto h-full w-full sm:max-w-2xl lg:max-w-3xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="truncate">SROI Resultaten</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {currentImport ? `Import: ${currentImport.name}` : `Import ID: ${viewingSROI}`}
                  </p>
                  {currentSummary && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 font-medium rounded-lg whitespace-nowrap">
                        ✅ {currentSummary.compliant}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 font-medium rounded-lg whitespace-nowrap">
                        ❌ {currentSummary.non_compliant}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded-lg whitespace-nowrap">
                        📊 {currentSummary.compliance_rate.toFixed(1)}%
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 font-medium rounded-lg whitespace-nowrap">
                        ⭐ {currentSummary.average_score.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setViewingSROI(null)
                    setSroiResults([])
                  }}
                  className="p-2 shrink-0 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {loadingSROI ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-slate-600 text-sm">Resultaten laden...</p>
                    </div>
                  </div>
                ) : sroiResults.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">Geen SROI resultaten beschikbaar.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sroiResults.map((result) => (
                      <div
                        key={result.id}
                        className={`border rounded-xl p-4 sm:p-5 ${
                          result.sroi_compliant
                            ? "bg-green-50 border-green-200"
                            : result.error
                              ? "bg-red-50 border-red-200"
                              : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-base sm:text-lg truncate">
                                {result.winner_name || "Onbekend bedrijf"}
                              </h3>
                              {result.sroi_compliant ? (
                                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">
                                  ✅
                                </span>
                              ) : result.error ? (
                                <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">
                                  ❌
                                </span>
                              ) : (
                                <span className="px-2 sm:px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg whitespace-nowrap shrink-0">
                                  ❌
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4 text-sm">
                              <div className="text-center">
                                <div
                                  className={`text-xl sm:text-2xl font-bold ${
                                    result.score >= 10
                                      ? "text-green-600"
                                      : result.score >= 5
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {result.score}
                                </div>
                                <div className="text-xs text-slate-600">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-base sm:text-lg font-semibold text-slate-700 capitalize">
                                  {result.confidence}
                                </div>
                                <div className="text-xs text-slate-600">Conf.</div>
                              </div>
                              <div className="text-center">
                                <div className="text-base sm:text-lg font-semibold text-slate-700">
                                  {result.pages_checked}
                                </div>
                                <div className="text-xs text-slate-600">Pag.</div>
                              </div>
                            </div>
                          </div>

                          {result.analyzed_url && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span className="text-xs font-medium text-slate-600 shrink-0">URL:</span>
                              <a
                                href={result.analyzed_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs sm:text-sm text-blue-600 hover:underline break-all"
                              >
                                {result.analyzed_url}
                              </a>
                            </div>
                          )}

                          {result.evidence && result.evidence.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-slate-600 mb-2 block">Bewijs:</span>
                              <div className="space-y-1">
                                {result.evidence.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs sm:text-sm text-slate-700 bg-white rounded-lg px-3 py-2 border border-slate-200"
                                  >
                                    • {item}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {(result.summary || result.error) && (
                            <div>
                              <span className="text-xs font-medium text-slate-600 mb-2 block">
                                {result.error ? "Foutmelding:" : "Samenvatting:"}
                              </span>
                              <div
                                className={`text-xs sm:text-sm leading-relaxed ${
                                  result.error ? "text-red-700" : "text-slate-700"
                                } bg-white rounded-lg px-3 py-2 border ${
                                  result.error ? "border-red-200" : "border-slate-200"
                                }`}
                              >
                                {result.error || result.summary}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
