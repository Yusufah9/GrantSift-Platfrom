import { describe, it, expect } from "vitest";
import { BD_PROJECT_DEVT_SOP, SOP_COLORS } from "./bd-sop-data";
import { generateSopColabPythonScript, generateSopExcelBuffer } from "./workbook-export";

describe("BD & Project Devt Unit SOP Workbook", () => {
  it("contains all 9 required sections with complete institutional details", () => {
    expect(BD_PROJECT_DEVT_SOP.sheets).toHaveLength(9);
    expect(SOP_COLORS.primary).toBe("#980F84");
    expect(SOP_COLORS.dark).toBe("#2C1028");

    // Check personnel in structure (Sheet 1)
    const sheet1 = BD_PROJECT_DEVT_SOP.sheets[0]!;
    const orgBlock = sheet1.blocks.find((b) => b.title === "Organizational Structure");
    expect(orgBlock).toBeDefined();
    if (orgBlock && orgBlock.kind === "table") {
      const names = orgBlock.rows.map((r) => r[1]);
      expect(names).toContain("Yusuf Yaru Umaru");
      expect(names).toContain("Kunle");
      expect(names).toContain("Tomiwa");
      expect(names).toContain("Seun Oladele");
    }

    // Check approval workflow stages in Sheet 3 (Process Documentation)
    const sheet3 = BD_PROJECT_DEVT_SOP.sheets[2]!;
    const procBlock = sheet3.blocks.find((b) => b.kind === "table");
    expect(procBlock).toBeDefined();
    if (procBlock && procBlock.kind === "table") {
      const allText = procBlock.rows.flat().join(" ");
      expect(allText).toContain("Dr. Seun");
      expect(allText).toContain("Mr. Damilola");
    }
  });

  it("generates executable Google Colab Python script containing pandas and openpyxl", () => {
    const pythonScript = generateSopColabPythonScript(BD_PROJECT_DEVT_SOP);
    expect(pythonScript).toContain("import pandas as pd");
    expect(pythonScript).toContain("import openpyxl");
    expect(pythonScript).toContain("980F84");
    expect(pythonScript).toContain("Yusuf Yaru Umaru");
    expect(pythonScript).toContain("Mr. Damilola");
  });

  it("generates valid Excel buffer without errors", async () => {
    const buffer = await generateSopExcelBuffer(BD_PROJECT_DEVT_SOP);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
