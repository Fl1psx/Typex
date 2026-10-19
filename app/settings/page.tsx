import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseAppearance } from "@/lib/appearance";
import type { AvatarStyle } from "@/lib/profile";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SettingsForm } from "@/components/settings-form";

export const metadata: Metadata = {
  title: "Настройки",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/settings")}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      email: true,
      bio: true,
      avatarStyle: true,
      settings: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const avatarStyle = user.avatarStyle as AvatarStyle;
  const appearance = parseAppearance(user.settings);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          {
            label: `@${user.username}`,
            href: `/profile/${encodeURIComponent(user.username)}`,
          },
          { label: "Настройки" },
        ]}
      />

      <header className="mt-6 border-b border-line pb-6">
        <p className="eyebrow">Аккаунт</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Настройки
        </h1>
        <p className="mt-2 max-w-xl text-sm text-subtle">
          Настройте тему, шрифт, строгий режим и звуки заездов. Изменения
          применяются сразу.
        </p>
      </header>

      <SettingsForm
        username={user.username}
        email={user.email}
        initialBio={user.bio ?? ""}
        initialAvatarStyle={avatarStyle}
        initialAppearance={appearance}
      />
    </main>
  );
}
