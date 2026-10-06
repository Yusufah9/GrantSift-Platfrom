import { describe, it, expect } from "vitest";
import { FinancialModelEngine } from "./financial-model-engine";

describe("Universal Financial Model Engine", () => {
  it("computes 5-year financial statements with zero mathematical errors", () => {
    const engine = new FinancialModelEngine({
      currency: "₦",
      initialCustomers: 100,
      monthlyCustomerGrowthRate: 0.05,
      monthlyArpu: 300000,
      targetAsk: 200_000_000,
    });

    const outputs = engine.calculate();

    expect(outputs.annualProjections).toHaveLength(5);

    // Revenue grows year over year
    expect(outputs.annualProjections[4]!.revenue).toBeGreaterThan(outputs.annualProjections[0]!.revenue);

    // Gross profit is positive and gross margin around 78%
    expect(outputs.annualProjections[0]!.grossMargin).toBeCloseTo(0.78, 1);

    // Check Balance Sheet balance rule across all 5 years
    for (const p of outputs.annualProjections) {
      const diff = Math.abs(p.totalAssets - p.totalLiabilitiesAndEquity);
      expect(diff).toBeLessThan(0.01);
    }

    // Check Ending Cash equality between SOFP and SOCF
    for (const p of outputs.annualProjections) {
      expect(p.cash).toBe(p.endingCash);
    }
  });

  it("calculates DCF valuation, WACC, and Pericom equity value per share", () => {
    const engine = new FinancialModelEngine({
      sharesOutstanding: 10_000_000,
      costOfEquity: 0.28,
      debtToCapitalTarget: 0.20,
      effectiveTaxRate: 0.30,
    });

    const outputs = engine.calculate();

    expect(outputs.valuation.wacc).toBeGreaterThan(0.15);
    expect(outputs.valuation.enterpriseValue).toBeGreaterThan(0);
    expect(outputs.valuation.equityValue).toBeGreaterThan(0);
    expect(outputs.valuation.equityValuePerShare).toBeGreaterThan(0);
    expect(outputs.valuation.fcffProjections).toHaveLength(5);
  });

  it("computes SaaS metrics, unit economics and Rule of 40", () => {
    const engine = new FinancialModelEngine({});
    const outputs = engine.calculate();

    expect(outputs.saasMetrics).toHaveLength(5);
    const y5 = outputs.saasMetrics[4]!;

    expect(y5.arr).toBeGreaterThan(y5.mrr);
    expect(y5.ltvCacRatio).toBeGreaterThan(3.0);
    expect(y5.ruleOf40).toBeGreaterThan(0);
    expect(y5.runwayMonths).toBeGreaterThan(12);
  });
});
