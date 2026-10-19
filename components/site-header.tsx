import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";
import { UserMenu } from "@/components/user-menu";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const profileHref = session
    ? `/profile/${encodeURIComponent(session.user.username)}`
    : `/login?callbackUrl=${encodeURIComponent("/")}`;
  const navLinks = [
    { href: "/practice", label: "Печатать" },
    { href: "/texts", label: "Тексты" },
    { href: "/leaderboard", label: "Рейтинг" },
    { href: profileHref, label: "Профиль" },
  ];

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-5 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 text-[15px] font-semibold tracking-tight text-ink"
          >
            typex<span className="text-primary">.</span>
          </Link>
          <nav
            aria-label="Основная навигация"
            className="hidden items-center gap-6 text-sm text-subtle sm:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <MobileNav links={navLinks} />
          {session ? (
            <UserMenu username={session.user.username} />
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-8 items-center rounded-sm border border-transparent px-3 text-sm font-medium text-subtle transition-colors hover:text-ink"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="hidden h-8 items-center rounded-sm border border-line px-3 text-sm font-medium text-ink transition-colors hover:bg-surface sm:inline-flex"
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
