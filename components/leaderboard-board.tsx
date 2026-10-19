"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LeaderboardUser = {
  username: string;
  avatarStyle: string;
  bestWpm: number | null;
  bestAccuracy: number | null;
  resultsCount: number;
};

export type LeaderboardText = {
  id: string;
  title: string;
  language: string;
  bestWpm: number | null;
  bestUsername: string | null;
  resultsCount: number;
};

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function LeaderboardBoard({
  users,
  texts,
  currentUsername,
}: {
  users: LeaderboardUser[];
  texts: LeaderboardText[];
  currentUsername?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");

  const filteredUsers = useMemo(() => {
    const list = normalizedQuery
      ? users.filter((user) =>
          user.username.toLocaleLowerCase("ru").includes(normalizedQuery),
        )
      : users;
    return list.slice(0, 10);
  }, [normalizedQuery, users]);

  const filteredTexts = useMemo(() => {
    const list = normalizedQuery
      ? texts.filter(
          (text) =>
            text.title.toLocaleLowerCase("ru").includes(normalizedQuery) ||
            (text.bestUsername ?? "")
              .toLocaleLowerCase("ru")
              .includes(normalizedQuery),
        )
      : texts;
    return list.slice(0, 10);
  }, [normalizedQuery, texts]);

  const nothingFound =
    normalizedQuery.length > 0 &&
    filteredUsers.length === 0 &&
    filteredTexts.length === 0;

  return (
    <div className="mt-6 space-y-4">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по нику или тексту"
          aria-label="Поиск по нику или тексту"
          className="h-9 pl-9"
        />
      </div>

      {nothingFound ? (
        <p className="rounded-lg border border-line bg-surface px-4 py-10 text-center text-sm text-subtle">
          По запросу «{query.trim()}» ничего не найдено.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-medium text-ink">Пользователи</h2>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-subtle">
                Пока нет заездов.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="w-10 px-3 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        #
                      </th>
                      <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        Пользователь
                      </th>
                      <th className="w-16 px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        WPM
                      </th>
                      <th className="w-24 whitespace-nowrap px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        Точность
                      </th>
                      <th className="hidden w-24 whitespace-nowrap px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle sm:table-cell">
                        Заезды
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.map((user, index) => {
                      const isSelf = user.username === currentUsername;

                      return (
                        <tr
                          key={user.username}
                          className={cn(
                            "transition-colors hover:bg-background",
                            isSelf && "bg-primary/5",
                          )}
                        >
                          <td
                            className={cn(
                              "px-3 py-3 font-mono text-xs",
                              index < 3 ? "text-primary" : "text-subtle",
                            )}
                          >
                            {index + 1}
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/profile/${encodeURIComponent(user.username)}`}
                              className="flex min-w-0 items-center gap-2 text-ink hover:underline hover:underline-offset-4"
                            >
                              <Avatar
                                username={user.username}
                                style={user.avatarStyle}
                                size={24}
                                className="rounded-sm"
                              />
                              <span className="truncate">
                                @{user.username}
                              </span>
                              {isSelf ? (
                                <span className="shrink-0 rounded-sm border border-primary/40 px-1 py-0.5 font-mono text-[9px] uppercase text-primary">
                                  вы
                                </span>
                              ) : null}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">
                            {user.bestWpm === null
                              ? "—"
                              : roundOne(user.bestWpm).toFixed(1)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">
                            {user.bestAccuracy === null
                              ? "—"
                              : `${roundOne(user.bestAccuracy).toFixed(1)}%`}
                          </td>
                          <td className="hidden whitespace-nowrap px-3 py-3 text-right font-mono text-subtle sm:table-cell">
                            {user.resultsCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-sm font-medium text-ink">Тексты</h2>
            </div>

            {filteredTexts.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-subtle">
                Пока нет результатов по текстам.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="w-10 px-3 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        #
                      </th>
                      <th className="px-3 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        Текст
                      </th>
                      <th className="w-16 px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                        WPM
                      </th>
                      <th className="hidden w-24 whitespace-nowrap px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle sm:table-cell">
                        Заезды
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredTexts.map((text, index) => (
                      <tr
                        key={text.id}
                        className="transition-colors hover:bg-background"
                      >
                        <td
                          className={cn(
                            "px-3 py-3 font-mono text-xs",
                            index < 3 ? "text-primary" : "text-subtle",
                          )}
                        >
                          {index + 1}
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/practice/${text.id}`}
                            className="block truncate text-ink hover:underline hover:underline-offset-4"
                          >
                            {text.title}
                          </Link>
                          <p className="mt-1 truncate font-mono text-[10px] text-subtle">
                            {text.language} · @{text.bestUsername ?? "—"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">
                          {text.bestWpm === null
                            ? "—"
                            : roundOne(text.bestWpm).toFixed(1)}
                        </td>
                        <td className="hidden whitespace-nowrap px-3 py-3 text-right font-mono text-subtle sm:table-cell">
                          {text.resultsCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
