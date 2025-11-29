// app/import/[importId]/notices/[noticeId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileText,
  Building2,
  User2,
  Phone,
  Mail,
  Globe2,
  MapPin,
  Euro,
  History,
  Link2,
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

export default function NoticeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const importId = params.importId as string
        const noticeId = params.noticeId as string

        // Zorg dat je in je API een route hebt: GET /api/imports/[importId]/notices/[noticeId]
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
      <div className="flex justify-between gap-4 text-sm py-1 border-b border-slate-100 last:border-b-0">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-900 text-right break-words">
          {String(value)}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Notice laden...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !notice) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Terug
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error || "Notice niet gevonden"}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Terug naar import
        </button>

        {/* Algemeen */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
  <div className="flex items-start gap-3">
    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
      <FileText className="w-6 h-6 text-blue-600" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-slate-900">
          {notice.titel || "Geen titel"}
        </h1>
        <p className="text-sm text-slate-500">
          Notice ID: {notice.notice_id || "-"} • Publicatie ID:{" "}
          {notice.publicatie_id || "-"}
        </p>
      </div>

      {notice.publicatie_id && (
        <a
          href={`https://www.tenderned.nl/aankondigingen/overzicht/${notice.publicatie_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <Link2 className="w-4 h-4" />
          Open in TenderNed
        </a>
      )}

              {notice.omschrijving && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Omschrijving
                  </p>
                  <p className="text-sm text-slate-800 whitespace-pre-line">
                    {notice.omschrijving}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                {notice.province && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                    <MapPin className="w-3 h-3" />
                    {notice.province}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  <History className="w-3 h-3" />
                  {notice.heeft_eerdere_aanbestedingen
                    ? `Eerdere aanbestedingen: ${notice.aantal_eerdere_aanbestedingen}`
                    : "Geen eerdere aanbestedingen gevonden"}
                </span>
                {notice.bedrag && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Euro className="w-3 h-3" />
                    {notice.valuta || "€"}{" "}
                    {notice.bedrag.toLocaleString("nl-NL")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Winnaar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Winnaar</h2>
              <p className="text-xs text-slate-500">
                Bedrijfsgegevens van de winnende inschrijver
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Inkoper */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Inkoper</h2>
              <p className="text-xs text-slate-500">
                Gegevens van de aanbestedende dienst
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Euro className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Contract & meta
              </h2>
              <p className="text-xs text-slate-500">
                Bedrag, valuta en technische metadata
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Historische aanbestedingen
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            Heeft eerdere aanbestedingen:{" "}
            <span className="font-medium">
              {notice.heeft_eerdere_aanbestedingen ? "Ja" : "Nee"}
            </span>
          </p>
          {notice.heeft_eerdere_aanbestedingen && (
            <p className="text-sm text-slate-600">
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
