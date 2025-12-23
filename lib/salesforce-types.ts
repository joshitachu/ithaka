// Types matching your Salesforce Lead structure
export interface Company {
  id: string // Salesforce ID (string, not number)
  name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  mobile: string | null
  website: string | null
  title: string | null
  industry: string | null
  lead_status: string
  lead_source: string | null
  notes: string | null
  annual_revenue: number | null
  num_employees: number | null
  created_date: string | null
}

export interface CompanyCreate {
  name: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  mobile?: string
  website?: string
  title?: string
  industry?: string
  lead_status?: string
  lead_source?: string
  notes?: string
  annual_revenue?: number
  num_employees?: number
}

export interface CompanyUpdate {
  lead_status?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  mobile?: string
  website?: string
  title?: string
  industry?: string
  notes?: string
  annual_revenue?: number
  num_employees?: number
}

export interface Followup {
  id: string
  subject: string
  due_date: string
  notes: string | null
  priority: string
  status: string
}

export interface FollowupCreate {
  subject: string
  due_date: string
  notes?: string
  priority?: "High" | "Normal" | "Low"
}

export interface SalesforceHealthResponse {
  status: "healthy" | "unhealthy"
  salesforce_instance?: string
  api_version?: string
  error?: string
}
