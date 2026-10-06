import { Metadata } from "next";
import { SopWorkbookViewer } from "@/components/sop-workbook/sop-workbook-viewer";

export const metadata: Metadata = {
  title: "BD & Project Devt Unit SOP Workbook | GrantSift OS",
  description:
    "Standard Operating Procedure (SOP) Excel-structured workbook for the Business Development and Projects Development Unit with export to Excel and Google Colab.",
};

export default function SopWorkbookPage() {
  return (
    <div className="space-y-6">
      <SopWorkbookViewer />
    </div>
  );
}
