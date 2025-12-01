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

// matches crm_create_company docstring
type CrmCompanyPayload = {
  name: string
  website?: string | null
  kvk?: string | null
  contact_name?: string | null
  contact_email?: string | null
  source_notice_id?: string | null
  notes?: string | null
  lead_status?: string | null
}

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // CRM state – alleen nog voor winnaar
  const [crmLoading, setCrmLoading] = useState<boolean>(false)
  const [crmSuccess, setCrmSuccess] = useState<string | null>(null)
  const [crmError, setCrmError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const importId = params.importId as string
        const noticeId = params.noticeId as string

        const res = await fetch(
          `/api/imports/${importId}/notices/${noticeId}`
        )
        if (!res.ok) throw new Error("Notice niet gevonden")

        const data: NoticeDetail = await res.json()
        setNotice(data)
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
        <span className="text-slate-500 text-xs sm:text-sm font-medium sm:font-normal">
          {label}
        </span>
        <span className="text-slate-900 sm:text-right break-words text-sm">
          {String(value)}
        </span>
      </div>
    )
  }

  // --- CRM helpers: alleen WINNAAR toestaan ---

  const createCrmCompany = async () => {
    if (!notice) return

    setCrmError(null)
    setCrmSuccess(null)
    setCrmLoading(true)

    try {
      if (!notice.win_bedrijf_naam) {
        throw new Error("Geen bedrijfsnaam voor winnaar beschikbaar")
      }

      const payload: CrmCompanyPayload = {
        name: notice.win_bedrijf_naam,
        website: notice.win_website,
        kvk: notice.win_kvk,
        contact_name: notice.win_contact_naam,
        contact_email: notice.win_contact_email,
        source_notice_id: notice.notice_id ?? notice.id,
        notes: `Automatisch aangemaakt vanuit winnaar van notice: "${notice.titel ?? ""}"`,
        lead_status: "new",
      }

      const res = await fetch("/api/crm/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(
          `CRM-fout (${res.status}): ${
            txt || res.statusText || "onbekende fout"
          }`
        )
      }

      const created = await res.json()
      setCrmSuccess(
        `CRM-bedrijf aangemaakt (#${created.id ?? "?"}) voor winnaar`
      )
    } catch (e: any) {
      setCrmError(e.message || "Kon CRM-bedrijf niet aanmaken")
    } finally {
      setCrmLoading(false)
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
            <p className="text-red-700 text-sm sm:text-base">
              {error || "Notice niet gevonden"}
            </p>
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

        {/* CRM feedback */}
        {(crmSuccess || crmError) && (
          <div
            className={`rounded-xl border p-3 text-xs sm:text-sm flex items-start gap-2 ${
              crmSuccess
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
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

        {/* Algemeen */}
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
                  Notice ID: {notice.notice_id || "-"} • Publicatie ID:{" "}
                  {notice.publicatie_id || "-"}
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
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Omschrijving
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line break-words">
                    {notice.omschrijving}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                {notice.province && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{notice.province}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  <History className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {notice.heeft_eerdere_aanbestedingen
                      ? `Eerdere: ${notice.aantal_eerdere_aanbestedingen}`
                      : "Geen eerdere"}
                  </span>
                </span>
                {notice.bedrag && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Euro className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {notice.valuta || "€"}{" "}
                      {notice.bedrag.toLocaleString("nl-NL")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Winnaar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Winnaar
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Bedrijfsgegevens van de winnende inschrijver
                </p>
              </div>
            </div>
            <button
              onClick={createCrmCompany}
              disabled={!notice.win_bedrijf_naam || crmLoading}
              className="inline-flex items-center justify-center gap-2 text-xs px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {crmLoading ? (
                <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              CRM: winnaar
            </button>
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
        </div>

        {/* Inkoper (zonder CRM-knop) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Inkoper
                </h2>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Gegevens van de aanbestedende dienst
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InfoRow
                label="Bedrijfsnaam"
                value={notice.buyer_bedrijf_naam}
              />
              <InfoRow label="KVK" value={notice.buyer_kvk} />
              <InfoRow label="Straat" value={notice.buyer_straat} />
              <InfoRow label="Postcode" value={notice.buyer_postcode} />
              <InfoRow label="Plaats" value={notice.buyer_plaats} />
              <InfoRow label="Land" value={notice.buyer_land} />
            </div>
            <div>
              <InfoRow
                label="Contactpersoon"
                value={notice.buyer_contact_naam}
              />
              <InfoRow label="E-mail" value={notice.buyer_contact_email} />
              <InfoRow label="Telefoon" value={notice.buyer_contact_tel} />
              <InfoRow label="Website" value={notice.buyer_website} />
            </div>
          </div>
        </div>

        {/* Contract / meta */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Contract &amp; meta
              </h2>
              <p className="text-xs text-slate-500 hidden sm:block">
                Bedrag, valuta en technische metadata
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <InfoRow
                label="Bedrag"
                value={
                  notice.bedrag
                    ? `${notice.valuta || "€"} ${notice.bedrag.toLocaleString(
                        "nl-NL"
                      )}`
                    : null
                }
              />
              <InfoRow label="Valuta" value={notice.valuta} />
              <InfoRow label="Provincie" value={notice.province} />
            </div>
            <div>
              <InfoRow label="Database ID" value={notice.id} />
              <InfoRow label="Import ID" value={notice.import_id} />
              <InfoRow
                label="Aangemaakt op"
                value={
                  notice.created_at
                    ? new Date(notice.created_at).toLocaleString("nl-NL")
                    : null
                }
              />
              <InfoRow
                label="Laatst bijgewerkt"
                value={
                  notice.updated_at
                    ? new Date(notice.updated_at).toLocaleString("nl-NL")
                    : null
                }
              />
            </div>
          </div>
        </div>

        {/* Historische aanbestedingen */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-slate-600 flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              Historische aanbestedingen
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Heeft eerdere aanbestedingen:{" "}
            <span className="font-medium">
              {notice.heeft_eerdere_aanbestedingen ? "Ja" : "Nee"}
            </span>
          </p>
          {notice.heeft_eerdere_aanbestedingen && (
            <p className="text-xs sm:text-sm text-slate-600">
              Aantal eerdere aanbestedingen in TenderNed_filtered.csv:{" "}
              <span className="font-medium">
                {notice.aantal_eerdere_aanbestedingen}
              </span>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}