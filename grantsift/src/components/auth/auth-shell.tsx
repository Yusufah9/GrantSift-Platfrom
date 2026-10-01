import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16"
      style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2c1810 40%, #1a1208 100%)" }}
    >
      {/* Decorative ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(180,102,30,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(46,92,75,0.12) 0%, transparent 70%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(239,238,231,0.5) 39px, rgba(239,238,231,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(239,238,231,0.5) 39px, rgba(239,238,231,0.5) 40px)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md animate-fade-up"
        style={{
          background: "rgba(239,238,231,0.97)",
          borderRadius: "6px",
          boxShadow:
            "0 0 0 1px rgba(180,102,30,0.15), 0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Card header strip */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b border-stone-200/80"
          style={{ borderBottomColor: "#D9D6C9" }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 font-serif text-xl tracking-tight text-[#191C19] transition-opacity hover:opacity-80"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white"
              style={{ background: "#B4661E" }}
            >
              G
            </span>
            <span>
              Grant<span style={{ color: "#B4661E" }}>Sift</span>
            </span>
          </Link>
          <span
            className="hidden sm:inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: "#B4661E18", color: "#8F4F17" }}
          >
            Secure ·  Brevo
          </span>
        </div>

        {/* Card body */}
        <div className="px-8 pt-8 pb-6">
          <h1 className="font-serif text-[1.6rem] leading-tight text-[#191C19]">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-[#4B5049]">{subtitle}</p>
          )}
          <div className="mt-7 space-y-4">{children}</div>
        </div>

        {/* Card footer */}
        {footer && (
          <div
            className="px-8 py-4 text-sm text-[#7A7F76] border-t"
            style={{ borderTopColor: "#D9D6C9", background: "rgba(239,238,231,0.5)" }}
          >
            {footer}
          </div>
        )}
      </div>

      {/* Bottom branding */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-[11px] text-white/30">
        © {new Date().getFullYear()} GrantSift · Secured by Supabase · Emails via Brevo
      </p>
    </main>
  );
}
