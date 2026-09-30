import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  return (
    <header className="border-b border-paper-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="font-serif text-lg text-ink">
          GrantSift
        </Link>
        <div className="flex items-center gap-4 text-sm text-ink-soft">
          {isAdmin && (
            <Link href="/admin" className="hover:text-ink">
              Admin
            </Link>
          )}
          <span className="font-mono text-xs text-ink-faint">{email}</span>
          <form action={logoutAction}>
            <button type="submit" className="hover:text-ink">
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
