"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Upload, Search, Users, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Imports", href: "/imports", icon: Upload },
  { name: "Zoeken", href: "/search", icon: Search },
  { name: "CRM", href: "/crm", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Logo / Header */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="font-bold text-lg text-slate-900"> Scraper</h1>
          <p className="text-xs text-slate-600">CRM Systeem</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-sm",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-slate-500 text-center">© 2025 TenderNed CRM</p>
      </div>
    </div>
  )
}
