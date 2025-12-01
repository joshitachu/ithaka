// app/import/[importId]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Database,
  FileText,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  Search,
} from "lucide-react"

type NoticeRow = {
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

type ImportDetail = {
  id: string
  name: string
  date_from: string | null
  date_to: string | null
  total_records: number | null
  created_at: string

  publicatie_type: string | null
  cpv_codes: string[] | null
  region: string | null

  updated_at?: string
}

export default function ImportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [importData, setImportData] = useState<ImportDetail | null>(null)
  const [notices, setNotices] = useState<NoticeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const importId = params.importId as string

        const importRes = await fetch(`/api/imports/${importId}`)
        if (!importRes.ok) throw new Error("Import niet gevonden")
        const importData: ImportDetail = await importRes.json()
        setImportData(importData)

        const noticesRes = await fetch(`/api/imports/${importId}/notices`)
        if (!noticesRes.ok) throw new Error("Kon notices niet laden")
        const noticesData: NoticeRow[] = await noticesRes.json()
        setNotices(noticesData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.importId])

  const filteredNotices = notices.filter((notice) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()

    return (
      notice.titel?.toLowerCase().includes(query) ||
      notice.win_bedrijf_naam?.toLowerCase().includes(query) ||
      notice.buyer_bedrijf_naam?.toLowerCase().includes(query) ||
      notice.notice_id?.toLowerCase().includes(query) ||
      notice.province?.toLowerCase().includes(query) ||
      notice.omschrijving?.toLowerCase().includes(query)
    )
  })

  const totalWithHistory = notices.filter((n) => n.heeft_eerdere_aanbestedingen).length

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Import data laden...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push("/imports")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Terug naar imports</span>
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
            <p className="text-red-700 text-sm sm:text-base">{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <button
          onClick={() => router.push("/imports")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Terug naar imports</span>
        </button>

        {importData && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                  {importData.name}
                </h1>

                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {importData.date_from} tot {importData.date_to}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    {importData.total_records ?? notices.length} records
                  </span>
                  {importData.region && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Regio: {importData.region}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      Aangemaakt op{" "}
                      {new Date(importData.created_at).toLocaleString("nl-NL")}
                    </span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {importData.publicatie_type && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      Type: {importData.publicatie_type}
                    </span>
                  )}
                  {importData.cpv_codes?.map((cpv) => (
                    <span
                      key={cpv}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      CPV {cpv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Totaal notices</p>
                <p className="text-xl font-semibold text-slate-900">
                  {importData.total_records ?? notices.length}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Met eerdere aanbestedingen</p>
                <p className="text-xl font-semibold text-slate-900">{totalWithHistory}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs text-slate-500">Zonder eerdere aanbestedingen</p>
                <p className="text-xl font-semibold text-slate-900">
                  {Math.max(
                    (importData.total_records ?? notices.length) - totalWithHistory,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                  Notices
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  {filteredNotices.length} notices gevonden
                </p>
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Zoek notices..."
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden space-y-3">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() =>
                  router.push(`/import/${params.importId}/notices/${notice.id}`)
                }
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 flex-1">
                      {notice.titel || (
                        <span className="text-slate-400">Geen titel</span>
                      )}
                    </h3>
                    {notice.heeft_eerdere_aanbestedingen && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 flex-shrink-0">
                        {notice.aantal_eerdere_aanbestedingen}x
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    {notice.notice_id && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ID:</span>
                        <span>{notice.notice_id}</span>
                      </div>
                    )}
                    {notice.win_bedrijf_naam && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium flex-shrink-0">Winnaar:</span>
                        <span className="flex-1">{notice.win_bedrijf_naam}</span>
                      </div>
                    )}
                    {notice.buyer_bedrijf_naam && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium flex-shrink-0">Inkoper:</span>
                        <span className="flex-1">{notice.buyer_bedrijf_naam}</span>
                      </div>
                    )}
                    {notice.province && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Provincie:</span>
                        <span>{notice.province}</span>
                      </div>
                    )}
                  </div>

                  {notice.bedrag && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">
                        {notice.valuta || "€"}{" "}
                        {notice.bedrag.toLocaleString("nl-NL")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Notice ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Titel
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Winnaar
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Inkoper
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Provincie
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Eerdere aanbestedingen
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">
                    Bedrag
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredNotices.map((notice) => (
                  <tr
                    key={notice.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(
                        `/import/${params.importId}/notices/${notice.id}`
                      )
                    }
                  >
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {notice.notice_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {notice.titel || (
                        <span className="text-slate-400">Geen titel</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {notice.win_bedrijf_naam || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {notice.buyer_bedrijf_naam || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {notice.province || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {notice.heeft_eerdere_aanbestedingen ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                          Ja • {notice.aantal_eerdere_aanbestedingen}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-50 text-slate-500 text-xs border border-slate-200">
                          Nee
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">
                      {notice.bedrag
                        ? `${notice.valuta || "€"} ${notice.bedrag.toLocaleString(
                            "nl-NL"
                          )}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredNotices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 text-sm sm:text-base">
                Geen notices gevonden
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}