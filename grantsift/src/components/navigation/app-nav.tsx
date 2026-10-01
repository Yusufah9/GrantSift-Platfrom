import Link from "next/link";
import { logoutAction } from "@/app/(auth)/actions";

export function AppNav({ email, isAdmin }: { email: string; isAdmin: boolean }) {
  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 max-w-6xl px-3">
      <div className="flex items-center justify-between rounded-full border border-ink/10 bg-paper-raised/80 py-2 pl-5 pr-4 backdrop-blur-xl">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-ink">
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

