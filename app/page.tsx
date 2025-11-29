"use client"

import Link from "next/link"
import { Upload, Search, Building2, Database, TrendingUp, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        <header className="text-center space-y-4 py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900">Welkom bij TenderNed</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Uw uitgebreide platform voor het importeren, analyseren en beheren van aanbestedingsgegevens met
            geavanceerde SROI-compliance monitoring en CRM-mogelijkheden.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/imports">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Upload className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Imports</h2>
              <p className="text-slate-600">
                Importeer aanbestedingsgegevens van TenderNed met geavanceerde filteropties inclusief datumbereiken,
                CPV-codes en regionale filters.
              </p>
            </div>
          </Link>

          <Link href="/search">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Search className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Zoeken</h2>
              <p className="text-slate-600">
                Zoek naar bedrijven en hun aanbestedingsgeschiedenis over meerdere jaren. Analyseer patronen en sla
                leads direct op in uw CRM.
              </p>
            </div>
          </Link>

          <Link href="/crm">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Building2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">CRM</h2>
              <p className="text-slate-600">
                Beheer uw leads en bedrijven met een volledig uitgeruste CRM. Volg contacten, update statussen en plan
                vervolgacties.
              </p>
            </div>
          </Link>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Belangrijkste Functies</h2>
              <p className="text-slate-600">Alles wat u nodig heeft om aanbestedingsgegevens te beheren</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">SROI Compliance Analyse</h3>
                <p className="text-sm text-slate-600">
                  Analyseer automatisch aanbestedingen op Social Return on Investment compliance met gedetailleerde
                  rapportage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Geavanceerde Filters</h3>
                <p className="text-sm text-slate-600">
                  Filter imports op datumbereik, CPV-codes en regionale locatie voor nauwkeurige gegevensverzameling.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Geïntegreerde CRM</h3>
                <p className="text-sm text-slate-600">
                  Sla bedrijven uit zoekresultaten direct op in uw CRM en beheer de volledige verkooppijplijn.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Bedrijven Zoeken</h3>
                <p className="text-sm text-slate-600">
                  Zoek historische aanbestedingsgegevens op bedrijfsnaam en analyseer hun inschrijvingspatronen in de
                  loop van de tijd.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
