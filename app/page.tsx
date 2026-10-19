import Link from "next/link";
import { getLocalDayRange } from "@/lib/daily-text";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const steps = [
  {
    number: "01",
    title: "Нажмите «Начать»",
    description: "Заезд стартует сразу со случайным текстом — без настройки.",
  },
  {
    number: "02",
    title: "Печатайте текст",
    description: "Скорость и точность считаются с первой введённой клавиши.",
  },
  {
    number: "03",
    title: "Сохраните результат",
    description: "Следите за прогрессом и поднимайтесь в рейтинге.",
  },
];

async function getTopToday() {
  const { start, end } = getLocalDayRange();
  const rows = await prisma.result.findMany({
    where: { createdAt: { gte: start, lt: end } },
    orderBy: [{ wpm: "desc" }, { accuracy: "desc" }],
    select: { wpm: true, user: { select: { username: true } } },
    take: 50,
  });

  const seen = new Set<string>();
  const top: { username: string; wpm: number }[] = [];

  for (const row of rows) {
    if (seen.has(row.user.username)) {
      continue;
    }

    seen.add(row.user.username);
    top.push({ username: row.user.username, wpm: row.wpm });

    if (top.length === 3) {
      break;
    }
  }

  return top;
}

export default async function HomePage() {
  const topToday = await getTopToday();

  return (
    <main>
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 pt-20 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[48px]">
              Тренажёр скорости печати
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-subtle">
              Печатайте тексты, следите за скоростью, соревнуйтесь в рейтинге
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button
                asChild
                className="h-11 rounded-sm px-6 text-[15px] font-semibold"
              >
                <Link href="/practice">Начать печатать</Link>
              </Button>
              <Link
                href="/texts"
                className="rounded-sm text-sm font-medium text-subtle transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Выбрать текст
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-line bg-surface">
            <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">
                Заезд · RU
              </span>
              <span className="font-mono text-xs text-ink">
                72 WPM · 98%
              </span>
            </div>

            <div className="p-4 md:p-5">
              <div
                aria-hidden="true"
                className="select-none break-words font-mono text-[15px] leading-7"
              >
                <span className="text-ink">Всё, что можно </span>
                <span className="rounded-[3px] bg-primary px-0.5 text-primary-foreground">
                  и
                </span>
                <span className="text-subtle/70">
                  змерить, можно улучшить. Печатайте каждый день и следите за
                  прогрессом.
                </span>
              </div>

              <div className="mt-4 h-1 w-full overflow-hidden rounded-sm bg-line">
                <div className="h-full w-[68%] bg-primary" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-subtle">
                <span>Backspace — исправить · Esc — выйти</span>
                <span className="font-mono">68 / 96</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-6">
        <h2 className="text-sm font-medium text-ink">Как это работает</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-md border border-line bg-surface p-6"
            >
              <span className="font-mono text-xs text-primary">
                {step.number}
              </span>
              <h3 className="mt-3 text-base font-medium tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-subtle">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
            <h2 className="text-sm font-medium text-ink">Топ-3 сегодня</h2>
            <Link
              href="/leaderboard?period=today"
              className="rounded-sm text-xs text-subtle transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Весь рейтинг
            </Link>
          </div>

          {topToday.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-5 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm text-subtle">
                Пока нет результатов за сегодня. Станьте первым!
              </p>
              <Button
                asChild
                size="sm"
                className="rounded-sm font-semibold"
              >
                <Link href="/practice">Начать печатать</Link>
              </Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {topToday.map((entry, index) => (
                  <tr key={entry.username} className="h-10">
                    <td className="w-12 px-5 font-mono text-xs text-subtle">
                      {index + 1}
                    </td>
                    <td className="px-2">
                      <Link
                        href={`/profile/${encodeURIComponent(entry.username)}`}
                        className="text-ink transition-colors hover:text-primary"
                      >
                        @{entry.username}
                      </Link>
                    </td>
                    <td className="px-5 text-right font-mono text-ink">
                      {(Math.round(entry.wpm * 10) / 10).toFixed(1)} WPM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
