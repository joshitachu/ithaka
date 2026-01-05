// app/import/[importId]/notices/[noticeId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Building2,
  User2,
  MapPin,
  Euro,
  History,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

type NoticeDetail = {
  id: string
  import_id: string
  notice_id: string | null
  publicatie_id: string | null
  url: string | null
  titel: string | null
  omschrijving: string | null

  win_bedrijf_naam: string | null
  win_kvk: string | null
  win_straat: string | null
  win_postcode: string | null
  win_plaats: string | null
  win_land: string | null
  win_contact_naam: string | null
  win_contact_email: string | null
  win_contact_tel: string | null
  win_website: string | null

  buyer_bedrijf_naam: string | null
  buyer_kvk: string | null
  buyer_straat: string | null
  buyer_postcode: string | null
  buyer_plaats: string | null
  buyer_land: string | null
  buyer_contact_naam: string | null
  buyer_contact_email: string | null
  buyer_contact_tel: string | null
  buyer_website: string | null

  bedrag: number | null
  valuta: string | null
  province: string | null

  heeft_eerdere_aanbestedingen: boolean
  aantal_eerdere_aanbestedingen: number

  created_at?: string
  updated_at?: string
}

// Mapped to Salesforce Lead fields
type CrmCompanyPayload = {
  name: string                          // -> LastName (required)
  contact_name?: string | null          // -> LastName (if different from company)
  contact_email?: string | null         // -> Email
  contact_phone?: string | null         // -> Phone
  mobile?: string | null                // -> MobilePhone
  website?: string | null               // -> Website
  title?: string | null                 // -> Title
  industry?: string | null              // -> Industry
  notes?: string | null                 // -> Description
  lead_status?: string | null           // -> Status
  lead_source?: string | null           // -> LeadSource
  annual_revenue?: number | null        // -> AnnualRevenue
  num_employees?: number | null         // -> NumberOfEmployees
  
  // Additional Salesforce Lead fields
  company?: string | null               // -> Company
  city?: string | null                  // -> City
  country?: string | null               // -> Country
  street?: string | null                // -> Street
  state_province?: string | null        // -> State/Province
  postal_code?: string | null           // -> PostalCode
  kvk?: string | null                   // -> Custom field for KVK number
}

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [crmLoading, setCrmLoading] = useState<boolean>(false)
  const [crmSuccess, setCrmSuccess] = useState<string | null>(null)
  const [crmError, setCrmError] = useState<string | null>(null)

  const [sroiLoadingWinner, setSroiLoadingWinner] = useState<boolean>(false)
  const [sroiResultWinner, setSroiResultWinner] = useState<any | null>(null)
  const [sroiErrorWinner, setSroiErrorWinner] = useState<string | null>(null)
  const [existingSroiResult, setExistingSroiResult] = useState<any | null>(null)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const importId = params.importId as string
        const noticeId = params.noticeId as string

        const res = await fetch(`/api/imports/${importId}/notices/${noticeId}`)
        if (!res.ok) throw new Error("Notice niet gevonden")

        const data: NoticeDetail = await res.json()
        setNotice(data)

        const sroiRes = await fetch(`/api/imports/${importId}/notices/${noticeId}/sroi-results`)
        if (sroiRes.ok) {
          const sroiData = await sroiRes.json()
          if (sroiData.result) {
            setExistingSroiResult(sroiData.result)
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchNotice()
  }, [params.importId, params.noticeId])

  const InfoRow = ({
    label,
    value,
  }: {
    label: string
    value: string | number | null | undefined
  }) => {
    if (value === null || value === undefined || value === "") return null
    return (
      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 text-sm py-2 border-b border-slate-100 last:border-b-0">
        <span className="text-slate-500 text-xs sm:text-sm font-medium sm:font-normal">{label}</span>
        <span className="text-slate-900 sm:text-right break-words text-sm">{String(value)}</span>
      </div>
    )
  }

  // Helper to safely format strings (remove null/undefined)
  const safeString = (val: string | null | undefined): string | undefined => {
    return val?.trim() || undefined
  }

  // Helper to safely format numbers
  const safeNumber = (val: number | null | undefined): number | undefined => {
    return typeof val === 'number' && !isNaN(val) ? val : undefined
  }

  const createCrmCompany = async () => {
    if (!notice) return

    setCrmError(null)
    setCrmSuccess(null)
    setCrmLoading(true)

    try {
      if (!notice.win_bedrijf_naam) {
        throw new Error("❌ Geen bedrijfsnaam voor winnaar beschikbaar")
      }

      // Build comprehensive notes with all available information
      const notesComponents: string[] = [
        `Automatisch aangemaakt vanuit winnaar van TenderNed notice`,
        notice.titel ? `\n\n📋 Notice: ${notice.titel}` : "",
        notice.omschrijving ? `\n\n📝 Omschrijving:\n${notice.omschrijving}` : "",
        notice.notice_id ? `\n\n🔢 Notice ID: ${notice.notice_id}` : "",
        notice.publicatie_id ? `\n📰 Publicatie ID: ${notice.publicatie_id}` : "",
        notice.bedrag ? `\n💰 Contractwaarde: ${notice.valuta || "€"} ${notice.bedrag.toLocaleString("nl-NL")}` : "",
        notice.win_kvk ? `\n🏢 KVK: ${notice.win_kvk}` : "",
        notice.heeft_eerdere_aanbestedingen ? 
          `\n📊 Eerdere aanbestedingen: ${notice.aantal_eerdere_aanbestedingen}` : 
          "\n📊 Geen eerdere aanbestedingen bekend",
        notice.buyer_bedrijf_naam ? `\n\n👔 Aanbesteed door: ${notice.buyer_bedrijf_naam}` : "",
        notice.publicatie_id ? 
          `\n\n🔗 TenderNed Link: https://www.tenderned.nl/aankondigingen/overzicht/${notice.publicatie_id}` : "",
      ]

      const notesText = notesComponents.filter(Boolean).join("")

      // Map notice data to Salesforce Lead fields - ONLY WINNER DATA
      const payload: CrmCompanyPayload = {
        // Required field - use company name as LastName
        name: safeString(notice.win_bedrijf_naam)!,
        
        // Company field - same as name for business leads
        company: safeString(notice.win_bedrijf_naam),
        
        // Contact details
        contact_name: safeString(notice.win_contact_naam),
        contact_email: safeString(notice.win_contact_email),
        contact_phone: safeString(notice.win_contact_tel),
        
        // Website
        website: safeString(notice.win_website),
        
        // Title - use "Contactpersoon" as default if we have a contact name
        title: notice.win_contact_naam ? "Contactpersoon" : undefined,
        
        // Winner Address fields - mapped to Salesforce address fields
        street: safeString(notice.win_straat),
        city: safeString(notice.win_plaats),
        postal_code: safeString(notice.win_postcode),
        state_province: safeString(notice.province),
        country: safeString(notice.win_land),
        kvk: safeString(notice.win_kvk),
        
        // Lead management
        lead_status: "Open - Not Contacted",
        lead_source: "TenderNed",
        
        // Financial data
        annual_revenue: safeNumber(notice.bedrag),
        
        // Notes with all context (includes buyer name for reference)
        notes: notesText,
      }

      // Remove undefined values (backend handles null)
      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      ) as CrmCompanyPayload

      console.log("📤 Sending CRM payload:", cleanPayload)

      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanPayload),
      })

      if (!res.ok) {
        const txt = await res.text()
        let errorMsg = ""
        let errorDetails: any = null

        try {
          errorDetails = JSON.parse(txt)
          console.error("🔍 Backend error response:", errorDetails)

          // Handle 409 Conflict (Duplicate)
          if (res.status === 409) {
            if (errorDetails.detail && typeof errorDetails.detail === 'object') {
              const { error, salesforce_id, company, status } = errorDetails.detail
              errorMsg = `🔄 ${error || "Lead bestaat al"}\n\n` +
                        `📋 Bestaande gegevens:\n` +
                        `• Bedrijf: ${company || "Onbekend"}\n` +
                        `• Status: ${status || "Onbekend"}\n` +
                        `• Salesforce ID: ${salesforce_id || "Onbekend"}\n\n` +
                        `💡 Tip: Deze lead bestaat al in Salesforce. Check of het email adres (${cleanPayload.contact_email || "geen email"}) uniek is.`
            } else {
              errorMsg = `🔄 Duplicaat: Deze lead bestaat al in Salesforce (${cleanPayload.contact_email || cleanPayload.name})`
            }
          }
          // Handle 500 Internal Server Error
          else if (res.status === 500) {
            if (errorDetails.detail) {
              errorMsg = `⚠️ Server fout: ${errorDetails.detail}\n\n` +
                        `🔍 Dit kan betekenen:\n` +
                        `• Salesforce API is niet bereikbaar\n` +
                        `• Een verplicht veld ontbreekt\n` +
                        `• Validatie fout in Salesforce\n\n` +
                        `📋 Verstuurde data:\n${JSON.stringify(cleanPayload, null, 2)}`
            } else {
              errorMsg = `⚠️ Server fout: Kon lead niet aanmaken in Salesforce`
            }
          }
          // Handle 400 Bad Request
          else if (res.status === 400) {
            errorMsg = `❌ Ongeldige data: ${errorDetails.detail || "Controleer of alle velden correct zijn"}\n\n` +
                      `📋 Verstuurde data:\n${JSON.stringify(cleanPayload, null, 2)}`
          }
          // Handle 422 Unprocessable Entity
          else if (res.status === 422) {
            if (errorDetails.detail && Array.isArray(errorDetails.detail)) {
              const validationErrors = errorDetails.detail.map((err: any) => 
                `• ${err.loc?.join(' → ') || 'Unknown field'}: ${err.msg}`
              ).join('\n')
              errorMsg = `⚠️ Validatie fout:\n\n${validationErrors}\n\n` +
                        `📋 Verstuurde data:\n${JSON.stringify(cleanPayload, null, 2)}`
            } else {
              errorMsg = `⚠️ Validatie fout: ${errorDetails.detail || "Controleer de invoer"}`
            }
          }
          // Generic error with detail
          else if (errorDetails.detail) {
            if (typeof errorDetails.detail === 'string') {
              errorMsg = `❌ Fout (${res.status}): ${errorDetails.detail}`
            } else if (errorDetails.detail.error) {
              errorMsg = `❌ Fout (${res.status}): ${errorDetails.detail.error}`
            } else {
              errorMsg = `❌ Fout (${res.status}): ${JSON.stringify(errorDetails.detail)}`
            }
          }
        } catch (parseError) {
          console.error("🔍 Could not parse error response:", txt)
          errorMsg = `❌ CRM-fout (${res.status}): ${txt || res.statusText || "Onbekende fout"}\n\n` +
                    `📋 Verstuurde data:\n${JSON.stringify(cleanPayload, null, 2)}`
        }

        throw new Error(errorMsg)
      }

      const created = await res.json()
      console.log("✅ CRM Lead created:", created)
      setCrmSuccess(
        `✅ CRM Lead aangemaakt!\n\n` +
        `• Bedrijf: ${notice.win_bedrijf_naam}\n` +
        `• Salesforce ID: ${created.id || "?"}\n` +
        `• Email: ${cleanPayload.contact_email || "Geen email"}\n` +
        `• Status: ${cleanPayload.lead_status}`
      )
    } catch (e: any) {
      const errorMessage = e.message || "Kon CRM-lead niet aanmaken"
      setCrmError(errorMessage)
      console.error("❌ CRM Error Details:", {
        message: e.message,
        stack: e.stack,
        notice: notice?.notice_id,
        company: notice?.win_bedrijf_naam,
        email: notice?.win_contact_email
      })
    } finally {
      setCrmLoading(false)
    }
  }

  const runSroiForWinner = async () => {
    if (!notice) return

    setSroiErrorWinner(null)
    setSroiResultWinner(null)
    setSroiLoadingWinner(true)

    try {
      const importId = params.importId as string
      const noticeId = params.noticeId as string

      const res = await fetch(`/api/imports/${importId}/notices/${noticeId}/sroi-analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "winner" }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || data.detail || "Analyse mislukt")
      }

      setSroiResultWinner(data)
      setExistingSroiResult(data)
    } catch (e: any) {
      setSroiErrorWinner(e.message || "Onbekende fout")
    } finally {
      setSroiLoadingWinner(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 text-sm sm:text-base">Notice laden...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !notice) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Terug</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <p className="text-red-700 text-sm sm:text-base">{error || "Notice niet gevonden"}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Terug naar import</span>
        </button>

        {(crmSuccess || crmError) && (
          <div
            className={`rounded-xl border p-3 text-xs sm:text-sm flex items-start gap-2 ${
              crmSuccess ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {crmSuccess ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            )}
            <p className="flex-1">{crmSuccess || crmError}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col gap-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                  {notice.titel || "Geen titel"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 break-words">
                  Notice ID: {notice.notice_id || "-"} • Publicatie ID: {notice.publicatie_id || "-"}
                </p>
              </div>

              {notice.publicatie_id && (
                <a
                  href={`https://www.tenderned.nl/aankondigingen/overzicht/${notice.publicatie_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:underline"
                >
                  <Link2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  Open in TenderNed
                </a>
              )}

              {notice.omschrijving && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Omschrijving</p>
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line break-words">
                    {notice.omschrijving}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                {notice.province && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{notice.province}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  <History className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {notice.heeft_eerdere_aanbestedingen
                      ? `Eerdere: ${notice.aantal_eerdere_aanbestedingen}`
                      : "Geen eerdere"}
                  </span>
                </span>
                {notice.bedrag && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Euro className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      {notice.valuta || "€"} {notice.bedrag.toLocaleString("nl-NL")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">Winnaar</h2>
                <p className="text-xs text-slate-500 hidden sm:block">Bedrijfsgegevens van de winnende inschrijver</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={createCrmCompany}
                disabled={!notice.win_bedrijf_naam || crmLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 disabled:hover:border-emerald-600 transition-colors shadow-sm"
              >
                {crmLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                CRM
              </button>

              <button
                onClick={runSroiForWinner}
                disabled={!notice.win_bedrijf_naam || sroiLoadingWinner}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition-colors shadow-sm"
              >
                {sroiLoadingWinner ? (
                  <span className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                AI
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Bedrijfsnaam" value={notice.win_bedrijf_naam} />
              <InfoRow label="KVK" value={notice.win_kvk} />
              <InfoRow label="Straat" value={notice.win_straat} />
              <InfoRow label="Postcode" value={notice.win_postcode} />
              <InfoRow label="Plaats" value={notice.win_plaats} />
              <InfoRow label="Land" value={notice.win_land} />
            </div>
            <div>
              <InfoRow label="Contactpersoon" value={notice.win_contact_naam} />
              <InfoRow label="E-mail" value={notice.win_contact_email} />
              <InfoRow label="Telefoon" value={notice.win_contact_tel} />
              <InfoRow label="Website" value={notice.win_website} />
            </div>
          </div>

          {(existingSroiResult || sroiResultWinner) && (
            <div className="mt-2 rounded-lg border-2 p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-1">AI Analyse Resultaat (Winnaar)</div>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>
                      <span className="font-medium">Score:</span>{" "}
                      {(sroiResultWinner || existingSroiResult)?.score ?? "-"}
                    </div>
                    <div>
                      <span className="font-medium">SROI Compliant:</span>{" "}
                      {(sroiResultWinner || existingSroiResult)?.sroi_compliant ? "Ja ✓" : "Nee ✗"}
                    </div>
                    {(sroiResultWinner || existingSroiResult)?.summary && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <span className="font-medium">Samenvatting:</span>
                        <p className="mt-1 text-blue-700">{(sroiResultWinner || existingSroiResult).summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Inkoper</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Gegevens van de aanbestedende dienst</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Bedrijfsnaam" value={notice.buyer_bedrijf_naam} />
              <InfoRow label="KVK" value={notice.buyer_kvk} />
              <InfoRow label="Straat" value={notice.buyer_straat} />
              <InfoRow label="Postcode" value={notice.buyer_postcode} />
              <InfoRow label="Plaats" value={notice.buyer_plaats} />
              <InfoRow label="Land" value={notice.buyer_land} />
            </div>
            <div>
              <InfoRow label="Contactpersoon" value={notice.buyer_contact_naam} />
              <InfoRow label="E-mail" value={notice.buyer_contact_email} />
              <InfoRow label="Telefoon" value={notice.buyer_contact_tel} />
              <InfoRow label="Website" value={notice.buyer_website} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Contract &amp; meta</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Bedrag, valuta en technische metadata</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InfoRow label="Bedrag" value={notice.bedrag} />
              <InfoRow label="Valuta" value={notice.valuta} />
              <InfoRow label="Provincie" value={notice.province} />
            </div>
            <div>
              <InfoRow label="Notice ID" value={notice.notice_id} />
              <InfoRow label="Publicatie ID" value={notice.publicatie_id} />
              <InfoRow label="Import ID" value={notice.import_id} />
            </div>
          </div>

          {notice.url && (
            <div className="pt-2">
              <a
                href={notice.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:underline"
              >
                <Link2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                {notice.url}
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}