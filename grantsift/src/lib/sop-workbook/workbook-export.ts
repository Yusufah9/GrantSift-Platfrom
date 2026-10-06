import ExcelJS from "exceljs";
import { BD_PROJECT_DEVT_SOP, SOP_COLORS, type SopWorkbook } from "./bd-sop-data";

/**
 * Builds an Excel workbook (.xlsx) using ExcelJS for the BD & Project Devt SOP.
 * Applies the user's specified primary color (#980F84), clean headers, and borders.
 */
export async function generateSopExcelBuffer(workbookData: SopWorkbook = BD_PROJECT_DEVT_SOP): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "GrantSift Platform";
  wb.lastModifiedBy = workbookData.owner;
  wb.created = new Date();
  wb.modified = new Date();

  // Primary color in ARGB (FF980F84)
  const PRIMARY_ARGB = "FF980F84";
  const DARK_ARGB = "FF2C1028";
  const TINT_ARGB = "FFF7EAF5";
  const BORDER_ARGB = "FFE3C6DE";

  for (const sheetDef of workbookData.sheets) {
    const ws = wb.addWorksheet(sheetDef.tab, {
      views: [{ showGridLines: true }],
      properties: { tabColor: { argb: PRIMARY_ARGB } },
    });

    // Sheet title banner
    const titleRow = ws.addRow([sheetDef.title]);
    titleRow.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleRow.alignment = { vertical: "middle", horizontal: "left" };
    titleRow.height = 36;
    titleRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: PRIMARY_ARGB },
    };

    ws.addRow([]); // Blank spacer

    for (const block of sheetDef.blocks) {
      // Block Header
      const headerRow = ws.addRow([block.title]);
      headerRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.alignment = { vertical: "middle", horizontal: "left" };
      headerRow.height = 24;
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: DARK_ARGB },
      };

      if (block.kind === "text") {
        const r = ws.addRow([block.body]);
        r.font = { name: "Calibri", size: 10 };
        r.alignment = { wrapText: true, vertical: "top" };
        r.height = 40;
      } else if (block.kind === "list") {
        for (const item of block.items) {
          const r = ws.addRow([`• ${item}`]);
          r.font = { name: "Calibri", size: 10 };
          r.alignment = { wrapText: true };
        }
      } else if (block.kind === "fields") {
        for (let i = 0; i < block.rows.length; i++) {
          const rowItem = block.rows[i];
          if (!rowItem) continue;
          const [label, val] = rowItem;
          const r = ws.addRow([label, val]);
          r.font = { name: "Calibri", size: 10 };
          r.getCell(1).font = { name: "Calibri", size: 10, bold: true };
          if (i % 2 === 1) {
            r.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: TINT_ARGB },
            };
          }
        }
      } else if (block.kind === "table") {
        // Table Columns Header
        const colRow = ws.addRow(block.columns);
        colRow.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
        colRow.height = 22;
        colRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: PRIMARY_ARGB },
        };

        for (let i = 0; i < block.rows.length; i++) {
          const r = ws.addRow(block.rows[i]);
          r.font = { name: "Calibri", size: 10 };
          r.alignment = { wrapText: true, vertical: "top" };
          if (i % 2 === 1) {
            r.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: TINT_ARGB },
            };
          }
          for (let c = 1; c <= block.columns.length; c++) {
            r.getCell(c).border = {
              top: { style: "thin", color: { argb: BORDER_ARGB } },
              bottom: { style: "thin", color: { argb: BORDER_ARGB } },
              left: { style: "thin", color: { argb: BORDER_ARGB } },
              right: { style: "thin", color: { argb: BORDER_ARGB } },
            };
          }
        }
      }

      ws.addRow([]); // Blank spacer between blocks
    }

    // Auto-fit column widths
    ws.columns.forEach((column, idx) => {
      if (idx === 0) {
        column.width = 30;
      } else if (idx === 1) {
        column.width = 45;
      } else {
        column.width = 35;
      }
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer as ArrayBuffer);
}

/**
 * Generates a Python script that can be uploaded or pasted into Google Colab.
 * Uses pandas and openpyxl with the exact colors (#980F84) to generate the SOP Excel workbook.
 */
