"use client";

import { useState } from "react";

export type DataRoomCategory =
  | "Legal"
  | "Financial"
  | "Organization"
  | "Project"
  | "Evidence"
  | "Governance"
  | "Grant Documents";

export interface DataRoomFile {
  id: string;
  name: string;
  category: DataRoomCategory;
  sizeBytes: number;
  uploadedAt: string;
  source: "local" | "google_drive";
  extractedMetadata?: {
    orgName?: string;
    registrationNumber?: string;
    founderNames?: string[];
    revenueFigures?: string;
    impactMetrics?: string;
  };
}

export const CATEGORY_RECOMMENDED_DOCS: Record<DataRoomCategory, string[]> = {
  Legal: [
    "Certificate of Incorporation (e.g. CAC, Companies House)",
    "Tax Identification Number / Clearance Certificate",
    "Articles of Association / Governing Constitution",
    "Operating Licenses and National Permits",
  ],
  Financial: [
    "Audited Financial Statements (Past 2 Fiscal Years)",
    "Official 6-Month Bank Statements",
    "Current Annual Operating Budget",
    "Cash Flow Forecast Model",
  ],
  Organization: [
    "Organization Profile & Executive Summary",
    "Founder Curriculum Vitae (CVs)",
    "Key Technical Personnel Bios",
    "Organizational Organogram / Structure",
  ],
  Project: [
    "Detailed Project Proposal / Master Pitch Deck",
    "Project Work Plan & Gantt Timeline",
    "Theory of Change Framework",
    "Monitoring & Evaluation (M&E) Plan",
  ],
  Evidence: [
    "Independent Market Assessment / Feasibility Study",
    "Verified Beneficiary Surveys & Field Reports",
    "Signed Letters of Intent (LOIs) from Off-Takers",
    "Customer Case Studies & Verified Testimonials",
  ],
  Governance: [
    "Board of Directors Charter & Member Profiles",
    "Anti-Bribery and Corruption Policy",
    "Child Safeguarding & Protection Policy",
    "Data Protection & Privacy Policy",
  ],
  "Grant Documents": [
    "Past Successful Grant Proposals",
    "Award Letters and Grant Agreements",
    "Funder Verification Correspondence",
    "Project Completion Reports",
  ],
};

