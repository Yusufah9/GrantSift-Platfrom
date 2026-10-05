export type FeatureKey =
  | "basic_grant_search"
  | "view_source_urls"
  | "basic_match_score"
  | "full_grant_database"
  | "direct_application_urls"
  | "continuous_monitoring"
  | "advanced_gap_analysis"
  | "grant_intelligence"
  | "previous_winner_intelligence"
  | "web_research"
  | "deep_research"
  | "ai_proposal_generation"
  | "funder_intelligence"
  | "proposal_export"
  | "budget_builder"
  | "unlimited_documents"
  | "award_management"
  | "ai_matching"
  | "sop_workflow";

export interface UserContext {
  id?: string;
  email?: string;
  role?: string;
  is_pro?: boolean;
  plan?: string;
  entitlement?: string;
  has_paid?: boolean;
}

export class EntitlementService {
  /**
   * Evaluates server-side whether a user has access to a specific feature.
   * Free users see real grants, links, and basic score (Specification §14).
   * Paid users receive continuous monitoring, deep grant intelligence, winner research,
   * and automated proposal generation.
   */
  static can(user: UserContext | null | undefined, feature: FeatureKey): boolean {
    if (!user) {
      // Public / unauthenticated visitors can still search basic grant databases
      return feature === "basic_grant_search" || feature === "view_source_urls";
    }

    const isAdmin =
      user.role === "admin" ||
      user.entitlement === "ADMIN_PRO" ||
      user.entitlement === "PLATFORM_PRO";

    const isPro =
      isAdmin ||
      user.is_pro === true ||
      user.plan === "pro" ||
      user.plan === "enterprise" ||
      user.has_paid === true;

    if (isAdmin || isPro) {
      return true;
    }

    // Free tier feature permissions (Specification §14)
    // The existence of the grant is NEVER hidden from free users
    switch (feature) {
      case "basic_grant_search":
      case "full_grant_database":
      case "view_source_urls":
      case "direct_application_urls":
      case "basic_match_score":
      case "budget_builder":
      case "sop_workflow":
        return true;
      case "continuous_monitoring":
      case "advanced_gap_analysis":
      case "grant_intelligence":
      case "previous_winner_intelligence":
      case "web_research":
      case "deep_research":
      case "ai_proposal_generation":
      case "funder_intelligence":
      case "proposal_export":
      case "unlimited_documents":
      case "award_management":
      case "ai_matching":
      default:
        return false;
    }
  }

  static getPlan(user: UserContext | null | undefined): string {
    if (!user) return "anonymous";
    if (user.role === "admin" || user.entitlement === "ADMIN_PRO") return "admin_pro";
    if (user.is_pro || user.plan === "pro") return "pro";
    if (user.plan === "enterprise") return "enterprise";
    return "free";
  }

  static isBillingExempt(user: UserContext | null | undefined): boolean {
    if (!user) return false;
    return user.role === "admin" || user.entitlement === "ADMIN_PRO";
  }
}
