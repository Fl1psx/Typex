import type { Metadata } from "next";
import Link from "next/link";
import { Fira_Code, IBM_Plex_Mono, Inter, JetBrains_Mono } from "next/font/google";
import { AppearanceProvider } from "@/components/appearance-provider";
import { SiteHeader } from "@/components/site-header";
import { getUserAppearance } from "@/lib/appearance-server";
import { getAppearanceStyle } from "@/lib/appearance";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plex",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin", "cyrillic"],
  variable: "--font-fira",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Typex — тренажёр скорости печати",
    template: "%s · Typex",
  },
  description:
    "Минималистичный тренажёр скорости печати: выберите отрывок, следите за WPM и точностью, сохраняйте результаты.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { appearance, isAuthenticated } = await getUserAppearance();
  const fontClassName = [
    inter.variable,
    jetbrainsMono.variable,
    ibmPlexMono.variable,
    firaCode.variable,
  ].join(" ");

  return (
    <html
      lang="ru"
      data-theme={appearance.theme}
      style={getAppearanceStyle(appearance)}
      className={fontClassName}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <AppearanceProvider
          initialAppearance={appearance}
          persistLocally={!isAuthenticated}
        >
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <footer className="border-t border-line">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-[13px] text-subtle sm:flex-row sm:items-center sm:justify-between md:px-6">
                <span>typex © {new Date().getFullYear()}</span>
                <div className="flex items-center gap-5">
                  <Link
                    href="/help"
                    className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Помощь
                  </Link>
                  <a
                    href="https://github.com/Fl1psx/crispy-octo-waffle"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </AppearanceProvider>
      </body>
    </html>
  );
}