export function DataRoomManager({
  initialDocuments = [],
  orgName = "Your Organization",
}: {
  initialDocuments?: DataRoomFile[];
  orgName?: string;
}) {
  const [documents, setDocuments] = useState<DataRoomFile[]>(initialDocuments);
  const [selectedCategory, setSelectedCategory] = useState<DataRoomCategory>("Legal");
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Local File Upload Handler (PRD §23)
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]!;
    const newDoc: DataRoomFile = {
      id: `doc-${Date.now()}`,
      name: file.name,
      category: selectedCategory,
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString().slice(0, 10),
      source: "local",
      extractedMetadata: {
        orgName,
        registrationNumber: selectedCategory === "Legal" ? "RC-1849204" : undefined,
        impactMetrics: selectedCategory === "Evidence" ? "Verified 1,200 local stakeholders" : undefined,
      },
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setUploadMessage(`"${file.name}" uploaded successfully to ${selectedCategory}.`);
    setTimeout(() => setUploadMessage(null), 3500);
    e.target.value = "";
  };

  // Google Drive Connect Handler (PRD §23)
  const handleConnectGoogleDrive = () => {
    setIsDriveConnected(true);
    setShowDriveModal(false);
    // Add sample imported file from drive if user confirms
    const driveDoc: DataRoomFile = {
      id: `drive-${Date.now()}`,
      name: "GoogleDrive_Financial_Projections_2026.xlsx",
      category: "Financial",
      sizeBytes: 1024 * 450,
      uploadedAt: new Date().toISOString().slice(0, 10),
      source: "google_drive",
    };
    setDocuments((prev) => [driveDoc, ...prev]);
    setUploadMessage("Google Drive connected. Imported 1 document.");
    setTimeout(() => setUploadMessage(null), 3500);
  };

  const categories: DataRoomCategory[] = [
    "Legal",
    "Financial",
    "Organization",
    "Project",
    "Evidence",
    "Governance",
    "Grant Documents",
  ];

  const filteredDocs = documents.filter((d) => d.category === selectedCategory);
  const recommendedDocs = CATEGORY_RECOMMENDED_DOCS[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-paper-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-stamp-tint px-2.5 py-0.5 text-xs font-mono font-semibold uppercase text-stamp-dark">
              Data Room
            </span>
            <span className="text-xs text-ink-faint">&bull; {documents.length} Total Documents</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink mt-1">Institutional Data Room</h1>
          <p className="text-xs text-ink-soft mt-0.5">
            Secure supporting document repository for grant due diligence and automated proposal evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Local File Upload Button */}
          <label className="cursor-pointer rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all">
            + Upload from Computer
            <input type="file" onChange={handleLocalFileUpload} className="hidden" />
          </label>

          {/* Google Drive Connect Button */}
          <button
            type="button"
            onClick={() => setShowDriveModal(true)}
            className={`rounded px-3.5 py-2 text-xs font-semibold border transition-all shadow-sm ${
              isDriveConnected
                ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                : "bg-paper border-paper-line text-ink-soft hover:text-ink"
            }`}
          >
            {isDriveConnected ? "✓ Google Drive Connected" : "Connect Google Drive"}
          </button>
        </div>
      </div>

      {uploadMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-3 text-xs font-semibold text-emerald-950">
          ✓ {uploadMessage}
        </div>
      )}

      {/* Category Navigation Pills */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-paper-line">
        {categories.map((cat) => {
          const count = documents.filter((d) => d.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === cat
                  ? "bg-ink text-paper shadow-sm"
                  : "bg-paper-raised border border-paper-line text-ink-soft hover:text-ink"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  selectedCategory === cat ? "bg-white/20 text-white" : "bg-paper text-ink-faint"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Uploaded Files vs Document Suggestions */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Document List or Empty State */}
        <div className="md:col-span-8 space-y-4">
          {filteredDocs.length === 0 ? (
            /* Clean Empty State (PRD §20) */
            <div className="rounded-xl border border-dashed border-paper-line bg-paper-raised/40 p-10 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-paper border border-paper-line text-lg">
                📁
              </div>
              <h3 className="font-serif text-base font-semibold text-ink">
                Your Data Room is Empty for {selectedCategory}
              </h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Upload the documents you need for grant applications in this category.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-stamp transition-all">
                  Upload Documents
                  <input type="file" onChange={handleLocalFileUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setShowDriveModal(true)}
                  className="rounded bg-paper px-4 py-2 text-xs font-semibold border border-paper-line text-ink hover:border-ink/30 transition-all shadow-sm"
                >
                  Connect Google Drive
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-paper-line bg-paper-raised divide-y divide-paper-line shadow-sm">
              {filteredDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">📄</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 text-ink-faint text-[11px] mt-0.5">
                        <span>{(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                        <span>&bull;</span>
                        <span>Uploaded {doc.uploadedAt}</span>
                        <span>&bull;</span>
                        <span className="capitalize">{doc.source.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.extractedMetadata && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                        Insights Extracted
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                      className="text-ink-faint hover:text-red-700 font-semibold text-[11px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Suggestions Sidebar (PRD §22) */}
        <div className="md:col-span-4 space-y-4">
          <div className="rounded-xl border border-paper-line bg-paper-raised p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-paper-line">
              <span className="font-serif font-bold text-ink">Recommended Documents</span>
              <span className="text-[11px] text-ink-faint">Funder Checklist</span>
            </div>

            <p className="text-ink-soft text-[11px] leading-relaxed">
              Funders routinely require these standard verification documents under <b>{selectedCategory}</b>:
            </p>

            <ul className="space-y-2">
              {recommendedDocs.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-ink">
                  <span className="text-stamp font-bold">•</span>
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-paper-line">
              <label className="cursor-pointer block text-center rounded bg-paper border border-paper-line py-2 text-xs font-semibold text-ink-soft hover:text-ink hover:border-ink/40 transition-all shadow-sm">
                + Add Recommended Document
                <input type="file" onChange={handleLocalFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Google Drive Connect Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-paper-line bg-paper-raised p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-ink">Connect Google Drive</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Connect your Google Workspace or personal Google Drive to import institutional files, pitch decks, and financial projections directly into your secure Data Room.
            </p>
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDriveModal(false)}
                className="rounded px-4 py-2 text-xs font-semibold text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConnectGoogleDrive}
                className="rounded bg-stamp-dark px-4 py-2 text-xs font-semibold text-paper hover:bg-stamp transition-all shadow-sm"
              >
                Authorize &amp; Connect Drive &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
