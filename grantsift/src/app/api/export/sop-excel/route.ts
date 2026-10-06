import { NextRequest, NextResponse } from "next/server";
import { generateSopExcelBuffer, generateSopColabPythonScript } from "@/lib/sop-workbook/workbook-export";
import { BD_PROJECT_DEVT_SOP } from "@/lib/sop-workbook/bd-sop-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { workbook, format } = body;
    const targetWorkbook: any = workbook || BD_PROJECT_DEVT_SOP;

    if (format === "python") {
      const script = generateSopColabPythonScript(targetWorkbook);
      return new NextResponse(script, {
        headers: {
          "Content-Type": "text/x-python; charset=utf-8",
          "Content-Disposition": 'attachment; filename="bd_project_devt_sop_colab.py"',
        },
      });
    }

    const buffer = await generateSopExcelBuffer(targetWorkbook);
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${(targetWorkbook.unit || "SOP_Workbook").replace(/\s+/g, "_")}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error("Failed to generate SOP export:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    if (format === "python") {
      const script = generateSopColabPythonScript(BD_PROJECT_DEVT_SOP);
      return new NextResponse(script, {
        headers: {
          "Content-Type": "text/x-python; charset=utf-8",
          "Content-Disposition": 'attachment; filename="bd_project_devt_sop_colab.py"',
        },
      });
    }

    const buffer = await generateSopExcelBuffer(BD_PROJECT_DEVT_SOP);
    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="BD_Project_Devt_Unit_SOP.xlsx"',
      },
    });
  } catch (error: any) {
    console.error("Failed to generate SOP export:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
