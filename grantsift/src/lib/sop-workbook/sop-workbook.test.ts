import { describe, it, expect } from "vitest";
import { BD_PROJECT_DEVT_SOP, SOP_COLORS } from "./bd-sop-data";
import { generateSopColabPythonScript, generateSopExcelBuffer } from "./workbook-export";

describe("BD & Project Devt Unit SOP Workbook", () => {
  it("contains all 9 required sections with complete institutional details", () => {
    expect(BD_PROJECT_DEVT_SOP.sheets).toHaveLength(9);
    expect(SOP_COLORS.primary).toBe("#980F84");
    expect(SOP_COLORS.dark).toBe("#2C1028");

    // Check role-based personnel structure in Sheet 1
    const sheet1 = BD_PROJECT_DEVT_SOP.sheets[0]!;
    const orgBlock = sheet1.blocks.find((b) => b.title === "Organizational Structure");
    expect(orgBlock).toBeDefined();
    if (orgBlock && orgBlock.kind === "table") {
      const roles = orgBlock.rows.map((r) => r[0]);
      expect(roles).toContain("Lead Grant Writer & BD Lead");
      expect(roles).toContain("Grant Writer (Technical Narratives)");
      expect(roles).toContain("Grant Writer (Budgets & Compliance)");
      expect(roles).toContain("Project Development Specialist");
    }

    // Check multi-tier role-based approval workflow in Sheet 3 (Process Documentation)
    const sheet3 = BD_PROJECT_DEVT_SOP.sheets[2]!;
    const procBlock = sheet3.blocks.find((b) => b.kind === "table");
    expect(procBlock).toBeDefined();
    if (procBlock && procBlock.kind === "table") {
      const allText = procBlock.rows.flat().join(" ");
      expect(allText).toContain("BD Supervisor");
      expect(allText).toContain("Executive Director");
      // Verify no individual personal names are hardcoded
      expect(allText).not.toContain("Yusuf");
      expect(allText).not.toContain("Damilola");
    }
  });

  it("generates executable Google Colab Python script containing pandas and openpyxl", () => {
    const pythonScript = generateSopColabPythonScript(BD_PROJECT_DEVT_SOP);
    expect(pythonScript).toContain("import pandas as pd");
    expect(pythonScript).toContain("import openpyxl");
    expect(pythonScript).toContain("980F84");
    expect(pythonScript).toContain("Lead Grant Writer");
    expect(pythonScript).toContain("Executive Director");
    expect(pythonScript).not.toContain("Yusuf Yaru Umaru");
  });

  it("generates valid Excel buffer without errors", async () => {
    const buffer = await generateSopExcelBuffer(BD_PROJECT_DEVT_SOP);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
