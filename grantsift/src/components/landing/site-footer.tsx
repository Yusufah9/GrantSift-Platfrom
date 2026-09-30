import Link from "next/link";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Analyze a funder", href: "/signup" },
      { label: "Grant readiness", href: "/#product" },
      { label: "Grant SOP", href: "/#product" },
      { label: "Excel export", href: "/#product" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Founders", href: "/#solutions" },
      { label: "NGOs", href: "/#solutions" },
      { label: "Grant writers", href: "/#solutions" },
      { label: "Consultants", href: "/#solutions" },
      { label: "Venture builders", href: "/#solutions" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Blog", href: "/blog" },
      { label: "Guides", href: "/blog" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-6">
        <div className="md:col-span-1">
          <p className="font-serif text-lg text-ink">GrantSift</p>
          <p className="mt-3 max-w-xs text-sm text-ink-faint">
            A working plan for grant applications, built from real requirements and real evidence.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{column.heading}</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-12 border-t border-paper-line pt-6 text-xs text-ink-faint">
        © {new Date().getFullYear()} GrantSift.
      </p>
    </footer>
  );
}