export function generateSopColabPythonScript(workbookData: SopWorkbook = BD_PROJECT_DEVT_SOP): string {
  const jsonStr = JSON.stringify(workbookData, null, 2);

  return `# ==============================================================================
# BD & PROJECT DEVT UNIT - STANDARD OPERATING PROCEDURE (SOP) WORKBOOK GENERATOR
# Compatible with Google Colab, Jupyter Notebooks, and Local Python environments.
#
# Generates an Excel workbook with 9 formatted tabs adhering to the IT SOP structure.
# Primary Color: #980F84 (Specified by user)
# ==============================================================================

# Install openpyxl, pandas, numpy if running in a fresh Colab environment
# !pip install openpyxl pandas numpy

import json
import pandas as pd
import numpy as np
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Raw SOP Data Structure
sop_data = ${jsonStr}

wb = openpyxl.Workbook()
# Remove default sheet
if "Sheet" in wb.sheetnames:
    wb.remove(wb["Sheet"])

# Theme Colors
PRIMARY_HEX = "980F84"
DARK_HEX = "2C1028"
TINT_HEX = "F7EAF5"
BORDER_HEX = "E3C6DE"
WHITE_HEX = "FFFFFF"

primary_fill = PatternFill(start_color=PRIMARY_HEX, end_color=PRIMARY_HEX, fill_type="solid")
dark_fill = PatternFill(start_color=DARK_HEX, end_color=DARK_HEX, fill_type="solid")
tint_fill = PatternFill(start_color=TINT_HEX, end_color=TINT_HEX, fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color=BORDER_HEX),
    right=Side(style='thin', color=BORDER_HEX),
    top=Side(style='thin', color=BORDER_HEX),
    bottom=Side(style='thin', color=BORDER_HEX)
)

for sheet_def in sop_data["sheets"]:
    ws = wb.create_sheet(title=sheet_def["tab"][:31])
    ws.sheet_properties.tabColor = PRIMARY_HEX

    # Title Banner
    ws.append([sheet_def["title"]])
    title_cell = ws.cell(row=1, column=1)
    title_cell.font = Font(name="Calibri", size=15, bold=True, color=WHITE_HEX)
    title_cell.fill = primary_fill
    title_cell.alignment = Alignment(vertical="center", horizontal="left")
    ws.row_dimensions[1].height = 36

    ws.append([]) # Spacer

    current_row = 3
    for block in sheet_def["blocks"]:
        # Block Header
        ws.append([block["title"]])
        h_cell = ws.cell(row=current_row, column=1)
        h_cell.font = Font(name="Calibri", size=12, bold=True, color=WHITE_HEX)
        h_cell.fill = dark_fill
        h_cell.alignment = Alignment(vertical="center")
        ws.row_dimensions[current_row].height = 24
        current_row += 1

        if block["kind"] == "text":
            ws.append([block["body"]])
            c = ws.cell(row=current_row, column=1)
            c.font = Font(name="Calibri", size=10)
            c.alignment = Alignment(wrap_text=True, vertical="top")
            ws.row_dimensions[current_row].height = 45
            current_row += 1

        elif block["kind"] == "list":
            for item in block["items"]:
                ws.append([f"• {item}"])
                c = ws.cell(row=current_row, column=1)
                c.font = Font(name="Calibri", size=10)
                c.alignment = Alignment(wrap_text=True)
                current_row += 1

        elif block["kind"] == "fields":
            for idx, (label, val) in enumerate(block["rows"]):
                ws.append([label, val])
                c1 = ws.cell(row=current_row, column=1)
                c2 = ws.cell(row=current_row, column=2)
                c1.font = Font(name="Calibri", size=10, bold=True)
                c2.font = Font(name="Calibri", size=10)
                if idx % 2 == 1:
                    c1.fill = tint_fill
                    c2.fill = tint_fill
                current_row += 1

        elif block["kind"] == "table":
            # Table Header
            ws.append(block["columns"])
            for c_idx in range(1, len(block["columns"]) + 1):
                col_cell = ws.cell(row=current_row, column=c_idx)
                col_cell.font = Font(name="Calibri", size=10, bold=True, color=WHITE_HEX)
                col_cell.fill = primary_fill
                col_cell.alignment = Alignment(vertical="center", horizontal="left")
            ws.row_dimensions[current_row].height = 22
            current_row += 1

            # Rows
            for r_idx, r_data in enumerate(block["rows"]):
                ws.append(r_data)
                for c_idx in range(1, len(r_data) + 1):
                    cell = ws.cell(row=current_row, column=c_idx)
                    cell.font = Font(name="Calibri", size=10)
                    cell.border = thin_border
                    cell.alignment = Alignment(wrap_text=True, vertical="top")
                    if r_idx % 2 == 1:
                        cell.fill = tint_fill
                current_row += 1

        ws.append([]) # Spacer between blocks
        current_row += 1

    # Column widths
    ws.column_dimensions['A'].width = 32
    ws.column_dimensions['B'].width = 46
    ws.column_dimensions['C'].width = 38
    ws.column_dimensions['D'].width = 28
    ws.column_dimensions['E'].width = 28
    ws.column_dimensions['F'].width = 28

output_filename = "BD_and_Project_Devt_SOP_Workbook.xlsx"
wb.save(output_filename)
print(f"Successfully generated SOP workbook: {output_filename}")
`;
}
