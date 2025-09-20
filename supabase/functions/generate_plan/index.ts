import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { businessType, location } = await req.json();

    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    const system = `You are a fitness business strategist. Produce a concise 12-month plan for a ${businessType} in ${location} with categories: Apparel, Community, Holiday, Business. Return JSON with:
{
  "title": string,
  "summary": string,
  "highlights": string[],
  "months": [
    {"month": 1, "title": string, "category": "Apparel|Community|Holiday|Business", "details": string},
    ... up to 12
  ]
}
Keep it practical and specific.`;

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Business Type: ${businessType}\nLocation: ${location}` }
      ],
      temperature: 0.7,
    });

    const text = resp.choices[0]?.message?.content ?? "{}";
    // Try to parse JSON from model output:
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const data = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
