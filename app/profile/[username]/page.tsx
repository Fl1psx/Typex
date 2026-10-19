import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Check,
  FileText,
  Flag,
  Gauge,
  Lock,
  Repeat,
  Settings,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementCode,
} from "@/lib/achievements";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { RunsTable, type RunRow } from "@/components/runs-table";
import { WpmChart, type WpmPoint } from "@/components/wpm-chart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProfilePageProps = {
  params: { username: string };
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const charsFormatter = new Intl.NumberFormat("ru-RU");

const ACHIEVEMENT_ICONS: Record<AchievementCode, LucideIcon> = {
  first_race: Flag,
  wpm_60: Gauge,
  wpm_100: Zap,
  accuracy_100: Target,
  races_10: Repeat,
  texts_3: FileText,
};

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  return {
    title: `@${decodeURIComponent(params.username)}`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions);
  const username = decodeURIComponent(params.username);

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      avatarStyle: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const [aggregate, characters, recent, achievements] = await Promise.all([
    prisma.result.aggregate({
      where: { userId: user.id },
      _max: { wpm: true },
      _avg: { wpm: true, accuracy: true },
      _count: { _all: true },
    }),
    prisma.result.findMany({
      where: { userId: user.id },
      select: { text: { select: { content: true } } },
    }),
    prisma.result.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        text: {
          select: { title: true, language: true },
        },
      },
    }),
    prisma.achievement.findMany({
      select: {
        code: true,
        name: true,
        description: true,
        userAchievements: {
          where: { userId: user.id },
          select: { unlockedAt: true },
        },
      },
    }),
  ]);

  const bestWpm = aggregate._max.wpm;
  const averageWpm = aggregate._avg.wpm;
  const averageAccuracy = aggregate._avg.accuracy;
  const totalRuns = aggregate._count._all;
  const totalCharacters = characters.reduce(
    (sum, result) => sum + result.text.content.length,
    0,
  );

  const chartData: WpmPoint[] = recent
    .slice(0, 20)
    .reverse()
    .map((result, index) => ({
      race: index + 1,
      wpm: roundOne(result.wpm),
      title: result.text.title,
      date: dateFormatter.format(result.createdAt),
    }));

  const isOwner = session?.user.id === user.id;
  const joinedAt = `${MONTHS_GENITIVE[user.createdAt.getMonth()]} ${user.createdAt.getFullYear()}`;
  const lastRaceLabel =
    recent[0] !== undefined
      ? dateFormatter.format(recent[0].createdAt)
      : null;
  const runRows: RunRow[] = recent.map((result) => ({
    id: result.id,
    title: result.text.title,
    language: result.text.language,
    wpm: result.wpm,
    accuracy: result.accuracy,
    date: dateFormatter.format(result.createdAt),
  }));
  const achievementsByCode = new Map(
    achievements.map((achievement) => [achievement.code, achievement]),
  );
  const achievementItems = ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const achievement = achievementsByCode.get(definition.code);

    return {
      ...definition,
      unlockedAt: achievement?.userAchievements[0]?.unlockedAt ?? null,
    };
  });
  const unlockedCount = achievementItems.filter(
    (achievement) => achievement.unlockedAt !== null,
  ).length;

  const stats = [
    {
      label: "Лучший результат",
      value:
        bestWpm === null ? "—" : `${roundOne(bestWpm).toFixed(1)} WPM`,
    },
    {
      label: "Средний результат",
      value:
        averageWpm === null ? "—" : `${roundOne(averageWpm).toFixed(1)} WPM`,
    },
    {
      label: "Всего заездов",
      value: `${totalRuns} заездов`,
    },
    {
      label: "Средняя точность",
      value:
        averageAccuracy === null
          ? "—"
          : `${roundOne(averageAccuracy).toFixed(1)} %`,
    },
    {
      label: "Введено символов",
      value: `${charsFormatter.format(totalCharacters)} симв.`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Главная", href: "/" },
          { label: "Профиль" },
        ]}
      />
      <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar
            username={user.username}
            style={user.avatarStyle}
            size={80}
            className="rounded-lg"
          />
          <div className="min-w-0">
            <p className="eyebrow">Профиль</p>
            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              @{user.username}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-subtle">
              {user.bio ?? "Без описания"}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              С нами с {joinedAt}
            </p>
            {lastRaceLabel ? (
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                Последний заезд: {lastRaceLabel}
              </p>
            ) : null}
          </div>
        </div>

        {isOwner ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/settings">
              <Settings />
              Настройки
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-5">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={
              index === stats.length - 1
                ? "col-span-2 bg-surface px-4 py-4 md:col-span-1"
                : "bg-surface px-4 py-4"
            }
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
              {stat.label}
            </p>
            <p className="mt-2 truncate font-mono text-base text-ink md:text-lg">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-sm font-medium text-ink">Достижения</h2>
          <span className="font-mono text-[10px] text-subtle">
            {unlockedCount} / {achievementItems.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
          {achievementItems.map((achievement) => {
            const Icon = ACHIEVEMENT_ICONS[achievement.code];
            const unlocked = achievement.unlockedAt !== null;

            return (
              <div
                key={achievement.code}
                className={cn(
                  "min-h-32 bg-surface p-4",
                  !unlocked && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      unlocked ? "text-primary" : "text-subtle",
                    )}
                  />
                  {unlocked ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-subtle" />
                  )}
                </div>
                <p className="mt-3 text-xs font-medium text-ink">
                  {achievement.name}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-subtle">
                  {achievement.description}
                </p>
                <p
                  className={cn(
                    "mt-2 font-mono text-[9px] uppercase tracking-[0.08em]",
                    unlocked ? "text-primary" : "text-subtle",
                  )}
                >
                  {unlocked ? "Открыто" : "Закрыто"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-sm font-medium text-ink">
            WPM · последние 20 заездов
          </h2>
        </div>
        <div className="p-4">
          {chartData.length > 0 ? (
            <WpmChart data={chartData} />
          ) : (
            <div className="flex h-60 items-center justify-center text-sm text-subtle">
              Пока нет данных для графика
            </div>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Последние заезды</h2>
          <span className="font-mono text-[10px] text-subtle">
            {recent.length} / 30
          </span>
        </div>
        <div className="mt-4">
          <RunsTable
            rows={runRows}
            emptyLabel="Заездов пока нет."
            emptyAction={
              isOwner ? (
                <Button asChild>
                  <Link href="/texts">Выбрать текст</Link>
                </Button>
              ) : null
            }
          />
        </div>
      </section>
    </main>
  );
}
