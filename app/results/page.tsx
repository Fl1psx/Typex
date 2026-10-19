import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { RunsTable } from "@/components/runs-table";

export const metadata: Metadata = {
  title: "Результаты",
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function ResultsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/results")}`);
  }

  const results = await prisma.result.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      text: {
        select: { title: true, language: true },
      },
    },
  });

  const rows = results.map((result) => ({
    id: result.id,
    title: result.text.title,
    language: result.text.language,
    wpm: result.wpm,
    accuracy: result.accuracy,
    date: dateFormatter.format(result.createdAt),
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Главная", href: "/" },
          { label: "Результаты" },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">История</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Результаты
          </h1>
          <p className="mt-2 max-w-xl text-sm text-subtle">
            Последние 20 сохранённых заездов. Только ваши данные.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/texts">Новый заезд</Link>
        </Button>
      </div>

      <div className="mt-6">
        <RunsTable
          rows={rows}
          emptyLabel="Пока нет сохранённых заездов. Выберите текст и завершите первый."
          emptyAction={
            <Button asChild>
              <Link href="/texts">Выбрать текст</Link>
            </Button>
          }
        />
      </div>
    </main>
  );
}
