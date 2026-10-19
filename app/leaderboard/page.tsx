import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatDailyDateKey,
  getLocalDateKey,
  getLocalDayRange,
  getOrCreateDailyText,
} from "@/lib/daily-text";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  LeaderboardBoard,
  type LeaderboardText,
  type LeaderboardUser,
} from "@/components/leaderboard-board";
import {
  DailyBoardTable,
  type DailyBoardRow,
} from "@/components/daily-board-table";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Рейтинг",
};

export const dynamic = "force-dynamic";

type LeaderboardPageProps = {
  searchParams?: { period?: string };
};

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

async function getDailyLeaderboard() {
  const dateKey = getLocalDateKey();
  const daily = await getOrCreateDailyText(dateKey);

  if (!daily) {
    return { dateKey, daily: null, results: [] };
  }

  const { start, end } = getLocalDayRange();
  const rawResults = await prisma.result.findMany({
    where: {
      textId: daily.textId,
      createdAt: { gte: start, lt: end },
    },
    orderBy: [
      { wpm: "desc" },
      { accuracy: "desc" },
      { createdAt: "asc" },
    ],
    select: {
      wpm: true,
      accuracy: true,
      createdAt: true,
      user: {
        select: { username: true, avatarStyle: true },
      },
    },
  });

  const seen = new Set<string>();
  const results = rawResults.filter((result) => {
    if (seen.has(result.user.username)) {
      return false;
    }

    seen.add(result.user.username);
    return true;
  });

  return { dateKey, daily, results: results.slice(0, 10) };
}

async function getAllTimeLeaderboard(): Promise<{
  users: LeaderboardUser[];
  texts: LeaderboardText[];
}> {
  const [rawUsers, rawTexts] = await Promise.all([
    prisma.user.findMany({
      where: { results: { some: {} } },
      select: {
        username: true,
        avatarStyle: true,
        _count: { select: { results: true } },
        results: {
          orderBy: { wpm: "desc" },
          take: 1,
          select: { wpm: true, accuracy: true },
        },
      },
    }),
    prisma.text.findMany({
      where: { isPublic: true, results: { some: {} } },
      select: {
        id: true,
        title: true,
        language: true,
        _count: { select: { results: true } },
        results: {
          orderBy: { wpm: "desc" },
          take: 1,
          select: {
            wpm: true,
            user: { select: { username: true } },
          },
        },
      },
    }),
  ]);

  const users: LeaderboardUser[] = rawUsers
    .sort(
      (a, b) =>
        (b.results[0]?.wpm ?? 0) - (a.results[0]?.wpm ?? 0) ||
        b._count.results - a._count.results,
    )
    .map((user) => ({
      username: user.username,
      avatarStyle: user.avatarStyle,
      bestWpm: user.results[0]?.wpm ?? null,
      bestAccuracy: user.results[0]?.accuracy ?? null,
      resultsCount: user._count.results,
    }));

  const texts: LeaderboardText[] = rawTexts
    .sort(
      (a, b) =>
        (b.results[0]?.wpm ?? 0) - (a.results[0]?.wpm ?? 0) ||
        b._count.results - a._count.results,
    )
    .map((text) => ({
      id: text.id,
      title: text.title,
      language: text.language,
      bestWpm: text.results[0]?.wpm ?? null,
      bestUsername: text.results[0]?.user.username ?? null,
      resultsCount: text._count.results,
    }));

  return { users, texts };
}

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const isToday = searchParams?.period === "today";
  const session = await getServerSession(authOptions);
  const dailyBoard = isToday ? await getDailyLeaderboard() : null;
  const allTime = isToday ? null : await getAllTimeLeaderboard();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Главная", href: "/" },
          { label: "Рейтинг" },
        ]}
      />
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Рейтинг</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {isToday ? "Заезды за сегодня" : "Лучшие результаты"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-subtle">
          {isToday
            ? "Лучший результат каждого пользователя на тексте дня."
            : "Топ-10 пользователей и публичных текстов. Воспользуйтесь поиском, чтобы найти себя."}
        </p>

        <div className="mt-5 inline-flex rounded-md border border-line p-1">
          <Link
            href="/leaderboard"
            className={cn(
              "rounded-sm px-3 py-2 text-xs font-medium transition-colors",
              !isToday
                ? "bg-primary/10 text-ink"
                : "text-subtle hover:text-ink",
            )}
          >
            За всё время
          </Link>
          <Link
            href="/leaderboard?period=today"
            className={cn(
              "rounded-sm px-3 py-2 text-xs font-medium transition-colors",
              isToday
                ? "bg-primary/10 text-ink"
                : "text-subtle hover:text-ink",
            )}
          >
            Сегодня
          </Link>
        </div>
      </header>

      {dailyBoard?.daily ? (
        <DailyBoard
          board={dailyBoard}
          currentUsername={session?.user.username}
        />
      ) : null}

      {isToday && dailyBoard && !dailyBoard.daily ? (
        <div className="mt-6 rounded-lg border border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm text-subtle">
            Текст дня пока не назначен.
          </p>
          <Button asChild className="mt-6">
            <Link href="/texts">Добавить публичный текст</Link>
          </Button>
        </div>
      ) : null}

      {allTime ? (
        <LeaderboardBoard
          users={allTime.users}
          texts={allTime.texts}
          currentUsername={session?.user.username}
        />
      ) : null}
    </main>
  );
}

function DailyBoard({
  board,
  currentUsername,
}: {
  board: Awaited<ReturnType<typeof getDailyLeaderboard>>;
  currentUsername?: string;
}) {
  const { daily, results, dateKey } = board;

  if (!daily) {
    return null;
  }

  const rows: DailyBoardRow[] = results.map((result) => ({
    username: result.user.username,
    avatarStyle: result.user.avatarStyle,
    wpm: result.wpm,
    accuracy: result.accuracy,
    time: timeFormatter.format(result.createdAt),
  }));

  return (
    <div className="mt-6">
      <section className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Текст дня · {formatDailyDateKey(dateKey)}</p>
            <h2 className="mt-2 truncate text-lg font-medium text-ink">
              {daily.text.title}
            </h2>
            <p className="mt-1 text-xs text-subtle">
              {daily.text.author ?? "Без автора"} ·{" "}
              {daily.text.language.toUpperCase()}
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/practice/daily">Печатать текст дня</Link>
          </Button>
        </div>

        <div className="p-4">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-subtle">
                Сегодня ещё никто не печатал текст дня.
              </p>
              <p className="mt-1 text-xs text-subtle">
                Станьте первым в сегодняшнем рейтинге.
              </p>
            </div>
          ) : (
            <DailyBoardTable rows={rows} currentUsername={currentUsername} />
          )}
        </div>
      </section>

      <p className="mt-4 text-xs text-subtle">
        После заезда на тексте дня результат автоматически появляется здесь.
      </p>
    </div>
  );
}
