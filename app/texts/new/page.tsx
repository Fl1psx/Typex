import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CreateTextForm } from "@/components/create-text-form";

export const metadata: Metadata = {
  title: "Новый текст",
};

export const dynamic = "force-dynamic";

export default async function NewTextPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/texts/new")}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Тексты", href: "/texts" },
          { label: "Новый текст" },
        ]}
      />

      <header className="mt-6 border-b border-line pb-6">
        <p className="eyebrow">Библиотека</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Новый текст
        </h1>
        <p className="mt-2 max-w-xl text-sm text-subtle">
          Добавьте отрывок в библиотеку. Публичные тексты попадут в общий
          список и рейтинг.
        </p>
      </header>

      <CreateTextForm username={session.user.username} />
    </main>
  );
}
