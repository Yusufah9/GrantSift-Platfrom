import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/users", label: "Users" },
];

export function AdminNav() {
  return (
    <header className="border-b border-paper-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-serif text-lg text-ink">
            GrantSift admin
          </Link>
          <nav className="flex items-center gap-6 text-sm text-ink-soft">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-ink-soft hover:text-ink">
            Back to app
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-ink-soft hover:text-ink">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
