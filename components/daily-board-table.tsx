"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DailyBoardRow = {
  username: string;
  avatarStyle: string;
  wpm: number;
  accuracy: number;
  time: string;
};

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function DailyBoardTable({
  rows,
  currentUsername,
}: {
  rows: DailyBoardRow[];
  currentUsername?: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      row.username.toLocaleLowerCase("ru").includes(normalizedQuery),
    );
  }, [normalizedQuery, rows]);

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по нику"
          aria-label="Поиск по нику"
          className="h-9 pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-subtle">
          По запросу «{query.trim()}» ничего не найдено.
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
                <th className="w-20 px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                  WPM
                </th>
                <th className="w-24 whitespace-nowrap px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                  Точность
                </th>
                <th className="hidden w-28 whitespace-nowrap px-3 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle sm:table-cell">
                  Время
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((row, index) => {
                const isSelf = row.username === currentUsername;

                return (
                  <tr
                    key={row.username}
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
                        href={`/profile/${encodeURIComponent(row.username)}`}
                        className="flex min-w-0 items-center gap-2 text-ink hover:underline hover:underline-offset-4"
                      >
                        <Avatar
                          username={row.username}
                          style={row.avatarStyle}
                          size={24}
                          className="rounded-sm"
                        />
                        <span className="truncate">@{row.username}</span>
                        {isSelf ? (
                          <span className="shrink-0 rounded-sm border border-primary/40 px-1 py-0.5 font-mono text-[9px] uppercase text-primary">
                            вы
                          </span>
                        ) : null}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">
                      {roundOne(row.wpm).toFixed(1)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-mono text-ink">
                      {roundOne(row.accuracy).toFixed(1)}%
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-right font-mono text-xs text-subtle sm:table-cell">
                      {row.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
