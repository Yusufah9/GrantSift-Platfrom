import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AIService } from "@/lib/ai/ai-service";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Authenticated route
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isProUser =
      profile?.role === "admin" ||
      user.user_metadata?.is_pro === true ||
      user.user_metadata?.plan === "pro";

    const body = await req.json();
    const { action, payload } = body;
    const aiService = new AIService();

    switch (action) {
      case "match_grants": {
        const result = await aiService.matchGrants({
          query: payload.query,
          isProUser: isProUser || payload.isProUser === true,
        });
        return NextResponse.json({ success: true, data: result });
      }

      case "generate_proposal": {
        const result = await aiService.generateProposal(payload);
        return NextResponse.json({ success: true, data: result });
      }

      case "review_proposal": {
        const result = await aiService.reviewProposal(payload.content, payload.guidelines);
        return NextResponse.json({ success: true, data: result });
      }

      case "chat": {
        const result = await aiService.chatAssistant({
          messages: payload.messages || [],
          orgContext: payload.orgContext,
          grantContext: payload.grantContext,
          isProUser: isProUser || payload.isProUser === true,
        });
        return NextResponse.json({ success: true, data: { response: result, isProUser } });
      }

      default:
        return NextResponse.json({ error: "Unknown AI action requested." }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "An error occurred in AI service." },
      { status: 500 },
    );
  }
}
