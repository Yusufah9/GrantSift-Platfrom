import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { researchEngine } from "@/lib/services/firecrawl/research-engine";

export async function POST(req: Request) {
  try {
    let user = null;
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (e) {
      // In local dev / demo environments without active session, proceed with mock tenant
    }

    if (!user && process.env.NODE_ENV === "production" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Unauthorized. Please log in to perform live web research." }, { status: 401 });
    }

    const body = await req.json();
    const { query, mode, sources, orgContext } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    const report = await researchEngine.runResearch({
      query,
      mode,
      sources,
      orgContext,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    console.error("Research API error:", err);
    return NextResponse.json(
      { error: err?.message || "Web research service temporarily unavailable. Please retry." },
      { status: 500 }
    );
  }
}
