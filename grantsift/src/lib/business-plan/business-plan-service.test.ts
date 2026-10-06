import { describe, it, expect } from "vitest";
import { BusinessPlanService } from "./business-plan-service";
import { BUSINESS_PLAN_SECTIONS } from "./business-plan-sections";
import { FinancialModelEngine } from "../finance/financial-model-engine";

describe("Investor-Grade Business Plan Service", () => {
  it("initializes with all 33 institutional sections", () => {
    const plan = BusinessPlanService.createDefaultPlan();
    expect(BUSINESS_PLAN_SECTIONS).toHaveLength(33);
    expect(Object.keys(plan.sections)).toHaveLength(33);
  });

  it("synchronizes SOM Year 5 revenue and customer counts with Financial Model Year 5", () => {
    const plan = BusinessPlanService.createDefaultPlan();
    const engine = new FinancialModelEngine({
      monthlyArpu: 350000,
      initialCustomers: 120,
    });
    const outputs = engine.calculate();
    const y5Rev = outputs.annualProjections[4]!.revenue;

    const { plan: syncedPlan, syncResult } = BusinessPlanService.syncWithFinancialModel(plan, engine);

    expect(syncResult.isConsistent).toBe(true);
    expect(syncResult.variance).toBe(0);
    expect(syncResult.somRevenue).toBe(y5Rev);

    // Section 13 (TAM/SAM/SOM) contains the formatted Year 5 number
    const sec13 = syncedPlan.sections["sec-13"];
    expect(sec13).toContain(y5Rev.toLocaleString());

    // Section 3 (Executive Summary) contains the formatted Year 5 number
    const sec03 = syncedPlan.sections["sec-03"];
    expect(sec03).toContain(y5Rev.toLocaleString());
  });

  it("sanitizes content: removes AI hype and guarantees zero en/em dashes", () => {
    const plan = BusinessPlanService.createDefaultPlan();
    plan.sections["sec-03"] =
      "Let's dive into this game-changing solution — it will transform your journey – guaranteed.";

    const sanitizedPlan = BusinessPlanService.sanitizeAllSections(plan);
    const content = sanitizedPlan.sections["sec-03"] ?? "";

    // No em-dash or en-dash
    expect(content).not.toContain("—");
    expect(content).not.toContain("–");

    // No banned AI clichés
    expect(content.toLowerCase()).not.toContain("game-changing");
    expect(content.toLowerCase()).not.toContain("dive into");
  });

  it("exports a structured full document string", () => {
    const plan = BusinessPlanService.createDefaultPlan();
    const doc = BusinessPlanService.exportFullDocument(plan);

    expect(doc).toContain("SECTION 1: COVER PAGE");
    expect(doc).toContain("SECTION 33: DISCLAIMER");
    expect(doc).toContain("5-YEAR INSTITUTIONAL DATA-DRIVEN BUSINESS PLAN");
  });
});
