"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Plus,
  Calendar,
  Mail,
  Phone,
  Globe,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Info,
} from "lucide-react"

type Company = {
  id: number
  name: string
  website: string | null
  kvk: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  source_notice_id: string | null
  lead_status: string
  last_contacted: string | null
  notes: string | null
  extra: any
  created_at: string
  updated_at: string
}

type Followup = {
  id: number
  company_id: number
  scheduled_at: string | null
  completed: boolean
  emailed: boolean
  action: string | null
  note: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

type Notification = {
  id: number
  type: "success" | "error" | "info"
  message: string
}

export default function CRMPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [followups, setFollowups] = useState<Followup[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFollowupModal, setShowFollowupModal] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Form states
  const [formName, setFormName] = useState("")
  const [formWebsite, setFormWebsite] = useState("")
  const [formKvk, setFormKvk] = useState("")
  const [formContactName, setFormContactName] = useState("")
  const [formContactEmail, setFormContactEmail] = useState("")
  const [formContactPhone, setFormContactPhone] = useState("")
  const [formStatus, setFormStatus] = useState("new")
  const [formNotes, setFormNotes] = useState("")

  // Followup form
  const [followupAction, setFollowupAction] = useState("")
  const [followupNote, setFollowupNote] = useState("")
  const [followupScheduled, setFollowupScheduled] = useState("")

  useEffect(() => {
    loadCompanies()
  }, [])

  const showNotification = (type: Notification["type"], message: string) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, type, message }])

    // Auto-dismiss na 4 seconden
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 4000)
  }

  const loadCompanies = async () => {
    setLoading(true)
    try {
      let url = "/api/crm/companies"
      const params = new URLSearchParams()
      if (searchQuery) params.append("q", searchQuery)
      if (statusFilter) params.append("status", statusFilter)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) {
        showNotification("error", data.error || "Fout bij laden van bedrijven")
        setCompanies([])
      } else {
        setCompanies(data)
      }
    } catch (err) {
      console.error("Fout bij laden van bedrijven", err)
      showNotification("error", "Fout bij laden van bedrijven")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadCompanies()
  }

  const handleAddCompany = async () => {
    if (!formName.trim()) {
      showNotification("error", "Bedrijfsnaam is verplicht")
      return
    }
    try {
      const payload = {
        name: formName,
        website: formWebsite || null,
        kvk: formKvk || null,
        contact_name: formContactName || null,
        contact_email: formContactEmail || null,
        contact_phone: formContactPhone || null,
        lead_status: formStatus,
        notes: formNotes || null,
      }
      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification("error", data.error || "Fout bij toevoegen bedrijf")
        return
      }
      showNotification("success", "Bedrijf succesvol toegevoegd!")
      setShowAddModal(false)
      resetForm()
      loadCompanies()
    } catch (err) {
      console.error("Fout bij toevoegen bedrijf", err)
      showNotification("error", "Fout bij toevoegen bedrijf")
    }
  }

  const handleUpdateStatus = async (companyId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification("error", data.error || "Fout bij updaten status")
        return
      }
      showNotification("success", "Status bijgewerkt")
      loadCompanies()
    } catch (err) {
      console.error("Fout bij updaten status", err)
      showNotification("error", "Fout bij updaten status")
    }
  }

  const handleViewDetails = async (company: Company) => {
    setSelectedCompany(company)
    // Load followups
    try {
      const res = await fetch(`/api/crm/companies/${company.id}/followups`)
      const data = await res.json()
      if (!res.ok || !Array.isArray(data)) {
        setFollowups([])
        if (!res.ok) {
          showNotification("error", data.error || "Fout bij laden van follow-ups")
        }
      } else {
        setFollowups(data)
      }
    } catch (err) {
      console.error("Fout bij laden followups", err)
      setFollowups([])
      showNotification("error", "Fout bij laden van follow-ups")
    }
  }

  const handleAddFollowup = async () => {
    if (!selectedCompany) return
    try {
      const payload = {
        action: followupAction,
        note: followupNote,
        scheduled_at: followupScheduled || null,
        completed: false,
        emailed: false,
      }
      const res = await fetch(`/api/crm/companies/${selectedCompany.id}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification("error", data.error || "Fout bij toevoegen followup")
        return
      }
      showNotification("success", "Follow-up succesvol toegevoegd!")
      setShowFollowupModal(false)
      setFollowupAction("")
      setFollowupNote("")
      setFollowupScheduled("")
      handleViewDetails(selectedCompany)
    } catch (err) {
      console.error("Fout bij toevoegen followup", err)
      showNotification("error", "Fout bij toevoegen followup")
    }
  }

  const resetForm = () => {
    setFormName("")
    setFormWebsite("")
    setFormKvk("")
    setFormContactName("")
    setFormContactEmail("")
    setFormContactPhone("")
    setFormStatus("new")
    setFormNotes("")
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      new: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: <Clock className="w-3 h-3" />,
      },
      contacted: {
        bg: "bg-amber-100",
        text: "text-amber-700",
        icon: <Mail className="w-3 h-3" />,
      },
      interested: {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      not_interested: {
        bg: "bg-slate-100",
        text: "text-slate-700",
        icon: <XCircle className="w-3 h-3" />,
      },
    }
    const config = statusConfig[status] || statusConfig.new
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {status}
      </span>
    )
  }

  const getNotificationStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-600 text-white"
      case "error":
        return "bg-red-600 text-white"
      case "info":
      default:
        return "bg-slate-800 text-white"
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4" />
      case "error":
        return <XCircle className="w-4 h-4" />
      case "info":
      default:
        return <Info className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-3 sm:p-6 pt-16 md:pt-6 pb-20 md:pb-6">
      {/* Toast Notifications */}
      <div className="fixed inset-x-0 top-4 flex justify-center z-[80] pointer-events-none">
        <div className="w-full max-w-sm mx-4 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-lg px-4 py-3 text-sm ${getNotificationStyles(
                n.type,
              )}`}
            >
              <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
              <div className="flex-1">{n.message}</div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                className="ml-2 rounded-full p-1 hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/")}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">CRM</h1>
                <p className="text-sm sm:text-base text-slate-600">Beheer je leads en contacten</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nieuw Bedrijf</span>
              <span className="sm:hidden">Toevoegen</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Zoek op bedrijfsnaam..."
                className="w-full border border-slate-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
              />
            </div>
            <select
              className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Alle statussen</option>
              <option value="new">Nieuw</option>
              <option value="contacted">Gecontacteerd</option>
              <option value="interested">Geïnteresseerd</option>
              <option value="not_interested">Niet geïnteresseerd</option>
            </select>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 sm:px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Zoeken</span>
            </button>
          </div>
        </div>

        {/* Companies List */}
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Bedrijven ({companies.length})</h3>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Laden...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">Geen bedrijven gevonden</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left p-3 font-semibold text-slate-900">Bedrijf</th>
                      <th className="text-left p-3 font-semibold text-slate-900">KVK</th>
                      <th className="text-left p-3 font-semibold text-slate-900">Contact</th>
                      <th className="text-left p-3 font-semibold text-slate-900">Status</th>
                      <th className="text-left p-3 font-semibold text-slate-900">Aangemaakt</th>
                      <th className="text-right p-3 font-semibold text-slate-900">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-slate-900">{company.name}</div>
                          {company.website && (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                            >
                              <Globe className="w-3 h-3" />
                              {company.website}
                            </a>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-mono text-xs text-slate-700">{company.kvk || "-"}</span>
                        </td>
                        <td className="p-3">
                          {company.contact_name && <div className="text-slate-700">{company.contact_name}</div>}
                          {company.contact_email && (
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {company.contact_email}
                            </div>
                          )}
                          {company.contact_phone && (
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {company.contact_phone}
                            </div>
                          )}
                          {!company.contact_name && !company.contact_email && !company.contact_phone && (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <select
                            value={company.lead_status}
                            onChange={(e) => handleUpdateStatus(company.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          >
                            <option value="new">Nieuw</option>
                            <option value="contacted">Gecontacteerd</option>
                            <option value="interested">Geïnteresseerd</option>
                            <option value="not_interested">Niet geïnteresseerd</option>
                          </select>
                        </td>
                        <td className="p-3 text-slate-600 text-xs">
                          {new Date(company.created_at).toLocaleDateString("nl-NL")}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleViewDetails(company)}
                            className="px-3 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{company.name}</h4>
                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                      <div>{getStatusBadge(company.lead_status)}</div>
                    </div>

                    {company.kvk && (
                      <div className="text-xs text-slate-600 mb-2">
                        <span className="font-medium">KVK:</span> <span className="font-mono">{company.kvk}</span>
                      </div>
                    )}

                    {(company.contact_name || company.contact_email || company.contact_phone) && (
                      <div className="space-y-1 mb-3">
                        {company.contact_name && <div className="text-sm text-slate-700">{company.contact_name}</div>}
                        {company.contact_email && (
                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {company.contact_email}
                          </div>
                        )}
                        {company.contact_phone && (
                          <div className="text-xs text-slate-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {company.contact_phone}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                      <select
                        value={company.lead_status}
                        onChange={(e) => handleUpdateStatus(company.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 flex-1"
                      >
                        <option value="new">Nieuw</option>
                        <option value="contacted">Gecontacteerd</option>
                        <option value="interested">Geïnteresseerd</option>
                        <option value="not_interested">Niet geïnteresseerd</option>
                      </select>
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add Company Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Nieuw Bedrijf Toevoegen</h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      resetForm()
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bedrijfsnaam *</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">KVK Nummer</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formKvk}
                    onChange={(e) => setFormKvk(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contactpersoon</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefoon</label>
                  <input
                    type="tel"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formContactPhone}
                    onChange={(e) => setFormContactPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="new">Nieuw</option>
                    <option value="contacted">Gecontacteerd</option>
                    <option value="interested">Geïnteresseerd</option>
                    <option value="not_interested">Niet geïnteresseerd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notities</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[100px]"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddCompany}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Company Details Modal */}
        {selectedCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{selectedCompany.name}</h2>
                    <div>{getStatusBadge(selectedCompany.lead_status)}</div>
                  </div>
                  <button
                    onClick={() => setSelectedCompany(null)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Contactinformatie</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">KVK:</span>
                      <span className="ml-2 font-mono text-slate-900">{selectedCompany.kvk || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Website:</span>
                      {selectedCompany.website ? (
                        <a
                          href={selectedCompany.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-emerald-600 hover:underline break-all"
                        >
                          {selectedCompany.website}
                        </a>
                      ) : (
                        <span className="ml-2 text-slate-400">-</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-600">Contactpersoon:</span>
                      <span className="ml-2 text-slate-900">{selectedCompany.contact_name || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <span className="ml-2 text-slate-900 break-all">{selectedCompany.contact_email || "-"}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Telefoon:</span>
                      <span className="ml-2 text-slate-900">{selectedCompany.contact_phone || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedCompany.notes && (
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">Notities</h3>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedCompany.notes}
                    </div>
                  </div>
                )}

                {/* Followups */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      Follow-ups ({followups.length})
                    </h3>
                    <button
                      onClick={() => setShowFollowupModal(true)}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Toevoegen
                    </button>
                  </div>
                  {followups.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600 text-sm">Nog geen follow-ups</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {followups.map((followup) => (
                        <div key={followup.id} className="border border-slate-200 rounded-lg p-3 sm:p-4 bg-slate-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {followup.action && (
                                <div className="font-medium text-slate-900 mb-1 text-sm sm:text-base">
                                  {followup.action}
                                </div>
                              )}
                              {followup.note && (
                                <div className="text-xs sm:text-sm text-slate-700 mb-2">{followup.note}</div>
                              )}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600">
                                {followup.scheduled_at && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(followup.scheduled_at).toLocaleDateString("nl-NL")}
                                  </div>
                                )}
                                {followup.completed && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Voltooid
                                  </span>
                                )}
                                {followup.emailed && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                    <Mail className="w-3 h-3" />
                                    Gemaild
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Followup Modal */}
        {showFollowupModal && selectedCompany && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Follow-up Toevoegen</h2>
                  <button
                    onClick={() => {
                      setShowFollowupModal(false)
                      setFollowupAction("")
                      setFollowupNote("")
                      setFollowupScheduled("")
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Actie</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={followupAction}
                    onChange={(e) => setFollowupAction(e.target.value)}
                    placeholder="Bijv. Opbellen, Email versturen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notitie</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[100px]"
                    value={followupNote}
                    onChange={(e) => setFollowupNote(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gepland op</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    value={followupScheduled}
                    onChange={(e) => setFollowupScheduled(e.target.value)}
                  />
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowFollowupModal(false)
                    setFollowupAction("")
                    setFollowupNote("")
                    setFollowupScheduled("")
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleAddFollowup}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Toevoegen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
