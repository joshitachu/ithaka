"use client"
import { useEffect, useState } from "react"
type Row = Record<string, string | number | null>
export default function AnalyticsPage() {
  const [kind, setKind] = useState("buyers"); const [rows, setRows] = useState<Row[]>([]); const [error, setError] = useState("")
  useEffect(() => { fetch(`/api/analytics/${kind}`).then(async r => r.ok ? setRows(await r.json()) : setError("Rapport kon niet worden geladen")).catch(() => setError("Rapport kon niet worden geladen")) }, [kind])
  return <main className="p-8 max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-6">Marktanalyse</h1><div className="flex gap-2 mb-6">{[["buyers","Inkopers"],["competitors","Concurrenten"],["re-tenders","Her-aanbestedingen"]].map(([id,label])=><button key={id} onClick={()=>setKind(id)} className={`px-4 py-2 rounded ${kind===id?"bg-blue-600 text-white":"bg-slate-100"}`}>{label}</button>)}</div>{error && <p className="text-red-600">{error}</p>}<div className="bg-white border rounded overflow-x-auto"><table className="w-full text-sm"><thead><tr>{Object.keys(rows[0]||{}).map(k=><th className="p-3 text-left" key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr className="border-t" key={i}>{Object.entries(row).map(([k,v])=><td className="p-3" key={k}>{v ?? "-"}</td>)}</tr>)}</tbody></table>{!rows.length && !error && <p className="p-4">Nog geen canonieke aanbestedingsdata. Voer eerst een nieuwe import uit.</p>}</div></main>
}
