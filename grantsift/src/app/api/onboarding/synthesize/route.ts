import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FundingProfileService } from "@/lib/services/funding-profile-service";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const service = new FundingProfileService(supabase);
    const profile = await service.synthesizeProfile(body);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to synthesize funding profile." },
      { status: 500 }
    );
  }
}
