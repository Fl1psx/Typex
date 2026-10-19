"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export type RunRow = {
  id: string;
  title: string;
  language: string;
  wpm: number;
  accuracy: number;
  date: string;
};

export function RunsTable({
  rows,
  emptyLabel,
  emptyAction,
}: {
  rows: RunRow[];
  emptyLabel: string;
  emptyAction?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("ru");

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter(
      (row) =>
        row.title.toLocaleLowerCase("ru").includes(normalizedQuery) ||
        row.language.toLocaleLowerCase("ru").includes(normalizedQuery),
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
          placeholder="Поиск по тексту или языку"
          aria-label="Поиск по тексту или языку"
          className="h-9 pl-9"
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm text-subtle">{emptyLabel}</p>
          {emptyAction ? <div className="mt-6">{emptyAction}</div> : null}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm text-subtle">
            По запросу «{query.trim()}» ничего не найдено.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full table-fixed text-sm">
            <thead className="text-left">
              <tr className="border-b border-line">
                <th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.05em] text-subtle">
                  Текст
                </th>
                <th className="w-20 px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle md:w-24">
                  WPM
                </th>
                <th className="w-24 px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle md:w-32">
                  Точность
                </th>
                <th className="hidden w-44 px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.05em] text-subtle md:table-cell">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-background"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-ink">{row.title}</span>
                      <span className="shrink-0 rounded-sm border border-line px-1 py-1 font-mono text-[9px] uppercase text-subtle">
                        {row.language}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-subtle md:hidden">
                      {row.date}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-ink">
                    {row.wpm.toFixed(1)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-ink">
                    {row.accuracy.toFixed(1)}%
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-right font-mono text-xs text-subtle md:table-cell">
                    {row.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
