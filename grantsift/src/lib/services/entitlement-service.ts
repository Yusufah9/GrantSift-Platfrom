export type FeatureKey =
  | "web_research"
  | "deep_research"
  | "ai_proposal_generation"
  | "full_grant_database"
  | "funder_intelligence"
  | "proposal_export"
  | "budget_builder"
  | "unlimited_documents"
  | "award_management"
  | "direct_application_urls"
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
   * Admin accounts automatically receive PLATFORM_PRO / ADMIN_PRO status
   * with complete unrestricted access to all features and zero billing barriers.
   */
  static can(user: UserContext | null | undefined, feature: FeatureKey): boolean {
    if (!user) {
      // Unauthenticated users have no access to protected features
      return false;
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

    // Free tier feature permissions
    switch (feature) {
      case "full_grant_database":
      case "budget_builder":
      case "sop_workflow":
        return true;
      case "web_research":
      case "deep_research":
      case "ai_proposal_generation":
      case "funder_intelligence":
      case "proposal_export":
      case "unlimited_documents":
      case "award_management":
      case "direct_application_urls":
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
