"use client"

import { useState } from "react"
import { Search, Building2, Calendar, TrendingUp } from "lucide-react"

type CompanySearchResult = {
  publicatiedatum: string
  year: string
  bedrijf: string
  kvk: string
  omschrijving: string
  begindatum_opdracht: string | null
  einddatum_opdracht: string | null
  aantal_publicaties: number
  bedrag?: number | null
  valuta?: string | null
}

export default function SearchPage() {
  const [companyQuery, setCompanyQuery] = useState("")
  const [companyYears, setCompanyYears] = useState<number>(5)
  const [companyResults, setCompanyResults] = useState<CompanySearchResult[]>([])
  const [loadingCompanySearch, setLoadingCompanySearch] = useState(false)
  const [companySearchTotal, setCompanySearchTotal] = useState<number>(0)

  const handleCompanySearch = async () => {
    if (!companyQuery || companyQuery.trim().length === 0) {
      alert("Vul een bedrijfsnaam in om te zoeken.")
      return
    }

    setLoadingCompanySearch(true)
    setCompanyResults([])
    setCompanySearchTotal(0)

    try {
      // Eerst Next.js API endpoint
      let res = await fetch(
        `/api/search/company?q=${encodeURIComponent(companyQuery)}&years=${companyYears}`
      )
      let data = await res.json().catch(() => ({}))

      // Fallback naar backend op poort 8001
      if (!res.ok || (data as any).error) {
        try {
          const fallbackUrl = `http://localhost:8001/api/search/company?q=${encodeURIComponent(
            companyQuery
          )}&years=${companyYears}`
          res = await fetch(fallbackUrl)
          data = await res.json()
        } catch (err2) {
          console.error("Fallback search failed", err2)
          alert("Beide zoekendpoints falen. Start de backend of controleer de netwerkverbinding.")
          setCompanyResults([])
          return
        }
      }

      if (!res.ok) {
        alert(
          (data as any).error ||
            (data as any).detail ||
            "Er is een fout opgetreden bij het zoeken."
        )
        setCompanyResults([])
      } else {
        const results: CompanySearchResult[] = (data as any).results || []
        const total: number = (data as any).total || 0

        setCompanyResults(results)
        setCompanySearchTotal(total)

        if (total === 0) {
          alert(
            `Er zijn geen bedrijven gevonden voor "${companyQuery}" in de afgelopen ${companyYears} jaar.`
          )
        }

        console.log("[company-search] succes:", {
          query: (data as any).query,
          years: (data as any).years,
          total,
          resultsCount: results.length,
        })
      }
    } catch (err: any) {
      console.error("Fout bij bedrijf zoeken", err)
      alert("Fout bij zoeken. Bekijk de console voor details.")
    } finally {
      setLoadingCompanySearch(false)
    }
  }

  const formatPrice = (bedrag?: number | null, valuta?: string | null) => {
    if (bedrag == null) return null
    const symbol = valuta || "€"
    try {
      return `${symbol} ${bedrag.toLocaleString("nl-NL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    } catch {
      return `${symbol} ${bedrag}`
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <header className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Bedrijven Zoeken
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Zoek naar bedrijven en hun aanbestedingsgeschiedenis
          </p>
        </header>

        {/* Zoekblok */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 mb-2 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Zoek Bedrijven
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Vind bedrijven op naam en bekijk hun aanbestedingsgeschiedenis
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                Bedrijfsnaam
              </label>
              <input
                type="text"
                placeholder="Voer bedrijfsnaam in..."
                className="w-full border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompanySearch()}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                Jaren om te Zoeken
              </label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={companyYears}
                onChange={(e) => setCompanyYears(Number(e.target.value))}
              >
                <option value={1}>1 jaar</option>
                <option value={2}>2 jaar</option>
                <option value={3}>3 jaar</option>
                <option value={5}>5 jaar</option>
                <option value={10}>10 jaar</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleCompanySearch}
            disabled={loadingCompanySearch}
            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-purple-600 text-sm sm:text-base text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            {loadingCompanySearch ? "Zoeken..." : "Zoeken"}
          </button>
        </section>

        {/* Resultaten */}
        {companySearchTotal > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Zoekresultaten
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {companySearchTotal} bedrijven gevonden
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {companyResults.map((company, idx) => {
                const prijs = formatPrice(company.bedrag, company.valuta)

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 sm:p-6 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                            {company.bedrijf}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-600">
                            KVK: {company.kvk}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">Jaar: {company.year}</p>
                        </div>
                      </div>

                      <div className="ml-0 sm:ml-3 space-y-2">
                        <p className="text-sm text-slate-700">{company.omschrijving}</p>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Gepubliceerd: {company.publicatiedatum}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{company.aantal_publicaties} publicaties</span>
                          </div>
                          {company.begindatum_opdracht && (
                            <span>
                              Contract: {company.begindatum_opdracht} –{" "}
                              {company.einddatum_opdracht || "Lopend"}
                            </span>
                          )}
                          {prijs && (
                            <span className="font-medium text-emerald-700">
                              Prijs: {prijs}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
