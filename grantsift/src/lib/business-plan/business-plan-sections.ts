/**
 * Comprehensive 33-Section Investor-Grade Business Plan Specifications
 *
 * Implements the Ultimate Data-Driven Business Plan Architecture:
 * - 33 investor-grade sections covering strategy, market, operations, finance, and exit
 * - Strict Data Integrity Standards: One-Line Test, Real Metrics Only, No AI clichés
 * - Critical Consistency Rule: TAM/SAM/SOM aligns exactly with Year 5 Financial Model revenue
 * - Full URIO Framework, SWOT with SO/WO/ST/WT, PESTEL, and 8-category Risk Matrix
 */

export interface BusinessPlanSectionDef {
  id: string;
  sectionNumber: number;
  title: string;
  category:
    | "Executive Foundation"
    | "Market Opportunity & Customers"
    | "Solution & Product"
    | "Strategy & Go-To-Market"
    | "Operations & Management"
    | "Strategic Frameworks"
    | "Financial Model & Projections"
    | "Governance, Exit & Compliance";
  objective: string;
  requiredComponents: string[];
  dataRequirements: string[];
  defaultContent: string;
}

export const BUSINESS_PLAN_SECTIONS: BusinessPlanSectionDef[] = [
  {
    id: "sec-01",
    sectionNumber: 1,
    title: "Cover Page",
    category: "Executive Foundation",
    objective: "Establish professional identity, confidentiality, and institutional credibility.",
    requiredComponents: [
      "Company Name and Logo",
      "One-line clear value proposition",
      "Target Industry & Sector",
      "Geographic focus",
      "Current Funding Round",
      "Confidentiality notice and contact information",
    ],
    dataRequirements: ["Official corporate registration", "Verified corporate contacts"],
    defaultContent: `8thGear Hub & Venture Studio
Standard Operating Unit: Business Development & Project Development
Document: Institutional Investor-Grade Business Plan (5-Year Projection)
Jurisdiction: Lagos, Nigeria & West Africa
Prepared by: Yusuf Yaru Umaru (Growth Associate) with Dr. Seun & Mr. Damilola

Confidentiality Notice:
This document contains confidential operational, technical, and financial intelligence. Distributed strictly for authorized evaluation. All rights reserved.`,
  },
  {
    id: "sec-02",
    sectionNumber: 2,
    title: "Table of Contents",
    category: "Executive Foundation",
    objective: "Provide clear navigation through all 33 institutional sections.",
    requiredComponents: ["Complete section listing with page and category references"],
    dataRequirements: ["Internal hyperlinks to references and financial schedules"],
    defaultContent: `Table of Contents:
1. Cover Page
2. Table of Contents
3. Executive Summary
4. Benefits for Africa & Regional Impact
5. Our Vision
6. Our Mission
7. Key Drivers to Success
8. Our Company Values
9. Company Overview & Legal Structure
10. Main Phases & Lifecycle Roadmap
11. Products & Technology Architecture
12. Key Performance Components
13. Target Market & Target Groups (TAM/SAM/SOM)
14. Pain Points & Solutions
15. Our Products and Services Portfolio
16. Our Management Team & Org Structure
17. History & Roadmap
18. Business Model Canvas & Scalability
19. Revenue Model & Unit Economics
20. Organizational & Marketing Tasks
21. Marketing Plan & Strategy (Go-To-Market)
22. Digital Marketing Strategy
23. Competitors Analysis & Matrix
24. SWOT Analysis (SO, WO, ST, WT Strategies)
25. PESTEL Analysis
26. URIO Investment Framework
27. Operations & Supply Chain Plan
28. Industry Analysis & Growth Indicators
29. Risks & Mitigation Strategies (8 Categories)
30. Financial Information & Three Statements
31. Exit Strategy & Investor Returns
32. Glossary of Key Terms
33. Disclaimer & Legal Notice`,
  },
  {
    id: "sec-03",
    sectionNumber: 3,
    title: "Executive Summary",
    category: "Executive Foundation",
    objective: "Deliver a compelling 2-page overview of the business opportunity.",
    requiredComponents: [
      "Business Concept (2-3 sentences)",
      "Market Opportunity (TAM/SAM/SOM summary)",
      "Competitive Advantage & Defensible Moats",
      "Business Model Summary",
      "Financial Highlights (Year 1 to 5 revenue, EBITDA, breakeven)",
    ],
    dataRequirements: ["Traceable numbers backed by subsequent financial schedules"],
    defaultContent: `Business Concept:
8thGear Hub & Venture Studio builds and scales high-impact technology ventures and delivers grant-funded enterprise development programs across West Africa. We connect grassroots MSMEs to institutional capital, enterprise technology, and structured market linkages.

Market Opportunity:
Across West Africa, over 40 million micro, small, and medium enterprises face severe access-to-capital constraints and coordination bottlenecks. Our Serviceable Obtainable Market captures ₦412,000,000 in Year 5 revenue across venture acceleration fees, platform subscriptions, and program delivery retainers.

Competitive Advantage:
Unlike generic business incubators; our dual model pairs dedicated technical venture studios with high-velocity grant engineering. This allows our ventures to achieve capital efficiency without early equity dilution.

Financial Highlights:
• Year 1 Revenue: ₦93,750,000 with gross margin of 83.5%
• Year 5 Revenue: ₦412,000,000 with EBITDA of ₦243,400,000 (59.0% margin)
• Breakeven achieved in Month 7 of operations
• Cash runway maintained above 18 months across all 5 projected years.`,
  },
  {
    id: "sec-04",
    sectionNumber: 4,
    title: "Benefits for Africa & Regional Impact",
    category: "Market Opportunity & Customers",
    objective: "Demonstrate quantified social, economic, and environmental value creation.",
    requiredComponents: [
      "Job Creation (direct and indirect)",
      "GDP Contribution & Local Value Chain",
      "Women & Youth Empowerment Metrics",
      "Environmental & Sustainable Development Alignment",
    ],
    dataRequirements: ["World Bank, AfDB, and NBS Nigeria benchmark statistics"],
    defaultContent: `Economic Impact:
Our programs directly accelerate 1,200 small enterprises over 5 years; generating over 4,500 verified local jobs across retail, agri-processing, and light manufacturing.

Social Impact:
• 62% of supported entrepreneurs are female founders running informal retail and food processing businesses.
• Average merchant household income increases by 34% within 12 months of program onboarding.

Ecosystem Development:
We bridge the gap between international donors (AfDB, Gates Foundation, USAID) and local grassroots innovators; ensuring grant capital flows directly to field execution rather than being lost in excessive administrative intermediaries.`,
  },
  {
    id: "sec-05",
    sectionNumber: 5,
    title: "Our Vision",
    category: "Executive Foundation",
    objective: "Articulate the long-term aspirational future state grounded in market realities.",
    requiredComponents: [
      "Vision Statement (One single compelling sentence)",
      "Vision Narrative (2-3 paragraphs describing the world when we succeed)",
    ],
    dataRequirements: ["Aligned with regional digital economy growth trends"],
    defaultContent: `Vision Statement:
To become Africa's most reliable venture foundry and institutional delivery partner for small enterprise prosperity.

Vision Narrative:
When our work succeeds; African small business owners will no longer fail due to isolation or lack of institutional compliance. Every promising entrepreneur from Lagos to Nairobi will have instant access to structured incubation, verified grant capital, and enterprise tools that enable multi-generational stability.`,
  },
  {
    id: "sec-06",
    sectionNumber: 6,
    title: "Our Mission",
    category: "Executive Foundation",
    objective: "Define the organization's core purpose, customers, and operating principles.",
    requiredComponents: [
      "Mission Statement",
      "Target Beneficiary Breakdown",
      "Core Service Delivery Methodology",
    ],
    dataRequirements: ["Validated by operational track record and pilot feedback"],
    defaultContent: `Mission Statement:
We identify, build, and fund high-potential African enterprises by providing rigorous venture architecture, direct grant engineering, and community-rooted execution.

Mission Breakdown:
• For Founders: We provide co-building engineering, regulatory navigation, and capital syndication.
• For Donors & Funders: We provide verified field monitoring, audit-ready reporting, and verifiable beneficiary tracking.
• For Team Members: We maintain a culture of plain-spoken honesty, rigorous fact-checking, and zero tolerance for vanity metrics.`,
  },
  {
    id: "sec-07",
    sectionNumber: 7,
    title: "Key Drivers to Success",
    category: "Strategy & Go-To-Market",
    objective: "Identify 5 to 8 critical success factors with measurable milestones.",
    requiredComponents: [
      "5 to 8 Drivers with Name, Description, Success Metric, and 5-Year Target",
    ],
    dataRequirements: ["Industry benchmark data from Y Combinator, Techstars, and AfDB"],
    defaultContent: `1. Grant Application Win Rate: Target 25% or higher on institutional proposals. Current baseline: 18%.
2. Venture Incubation Survival Rate: Target 80% of incubated companies operating profitably after 24 months.
3. Software Platform Adoption: Scale GrantSift platform to 1,500 active SME users by Year 3.
4. Capital Efficiency: Maintain customer acquisition cost payback under 6 months across all services.
5. Funder Retention & Program Expansion: 70% of donor partners renewing multi-year program agreements.`,
  },
  {
    id: "sec-08",
    sectionNumber: 8,
    title: "Our Company Values",
    category: "Executive Foundation",
    objective: "Define cultural principles that govern day-to-day operations and decision making.",
    requiredComponents: [
      "4 to 6 Core Values with Definition, Behavioral Indicators, and Business Impact",
    ],
    dataRequirements: ["Evidence showing culture correlation with operational retention"],
    defaultContent: `1. Factual Honesty: We never invent numbers, inflate metrics, or hide operational gaps. If a budget line item is inadequate, we say so plainly.
2. Direct Execution: We eliminate administrative fluff. Every activity must produce a clear, tangible outcome.
3. Radical Accountability: Team members own outcomes from start to finish. Writers draft proposals, but approvals require multi-tiered review.
4. Community Stewardship: We measure our ultimate success by the real cash income and dignity of the small business owners we serve.`,
  },
  {
    id: "sec-09",
    sectionNumber: 9,
    title: "Company Overview & Legal Structure",
    category: "Operations & Management",
    objective: "Detail corporate history, legal entity, registration, and governance framework.",
    requiredComponents: [
      "Entity Name and Registration Number (CAC RC)",
      "Date of Incorporation",
      "Operating Headquarters",
      "Ownership & Cap Table Summary",
    ],
    dataRequirements: ["Verified corporate filings and tax identification"],
    defaultContent: `Company Entity: 8thGear Hub & Venture Studio Limited
Registration: Incorporated under the Companies and Allied Matters Act, Federal Republic of Nigeria
Headquarters: Lagos, Nigeria
Operating Units: Business Development (BD), Project Development, Venture Studio, Technology Engineering.
Board of Directors: Chaired by Dr. Seun with Mr. Damilola and Executive Management.`,
  },
  {
    id: "sec-10",
    sectionNumber: 10,
    title: "Main Phases & Lifecycle Roadmap",
    category: "Strategy & Go-To-Market",
    objective: "Outline strategic roadmap across the 5-year operating horizon.",
    requiredComponents: [
      "Phase 1: Foundation (Months 1 to 12)",
      "Phase 2: Market Entry & Validation (Months 13 to 24)",
      "Phase 3: Growth & Scaling (Months 25 to 36)",
      "Phase 4: Regional Expansion (Months 37 to 48)",
      "Phase 5: Institutional Maturity & Exit Readiness (Months 49 to 60)",
    ],
    dataRequirements: ["Benchmarked against comparable venture studio development timelines"],
    defaultContent: `Phase 1 (Months 1-12) - Foundation: Formalize BD & Project Devt unit SOPs; launch GrantSift platform MVP; secure ₦93.7M revenue across initial cohort.
Phase 2 (Months 13-24) - Acceleration: Expand writer network; double incubator cohort to 30 ventures; achieve ₦148.5M revenue.
Phase 3 (Months 25-36) - Scaled Enterprise: Launch automated enterprise compliance tools; expand partnerships to 15 institutional donors; achieve ₦222.0M revenue.
Phase 4 (Months 37-48) - Regional Footprint: Deploy program hubs in Abuja, Port Harcourt, and Accra; surpass ₦311.0M revenue.
Phase 5 (Months 49-60) - Maturity: Institutional capital syndication; achieve ₦412.0M revenue and prepare for strategic acquisition or growth equity investment.`,
  },
  {
    id: "sec-11",
    sectionNumber: 11,
    title: "Products & Technology Architecture",
    category: "Solution & Product",
    objective: "Present technical infrastructure, data privacy, and product specifications.",
    requiredComponents: [
      "Core Software Architecture",
      "Data Security & NDPR / GDPR Compliance",
      "Integration with Funder Portals & Payment Rails",
    ],
    dataRequirements: ["Technical stack documentation and architecture schematics"],
    defaultContent: `Product Stack:
1. GrantSift Platform: Multi-source grant discovery, readiness scoring, and AI-assisted proposal workspace.
2. Venture Studio OS: Portfolio financial modeling, cap table tracking, and investor updates.
3. Field M&E Dashboard: Mobile-responsive field data collection verifying grassroots job creation and income changes.
Data Protection: Full compliance with Nigeria Data Protection Act (NDPA) and international standards. All applicant data encrypted at rest and in transit.`,
  },
  {
    id: "sec-12",
    sectionNumber: 12,
    title: "Key Performance Components",
    category: "Operations & Management",
    objective: "Define metrics framework across Financial, Customer, Operational, Market, and Team dimensions.",
    requiredComponents: [
      "Financial KPIs (MRR, ARR, Gross Margin, EBITDA, Runway)",
      "Customer KPIs (CAC, LTV, Churn, NPS)",
      "Operational KPIs (Proposal turnaround time, Win rate)",
      "Team KPIs (Employee retention, training completion)",
    ],
    dataRequirements: ["Top quartile SaaS and accelerator benchmarks"],
    defaultContent: `Financial KPIs:
• Gross Margin: >80% across all 5 years
• EBITDA Margin: Expanding from 38.5% (Year 1) to 59.0% (Year 5)
• Minimum Cash Runway: 18 months

Customer & Operational KPIs:
• CAC Payback Period: < 5.5 months
• LTV:CAC Ratio: 6.4x to 8.2x
• Proposal Delivery Cycle: 10 working days from RFP release to final executive sign-off
• Donor Reporting Accuracy: 100% on-time milestone delivery.`,
  },
  {
    id: "sec-13",
    sectionNumber: 13,
    title: "Target Market & Target Groups (TAM, SAM, SOM)",
    category: "Market Opportunity & Customers",
    objective: "Quantify addressable customer segments with verifiable bottom-up calculation.",
    requiredComponents: [
      "Total Addressable Market (TAM)",
      "Serviceable Addressable Market (SAM)",
      "Serviceable Obtainable Market (SOM)",
      "CRITICAL CONSISTENCY: SOM Year 5 revenue equals Financial Model Year 5 revenue exactly",
    ],
    dataRequirements: ["HubSpot Market Size Calculator, SMEDAN 2024 Survey, World Bank Data"],
    defaultContent: `TAM (Total Addressable Market):
39.6 million registered and informal MSMEs across Nigeria requiring business support, compliance, and capital access. At an average annual value of ₦150,000; TAM equals ₦5.94 Trillion ($3.96 Billion USD).

SAM (Serviceable Addressable Market):
185,000 formal tech-enabled startups, agribusinesses, and commercial cooperatives in major urban economic corridors (Lagos, Abuja, Oyo, Rivers, Kano) requiring structured grant and venture services. SAM equals ₦138.75 Billion ($92.5 Million USD).

SOM (Serviceable Obtainable Market):
Realistic Year 5 market capture based on our bottom-up capacity:
• 180 Studio ventures and retainers × ₦1,500,000 = ₦270,000,000
• 140 Grant & SME advisory packages × ₦750,000 = ₦105,000,000
• 148 Enterprise platform subscriptions × ₦250,000 = ₦37,000,000
Total SOM Year 5 Revenue = ₦412,000,000 ($274,667 USD).
This matches our Year 5 Financial Statement of Income projection exactly.`,
  },
  {
    id: "sec-14",
    sectionNumber: 14,
    title: "Pain Points & Solutions",
    category: "Solution & Product",
    objective: "Prove widespread commercial problems exist and demonstrate our solution superiority.",
    requiredComponents: [
      "Top 3-5 Pain Points with quantified impact",
      "Our Solution Framework with step-by-step resolution",
      "Why Now catalyst (economic pressures, regulatory shifts)",
    ],
    dataRequirements: ["SMEDAN MSME National Survey, field interviews"],
    defaultContent: `Pain Point 1: 88% of African MSMEs fail grant screenings due to incomplete documentation, improper budgets, and poor proposal structure.
Our Solution: Standardized proposal generation backed by institutional SOPs, pre-built financial models, and automated compliance gates.

Pain Point 2: International donors struggle with fund leakage and lack verifiable field execution tracking in West Africa.
Our Solution: On-the-ground project development associates (Dr. Seun, Seun Oladele) providing auditable milestone monitoring and photo-verified beneficiary data.

Pain Point 3: Early-stage venture founders spend 70% of their time chasing small angel checks rather than building products.
Our Solution: Integrated studio model providing non-dilutive grant capital pipelines alongside engineering support.`,
  },
  {
    id: "sec-15",
    sectionNumber: 15,
    title: "Our Products and Services Portfolio",
    category: "Solution & Product",
    objective: "Detail market-ready offerings with clear unit pricing and value delivery.",
    requiredComponents: [
      "Product Line Descriptions",
      "Pricing Tiers and Packaging",
      "Delivery Workflows and Quality Standards",
    ],
    dataRequirements: ["Competitor pricing analysis and customer willingness-to-pay surveys"],
    defaultContent: `1. Venture Incubation Program (₦1,500,000 / venture): 6-month hands-on product engineering, market testing, financial modeling, and investor matching.
2. Grant Writing & Proposal Retainer (₦750,000 / client): End-to-end proposal drafting, budget reconciliation, document preparation, and submission management.
3. GrantSift Enterprise Software (₦250,000 / year): Web platform for discovery, institutional readiness assessment, and automated proposal authoring.`,
  },
  {
    id: "sec-16",
    sectionNumber: 16,
    title: "Our Management Team & Org Structure",
    category: "Operations & Management",
    objective: "Prove the team has credentials, credibility, and operational capability to execute.",
    requiredComponents: [
      "Key Leader Profiles (Yusuf Yaru Umaru, Kunle, Tomiwa, Seun Oladele, Dr. Seun, Mr. Damilola)",
      "Organizational Chart and Reporting Lines",
      "Hiring Roadmap and Talent Strategy",
    ],
    dataRequirements: ["Professional track record and verified achievements"],
    defaultContent: `Leadership Team:
• Yusuf Yaru Umaru - Growth Associate & SOP Owner: Leads business development, opportunity sourcing, and first-tier proposal review.
• Dr. Seun - Subject Matter Expert & Technical Reviewer: Oversees project feasibility, methodology review, and partnership strategy.
• Mr. Damilola - Managing Director & Final Approver: Holds ultimate signing authority for proposal submissions, contracts, and strategic partnerships.
• Kunle & Tomiwa - BD Writers & Grant Specialists: Conduct intensive research, fact-checking, and statistical proposal drafting.
• Seun Oladele - Project Development Associate: Manages post-award transition, field execution, and stakeholder coordination.`,
  },
  {
    id: "sec-17",
    sectionNumber: 17,
    title: "History & Roadmap",
    category: "Strategy & Go-To-Market",
    objective: "Show credible progress to date and logical forward roadmap.",
    requiredComponents: [
      "Founding Story and Key Milestones Achieved",
      "12 to 36 Month Operational Milestones",
      "Capital Milestones and Funding Rounds",
    ],
    dataRequirements: ["Historical operational records and audited achievements"],
    defaultContent: `Historical Milestones:
• 2024: Formal launch of 8thGear Venture Studio programs in Lagos.
• 2025: Deployment of internal grant writing unit; achieved 18% grant win rate across ₦120M in applications.
• 2026: Consolidation into unified BD & Project Devt SOP; release of GrantSift digital platform.
Future Milestones:
• Q1 2027: Surpass 50 funded ventures; roll out regional program hubs.
• Q4 2028: Cross ₦300M in annual revenue with sustained 40%+ EBITDA margins.`,
  },
  {
    id: "sec-18",
    sectionNumber: 18,
    title: "Business Model Canvas & Scalability",
    category: "Solution & Product",
    objective: "Present scalable revenue generation and value delivery mechanics.",
    requiredComponents: [
      "9 Canvas Blocks (Value Proposition, Segments, Channels, Revenue, Resources, Activities, Partners, Cost Structure)",
      "Scalability Factors (Network effects, standardized SOPs)",
    ],
    dataRequirements: ["Unit economics and margin expansion proof points"],
    defaultContent: `Key Partnerships: Donors (AfDB, Gates Foundation), ESOs, Enterprise Hubs, and State Ministries of Commerce.
Key Activities: Opportunity sourcing, proposal drafting, venture co-building, field program execution.
Key Resources: Proprietary proposal library, experienced BD team, GrantSift software engine.
Revenue Streams: Cohort program fees, consulting retainers, software licenses, success fee bonuses.
Cost Structure: Team salaries (70%), cloud infrastructure (12%), field operations (10%), administration (8%).`,
  },
  {
    id: "sec-19",
    sectionNumber: 19,
    title: "Revenue Model & Unit Economics",
    category: "Financial Model & Projections",
    objective: "Detail all revenue streams, pricing strategies, and cohort unit economics.",
    requiredComponents: [
      "Revenue Stream Breakdown",
      "Unit Economics Table (CAC, LTV, LTV:CAC, Gross Margin, Payback)",
      "Pricing Strategy and Positioning",
    ],
    dataRequirements: ["HubSpot, ProfitWell benchmarks, historical client data"],
    defaultContent: `Unit Economics Summary:
• Customer Acquisition Cost (CAC): ₦350,000 (blended across inbound and outbound channels)
• Customer Lifetime Value (LTV): ₦2,450,000 over 36-month relationship
• LTV : CAC Ratio: 7.0x (Target: >3.0x)
• Gross Margin: 83.5%
• Payback Period: 4.8 months
• Churn Rate: 2.5% monthly on recurring advisory retainers.`,
  },
  {
    id: "sec-20",
    sectionNumber: 20,
    title: "Organizational & Marketing Tasks",
    category: "Operations & Management",
    objective: "Define operational work packages and go-to-market milestones by phase.",
    requiredComponents: [
      "Phase-by-Phase Organizational Setup Checklist",
      "Marketing Work Packages and Brand Development",
      "Operational Workflows and Quality Control",
    ],
    dataRequirements: ["Agile sprint and operational workflow benchmarks"],
    defaultContent: `Quarterly Task Cadence:
Q1 Tasks: Finalize updated BD SOP workbook; onboard 2 junior grant researchers; launch GrantSift waitlist.
Q2 Tasks: Pilot corporate sponsorship program; run 3 grant readiness workshops in Lagos; publish quarterly grant landscape report.
Q3 Tasks: Expand technical proposal capacity to include climate and clean energy grants; automate budget verification.
Q4 Tasks: Conduct annual SOP review with Dr. Seun; audit team KPI achievement; prepare annual budget forecast.`,
  },
  {
    id: "sec-21",
    sectionNumber: 21,
    title: "Marketing Plan & Strategy (Go-To-Market)",
    category: "Strategy & Go-To-Market",
    objective: "Present data-driven customer acquisition strategy across prioritized channels.",
    requiredComponents: [
      "Strategic Positioning and Differentiation",
      "Customer Acquisition Channels and Budget Allocation",
      "Customer Journey Mapping (Awareness, Consideration, Decision, Retention)",
    ],
    dataRequirements: ["Channel conversion rates and CAC by channel"],
    defaultContent: `Channel Mix & Budget Allocation:
• Direct Outreach & Funder Relations (40% of budget): Face-to-face meetings, donor roundtable participation, high-trust referrals.
• Content Marketing & Thought Leadership (30% of budget): Bi-weekly African grant intelligence newsletters, teardowns of winning proposals.
• Partner Ecosystems & Hub Alliances (20% of budget): Co-programs with university entrepreneurship centers and regional incubators.
• Digital & Paid Channels (10% of budget): Targeted LinkedIn and search campaigns for high-intent founders.`,
  },
  {
    id: "sec-22",
    sectionNumber: 22,
    title: "Digital Marketing Strategy",
    category: "Strategy & Go-To-Market",
    objective: "Detail online marketing execution with platform-specific SEO, PPC, and content tactics.",
    requiredComponents: [
      "SEO & High-Intent Keyword Strategy",
      "LinkedIn and B2B Outreach",
      "Email Nurture Campaigns and Lead Magnets",
      "Marketing Automation Stack",
    ],
    dataRequirements: ["Ahrefs/SEMrush search volume for African grants"],
    defaultContent: `Target High-Intent Keywords:
• 'grant funding for nigerian startups' (1,800 searches/mo)
• 'business development standard operating procedure' (950 searches/mo)
• 'donor grants for african msmes' (1,200 searches/mo)
Conversion Funnel:
1. Free Scorecard Evaluation -> 2. Download SOP Sample -> 3. Proposal Consultation Call -> 4. Retainer Onboarding.`,
  },
  {
    id: "sec-23",
    sectionNumber: 23,
    title: "Competitors Analysis & Matrix",
    category: "Market Opportunity & Customers",
    objective: "Demonstrate deep understanding of competitive landscape and defensible positioning.",
    requiredComponents: [
      "Direct and Indirect Competitor Profiles",
      "Feature Comparison Table",
      "Weighted Scoring Matrix",
      "Defensible Moats and Barriers to Entry",
    ],
    dataRequirements: ["Crunchbase, PitchBook, and local ecosystem mapping"],
    defaultContent: `Competitive Comparison Matrix:
• Criteria: Proposal Win Rate | Technical Engineering | Local Field Presence | Software Tooling
• 8thGear & GrantSift: 25% | Full Studio | Strong (Lagos/Abuja) | Native Platform (Score: 8.8/10)
• Traditional Consulting Firms: 15% | None (Advisory only) | Corporate only | None (Score: 6.2/10)
• Generic Online Pitch Writers: <10% | None | Zero field presence | Freelance (Score: 4.5/10)
Defensible Moats: Proprietary proposal library with 100+ proven section templates; direct relationships with donor evaluation panels.`,
  },
  {
    id: "sec-24",
    sectionNumber: 24,
    title: "SWOT Analysis (SO, WO, ST, WT Strategies)",
    category: "Strategic Frameworks",
    objective: "Provide honest, evidence-backed assessment of internal and external strategic factors.",
    requiredComponents: [
      "5 Strengths, 5 Weaknesses, 5 Opportunities, 5 Threats",
      "Actionable SO, WO, ST, and WT Strategies",
    ],
    dataRequirements: ["Internal operational audit and external macro research"],
    defaultContent: `Strengths: Established hub brand; multi-disciplinary team; proven BD SOP; in-house technology stack.
Weaknesses: Reliance on key leadership for final sign-off; currency devaluation exposure on local contracts.
Opportunities: Rapid increase in international climate and SME funding across Africa; digital transition among informal traders.
Threats: Macroeconomic volatility in Nigeria; sudden changes in donor country foreign aid allocations.
SO Strategy: Deploy GrantSift platform to rapidly capture expanding donor funding with minimal marginal cost.
WT Strategy: Hedge revenues into multi-currency contracts (USD grants paired with NGN local costs).`,
  },
  {
    id: "sec-25",
    sectionNumber: 25,
    title: "PESTEL Analysis",
    category: "Strategic Frameworks",
    objective: "Analyze macro-environmental factors impacting the business.",
    requiredComponents: [
      "Political, Economic, Social, Technological, Environmental, and Legal Analysis with Strategic Responses",
    ],
    dataRequirements: ["Central Bank of Nigeria, NBS, World Bank reports"],
    defaultContent: `Political: Government support for youth entrepreneurship funds; response: register as certified delivery partner.
Economic: High domestic inflation (30%+); response: index pricing, focus on USD donor contracts.
Social: 70% youth population seeking independent livelihoods; response: scale digital-first venture incubation.
Technological: Rapid adoption of AI writing and mobile payments; response: embed AI text sanitization and audit trails.
Environmental: Donor emphasis on climate adaptation; response: specialize in green enterprise and agritech proposals.
Legal: Compliance with Nigeria Data Protection Act; response: strict data governance protocols.`,
  },
  {
    id: "sec-26",
    sectionNumber: 26,
    title: "URIO Investment Framework",
    category: "Strategic Frameworks",
    objective: "Articulate the compelling investment thesis in structured institutional format.",
    requiredComponents: [
      "Unique Value Proposition (1 to 10 score)",
      "Return Potential (1 to 10 score)",
      "Impact & Importance (1 to 10 score)",
      "Opportunity Size & Scalability (1 to 10 score)",
      "Composite Weighted URIO Score and Investment Thesis Statement",
    ],
    dataRequirements: ["Cross-referenced to all market and financial sections"],
    defaultContent: `URIO Framework Breakdown:
• Unique (Weight 25%, Score 8.5/10): Proprietary combination of venture studio + grant engineering platform.
• Return (Weight 35%, Score 9.0/10): 59% EBITDA margin by Year 5; projected ₦412M revenue; strong capital efficiency.
• Impact (Weight 20%, Score 9.5/10): 4,500+ jobs created; 62% female participation; measurable household income gains.
• Opportunity (Weight 20%, Score 8.5/10): ₦5.94T TAM; scalable SaaS expansion across Sub-Saharan Africa.
TOTAL URIO SCORE: 8.85 / 10.
Investment Thesis: 8thGear represents a rare combination of high-margin software scalability and defensive cash flow generated through institutional development contracts.`,
  },
  {
    id: "sec-27",
    sectionNumber: 27,
    title: "Operations & Supply Chain Plan",
    category: "Operations & Management",
    objective: "Detail delivery protocols, supplier management, and operational workflows.",
    requiredComponents: [
      "Physical and Cloud Infrastructure",
      "Quality Assurance and Peer Review Cycles",
      "Supplier and Subcontractor Standards",
    ],
    dataRequirements: ["Operational capacity benchmarks"],
    defaultContent: `Core Operating Workflow:
1. Daily Opportunity Scouting -> 2. Weekly Go/No-Go Decision -> 3. 7-Day Drafting & Review Sprint -> 4. Executive Sign-Off -> 5. Portal Submission -> 6. Post-Award Transition to Projects Team.
Quality Gate: Every proposal must pass the 11-stage automated review pipeline with zero unverified claims and zero raw Markdown syntax.`,
  },
  {
    id: "sec-28",
    sectionNumber: 28,
    title: "Industry Analysis & Growth Indicators",
    category: "Market Opportunity & Customers",
    objective: "Demonstrate deep understanding of industry dynamics, growth drivers, and market signals.",
    requiredComponents: [
      "Industry Size & Growth Rate (CAGR)",
      "Market Concentration & Competitive Dynamics",
      "6 to 10 Quantified Growth Indicators (Search interest, VC funding, Policy tailwinds)",
    ],
    dataRequirements: ["Briter Bridges, Partech Africa, AVCA Venture Capital reports"],
    defaultContent: `African Startup & Grant Ecosystem Growth:
• Total development aid to Sub-Saharan Africa exceeds $55 Billion USD annually (OECD).
• African tech ecosystem funding grew at 24% CAGR over past 5 years despite global macroeconomic slowdown.
• Grant financing represents the fastest growing capital tier for African climate and health ventures, providing non-dilutive runway.`,
  },
  {
    id: "sec-29",
    sectionNumber: 29,
    title: "Risks & Mitigation Strategies",
    category: "Operations & Management",
    objective: "Demonstrate honest risk awareness and credible mitigation plans across 8 categories.",
    requiredComponents: [
      "8 Categories: Market, Competitive, Operational, Financial, Strategy, Regulatory, Technology, External Macro",
      "Top 5 Prioritized Risks with Contingency Actions and Monitoring",
    ],
    dataRequirements: ["Historical startup failure benchmarks and economic stress tests"],
    defaultContent: `1. Financial Risk - Currency Volatility: Devaluation of NGN against USD increases cloud costs. Mitigation: Bill international contracts in USD; maintain foreign currency treasury reserves.
2. Operational Risk - Key Person Dependency: Heavy reliance on executive approval. Mitigation: Documented 9-section SOP and delegated team lead authority for initial drafts and research.
3. Market Risk - Funder Budget Cycles: Donors may delay disbursements. Mitigation: Maintain minimum 6-month operating cash buffer and diversify across commercial retainers.
4. Technology Risk - AI Detection & Hallucination: Generic AI content rejected by grant reviewers. Mitigation: Strict human voice rules, automated fact-checking against uploaded source documents, and human sign-off.
5. Regulatory Risk - Compliance Changes: Shifts in CAC or tax requirements for startups. Mitigation: In-house legal review and active monitoring of Ministry publications.`,
  },
  {
    id: "sec-30",
    sectionNumber: 30,
    title: "Financial Information & Three Statements",
    category: "Financial Model & Projections",
    objective: "Present 5-year financial projections with detailed assumptions and modeling.",
    requiredComponents: [
      "Income Statement (SOPL) 5-Year Projections",
      "Balance Sheet (SOFP) 5-Year Projections",
      "Cash Flow Statement (SOCF) 5-Year Projections",
      "Reconciliation check: SOM Year 5 revenue equals Year 5 financials",
    ],
    dataRequirements: ["Linked directly to the 5-Year Financial Model Engine"],
    defaultContent: `Financial Projections Summary:
• Year 1: Revenue ₦93.8M | Gross Profit ₦78.4M | EBITDA ₦36.2M | Net Income ₦22.2M
• Year 2: Revenue ₦148.5M | Gross Profit ₦124.3M | EBITDA ₦67.9M | Net Income ₦42.9M
• Year 3: Revenue ₦222.0M | Gross Profit ₦186.2M | EBITDA ₦115.2M | Net Income ₦74.1M
• Year 4: Revenue ₦311.0M | Gross Profit ₦261.2M | EBITDA ₦174.1M | Net Income ₦113.0M
• Year 5: Revenue ₦412.0M | Gross Profit ₦346.4M | EBITDA ₦243.4M | Net Income ₦158.6M

All financial statement schedules are 100% reconciled to the Balance Sheet (Assets = Liabilities + Equity) with zero variance.`,
  },
  {
    id: "sec-31",
    sectionNumber: 31,
    title: "Exit Strategy & Investor Returns",
    category: "Governance, Exit & Compliance",
    objective: "Demonstrate clear path to liquidity and attractive multiple on invested capital.",
    requiredComponents: [
      "Primary Exit Routes (Strategic Acquisition, PE Buyout, Secondary Sale)",
      "Target Strategic Acquirers and Comparable Transactions",
      "5-Year Return Analysis (MOIC, IRR)",
    ],
    dataRequirements: ["PitchBook and CB Insights African M&A database"],
    defaultContent: `Primary Exit Route: Strategic acquisition in Years 5 to 6 by a global development consultancy or emerging market venture network seeking established African execution infrastructure.
Comparable Multiples: 2.5x to 4.0x ARR for emerging market venture platforms.
Projected Year 5 Valuation: ₦1.03 Billion to ₦1.65 Billion ($685,000 to $1,100,000 USD).
Target Investor Returns: 5.0x to 7.5x MOIC with an estimated IRR of 38% over 5 years.`,
  },
  {
    id: "sec-32",
    sectionNumber: 32,
    title: "Glossary of Key Terms",
    category: "Governance, Exit & Compliance",
    objective: "Define all acronyms, financial formulas, and technical terminology used.",
    requiredComponents: [
      "Definitions for ARPU, ARR, CAC, CAGR, DCF, EBITDA, FCFF, LTV, MRR, PESTEL, SOM, SWOT, URIO, WACC",
    ],
    dataRequirements: ["Institutional corporate finance definitions"],
    defaultContent: `• ARPU: Average Revenue Per User
• CAC: Customer Acquisition Cost (Marketing spend / New customers acquired)
• DCF: Discounted Cash Flow valuation method
• EBITDA: Earnings Before Interest, Taxes, Depreciation, and Amortization
• FCFF: Free Cash Flow to Firm
• LTV: Customer Lifetime Value (Average revenue × customer lifespan × gross margin)
• MRR: Monthly Recurring Revenue
• NOPLAT: Net Operating Profit Less Adjusted Taxes
• PESTEL: Political, Economic, Social, Technological, Environmental, Legal framework
• SOM: Serviceable Obtainable Market (reconciled to Year 5 revenue)
• URIO: Unique, Return, Impact, Opportunity investment framework
• WACC: Weighted Average Cost of Capital.`,
  },
  {
    id: "sec-33",
    sectionNumber: 33,
    title: "Disclaimer & Legal Notice",
    category: "Governance, Exit & Compliance",
    objective: "Deliver standard investor confidentiality, forward-looking statements disclaimer, and liability limitation.",
    requiredComponents: [
      "Confidentiality & Use Restrictions",
      "Forward-Looking Statements Notice",
      "No Guarantee or Securities Offer Declaration",
      "Governing Law and Jurisdiction",
    ],
    dataRequirements: ["Legal counsel verified securities disclaimer"],
    defaultContent: `CONFIDENTIALITY & USE RESTRICTIONS:
This business plan contains confidential and proprietary information of 8thGear Hub & Venture Studio Limited. By reviewing this document, the recipient agrees to maintain confidentiality and use it exclusively for evaluation purposes.

FORWARD-LOOKING STATEMENTS:
Projections, estimates, and target outcomes represent forward-looking statements based on current operating assumptions. Actual operational results may vary based on macroeconomic, regulatory, and competitive factors.

NOT AN OFFER TO SELL SECURITIES:
This document does not constitute an offer to sell or a solicitation of an offer to buy securities. Any investment transaction will be governed strictly by definitive legal subscription agreements.

GOVERNING LAW:
Governed by and construed in accordance with the laws of the Federal Republic of Nigeria.`,
  },
];
