import { supabase } from "@/integrations/supabase/client"

export async function generatePlan({ 
  businessType, 
  location 
}: { 
  businessType: string
  location: string 
}) {
  const url = "https://vqyswydjqhwoiycuzvmm.supabase.co/functions/v1/generate_plan"
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeXN3eWRqcWh3b2l5Y3V6dm1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Mjk5NDYsImV4cCI6MjA3MzMwNTk0Nn0.oUNWR2BlYjmbPj2KOCRQcziy2g56eNh89oJT0FLAbco"
    },
    body: JSON.stringify({ businessType, location }),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || "Failed to generate")
  return json.data
}

export async function savePlan(
  userId: string, 
  form: { businessType: string; location: string }, 
  data: any
) {
  const { data: planRow, error } = await supabase.from("plans").insert({
    user_id: userId,
    business_type: form.businessType,
    location: form.location,
    plan_title: data.title,
    summary: { summary: data.summary, highlights: data.highlights }
  }).select("*").single()
  
  if (error) throw error

  const items = (data.months || []).map((m: any, idx: number) => ({
    plan_id: planRow.id,
    month_index: idx,
    title: m.title,
    details: m.details,
    category: m.category
  }))
  
  const { error: itemsErr } = await supabase.from("plan_items").insert(items)
  if (itemsErr) throw itemsErr
  
  return planRow.id
}
