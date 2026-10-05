"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AFRICAN_COUNTRIES = [
  "Nigeria",
  "Kenya",
  "Ghana",
  "South Africa",
  "Rwanda",
  "Uganda",
  "Tanzania",
  "Egypt",
  "Senegal",
  "Côte d'Ivoire",
  "Ethiopia",
  "Morocco",
  "Cameroon",
  "Zambia",
  "Zimbabwe",
  "Sierra Leone",
  "Liberia",
  "Gambia",
  "Benin",
  "Togo",
  "Burkina Faso",
  "Mali",
  "Niger",
  "Chad",
  "Global / International",
];

const ORG_TYPES = [
  "Startup",
  "Business",
  "NGO",
  "Nonprofit",
  "Social enterprise",
  "University",
  "Research institution",
  "Community organization",
  "Individual researcher",
  "Consultant",
  "Government/non-government program",
  "Other",
];

const SECTORS = [
  "Artificial Intelligence & Civic Tech",
  "Information Integrity & Digital Trust",
  "Clean Energy & Climate Action",
  "Agriculture & Food Security",
  "Healthcare & HealthTech",
  "Fintech & Financial Inclusion",
  "Education & EdTech",
  "Water & Sanitation",
  "Women-Led Enterprises",
  "Youth Empowerment",
  "Creative & Digital Economy",
  "Social Justice & Human Rights",
];

