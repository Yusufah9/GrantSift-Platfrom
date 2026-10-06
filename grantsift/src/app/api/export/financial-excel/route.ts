import { NextRequest, NextResponse } from "next/server";
import { FinancialModelEngine } from "@/lib/finance/financial-model-engine";
import {
  generateFinancialModelExcelBuffer,
  generateFinancialModelColabPythonScript,
} from "@/lib/finance/financial-model-export";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { inputs, format } = body;

    const engine = new FinancialModelEngine(inputs || {});

    if (format === "python") {
      const script = generateFinancialModelColabPythonScript(engine.toAssumptions());
      return new NextResponse(script, {
        headers: {
          "Content-Type": "text/x-python; charset=utf-8",
          "Content-Disposition": 'attachment; filename="universal_financial_model_colab.py"',
        },
      });
    }

    const buffer = await generateFinancialModelExcelBuffer(engine.toAssumptions());
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${(engine.inputs.companyName || "Financial_Model").replace(/\s+/g, "_")}_5Yr_Model.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Failed to generate financial export:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const engine = new FinancialModelEngine({});

    if (format === "python") {
      const script = generateFinancialModelColabPythonScript(engine.toAssumptions());
      return new NextResponse(script, {
        headers: {
          "Content-Type": "text/x-python; charset=utf-8",
          "Content-Disposition": 'attachment; filename="universal_financial_model_colab.py"',
        },
      });
    }

    const buffer = await generateFinancialModelExcelBuffer(engine.toAssumptions());
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Universal_Financial_Model_5Yr.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("Failed to generate financial export:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