const STAGES = [
  "Idea",
  "Prototype / Pilot",
  "Pre-Seed",
  "Seed",
  "Early Stage",
  "Growth",
  "Scale-Up",
];

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Tell us about your organization
  const [name, setName] = useState("Rumour Shield");
  const [orgType, setOrgType] = useState("Startup");
  const [country, setCountry] = useState("Nigeria");
  const [location, setLocation] = useState("Lagos, Nigeria");
  const [website, setWebsite] = useState("https://rumourshield.org");
  const [currentFunding, setCurrentFunding] = useState("0");
  const [grantsReceived12m, setGrantsReceived12m] = useState("0");
  const [currentPrograms, setCurrentPrograms] = useState("Multilingual claim verification and media literacy training");
  const [sector, setSector] = useState("Artificial Intelligence & Civic Tech");
  const [stage, setStage] = useState("Early Stage");
  const [geographicFocus, setGeographicFocus] = useState("Nigeria & West Africa");

  // Step 2: Confirm a few organization details
  const [registrationStatus, setRegistrationStatus] = useState("Incorporated (CAC / Legal Entity)");
  const [revenue, setRevenue] = useState("25000");
  const [employees, setEmployees] = useState("6");
  const [fundingReceived, setFundingReceived] = useState("10000");
  const [fundingSeeking, setFundingSeeking] = useState("150000");
  const [typicalProjectSize, setTypicalProjectSize] = useState("50000");
  const [beneficiaries, setBeneficiaries] = useState("Citizens, journalists, civic organizations, and mobile users");
  const [mission, setMission] = useState("Equipping African communities with reliable information verification to counter misinformation and protect public trust.");
  const [problemAddressed, setProblemAddressed] = useState("Pervasive misinformation across WhatsApp and social platforms fueling civic distrust and public health panic.");

  // Step 3: Tell us more about what you do (Natural Language)
  const [narrative, setNarrative] = useState(
    "Rumour Shield is a multilingual claim verification platform helping African users verify claims, links, screenshots, audio, and video before sharing. We operate in Nigeria with expansion plans across West Africa. Our platform supports local languages (Yoruba, Hausa, Igbo, Pidgin) to combat digital misinformation in local communities."
  );

  // Step 4: Synthesized AI Funding Profile
  const [primarySectors, setPrimarySectors] = useState<string[]>([
    "Artificial Intelligence",
    "Information Integrity",
    "Digital Trust",
    "Civic Technology",
    "Media Literacy",
  ]);
  const [technologyKeywords, setTechnologyKeywords] = useState<string[]>([
    "Multilingual AI",
    "Claim Verification",
    "NLP",
    "Image & Audio Analysis",
    "Mobile Verification",
  ]);
  const [fundingInterests, setFundingInterests] = useState<string[]>([
    "AI Grants",
    "Responsible AI",
    "Information Integrity Funding",
    "Civic Tech Non-dilutive Grants",
    "Democracy & Digital Rights",
  ]);
  const [targetMin, setTargetMin] = useState(25000);
  const [targetMax, setTargetMax] = useState(250000);
  const [summaryNarrative, setSummaryNarrative] = useState(
    "Rumour Shield is an early-stage civic technology initiative in Nigeria leveraging artificial intelligence to build information integrity and media resilience across African communities."
  );

  // Step 5: Account & Workspace Finalization
  const [phoneNumber, setPhoneNumber] = useState("+234 803 000 0000");

  const handleSynthesizeProfile = async () => {
    setIsSynthesizing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/onboarding/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName: name,
          orgType,
          country,
          geographicFocus,
          sector,
          stage,
          mission,
          problemStatement: problemAddressed,
          detailedDescription: narrative,
          fundingCurrentlySeeking: Number(fundingSeeking) || 150000,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setPrimarySectors(data.profile.primarySectors);
        setTechnologyKeywords(data.profile.technologyKeywords);
        setFundingInterests(data.profile.fundingInterests);
        setTargetMin(data.profile.targetAwardMin);
        setTargetMax(data.profile.targetAwardMax);
        setSummaryNarrative(data.profile.summaryNarrative);
      }
    } catch {
      // Keep defaults
    } finally {
      setIsSynthesizing(false);
      setStep(4);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: {
            name,
            orgType,
            country,
            location,
            website,
            currentGrantFunding: Number(currentFunding) || 0,
            grantsReceivedLast12m: Number(grantsReceived12m) || 0,
            currentGrantPrograms: currentPrograms,
            sector,
            stage,
            geographicFocus,
            registrationStatus,
            revenue: Number(revenue) || 0,
            teamSize: Number(employees) || 1,
            fundingReceived: Number(fundingReceived) || 0,
            fundingCurrentlySeeking: Number(fundingSeeking) || 150000,
            typicalProjectSize: Number(typicalProjectSize) || 50000,
            targetBeneficiaries: beneficiaries,
            mission,
            primaryProblemAddressed: problemAddressed,
            detailedDescription: narrative,
            phoneNumber,
          },
          fundingProfile: {
            primarySectors,
            technologyKeywords,
            fundingInterests,
            targetAwardMin: targetMin,
            targetAwardMax: targetMax,
            summaryNarrative,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard?onboarded=true");
      } else {
        setErrorMsg(data.error || "Could not complete onboarding. Please verify details and retry.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-paper-line bg-paper-raised p-6 sm:p-10 shadow-xl backdrop-blur-xl">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-faint mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && "1. Organization Profile"}
            {step === 2 && "2. Organization Details"}
            {step === 3 && "3. Tell Us More"}
            {step === 4 && "4. AI Funding Profile"}
            {step === 5 && "5. Secure Account & Workspace"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-paper">
          <div
            className="h-full bg-ink transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Tell us about your organization */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Tell us about your organization</h2>
            <p className="mt-1 text-xs text-ink-soft">
              We&apos;ll use this information to personalize your grant matches across Africa and global funders.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">Organization Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="e.g. Rumour Shield"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Organization Type *</label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Country (Headquarters) *</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              >
                {AFRICAN_COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Location / State / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Sector *</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Operational Stage *</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              >
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Current Grant Funding (USD)</label>
              <input
                type="number"
                value={currentFunding}
                onChange={(e) => setCurrentFunding(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Grants Received (Last 12 Months)</label>
              <input
                type="number"
                value={grantsReceived12m}
                onChange={(e) => setGrantsReceived12m(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-paper hover:bg-stamp-dark transition-all"
            >
              Continue to Details &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Confirm organization details */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Confirm a few organization details</h2>
            <p className="mt-1 text-xs text-ink-soft">
              This helps us match you to funders that support organizations like yours. No funder URL is required.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Registration Status *</label>
              <select
                value={registrationStatus}
                onChange={(e) => setRegistrationStatus(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              >
                <option value="Incorporated (CAC / Legal Entity)">Incorporated (CAC / Legal Entity)</option>
                <option value="Registered Business Name">Registered Business Name</option>
                <option value="Incorporated Trustees / NGO">Incorporated Trustees / NGO</option>
                <option value="Registration in Progress">Registration in Progress</option>
                <option value="Unregistered / Community Project">Unregistered / Community Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Team Size (Employees / Core Staff)</label>
              <input
                type="number"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Annual Revenue / Budget (USD)</label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Target Funding Currently Seeking (USD) *</label>
              <input
                type="number"
                value={fundingSeeking}
                onChange={(e) => setFundingSeeking(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">Target Beneficiaries *</label>
              <input
                type="text"
                value={beneficiaries}
                onChange={(e) => setBeneficiaries(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="e.g. Smallholder farmers, young innovators, peri-urban households"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">Organization Mission *</label>
              <textarea
                rows={2}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink mb-1">Primary Problem Addressed *</label>
              <textarea
                rows={2}
                value={problemAddressed}
                onChange={(e) => setProblemAddressed(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2 text-xs text-ink outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-paper-line px-5 py-2.5 text-xs font-medium text-ink hover:bg-paper"
            >
              &larr; Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-paper hover:bg-stamp-dark transition-all"
            >
              Continue to Narrative &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Tell us more about what you do */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Tell us more about what you do</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Describe in your own words what you do, the problem, your solution, who you serve, and what funding you need. Our AI will automatically transform this into a structured funding profile.
            </p>
          </div>

          <div>
            <textarea
              rows={8}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="w-full rounded-2xl border border-paper-line bg-paper p-4 text-xs leading-relaxed text-ink outline-none focus:border-ink shadow-inner font-mono"
              placeholder="e.g. Rumour Shield is an AI-powered verification platform..."
            />
            <p className="mt-1.5 text-[11px] text-ink-faint">
              You can write naturally. The AI Grant Discovery Engine will extract sectors, technologies, and funding priorities.
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-paper-line px-5 py-2.5 text-xs font-medium text-ink hover:bg-paper"
            >
              &larr; Back
            </button>
            <button
              type="button"
              disabled={isSynthesizing}
              onClick={handleSynthesizeProfile}
              className="flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-paper hover:bg-stamp-dark transition-all disabled:opacity-50"
            >
              {isSynthesizing ? "Synthesizing Profile..." : "Build AI Funding Profile ✨"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AI Funding Profile Review & Editing */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Review your AI Funding Profile</h2>
            <p className="mt-1 text-xs text-ink-soft">
              The AI synthesized your profile into structured criteria. You can edit these tags before proceeding.
            </p>
          </div>

          <div className="rounded-2xl border border-paper-line bg-paper p-5 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                Primary Sectors
              </label>
              <div className="flex flex-wrap gap-1.5">
                {primarySectors.map((sec, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-paper-line bg-paper-raised px-2.5 py-1 text-xs font-semibold text-ink"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                Technology Capabilities
              </label>
              <div className="flex flex-wrap gap-1.5">
                {technologyKeywords.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                Target Funding Interests
              </label>
              <div className="flex flex-wrap gap-1.5">
                {fundingInterests.map((fi, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-950"
                  >
                    {fi}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-paper-line">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                Funding Range Target (USD)
              </label>
              <div className="flex items-center gap-3 text-xs font-semibold text-ink">
                <span>${targetMin.toLocaleString()}</span>
                <span className="text-ink-faint">&mdash;</span>
                <span>${targetMax.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-paper-line">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">
                Positioning Narrative
              </label>
              <p className="text-xs text-ink-soft leading-relaxed italic">
                &ldquo;{summaryNarrative}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-paper-line px-5 py-2.5 text-xs font-medium text-ink hover:bg-paper"
            >
              &larr; Back to Narrative
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-xl bg-ink px-6 py-2.5 text-xs font-bold text-paper hover:bg-stamp-dark transition-all"
            >
              Confirm Profile &amp; Secure Workspace &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Account & Workspace Creation */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Secure your account and workspace</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Finalize your organization details to create your dedicated grant operating workspace.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Official Contact Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-paper-line bg-paper px-3.5 py-2.5 text-xs text-ink outline-none focus:border-ink"
                placeholder="+234 ..."
              />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <span>✨</span>
                <span>Ready to Launch Your Grant Operating System</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-emerald-900 text-[11px]">
                <li>Organization workspace will be initialized for <strong>{name}</strong></li>
                <li>AI Funding Profile activated with <strong>{primarySectors.length} sectors</strong> and <strong>{fundingInterests.length} funding interests</strong></li>
                <li>Transactional onboarding and verification alerts connected via Brevo</li>
                <li>Instant matching across 40,000+ verified African and international grants</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-xl border border-paper-line px-5 py-2.5 text-xs font-medium text-ink hover:bg-paper"
            >
              &larr; Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCompleteOnboarding}
              className="flex items-center gap-2 rounded-xl bg-ink px-8 py-3 text-xs font-bold text-paper hover:bg-stamp-dark transition-all disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Initializing Workspace..." : "Complete Onboarding & Enter OS 🚀"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
