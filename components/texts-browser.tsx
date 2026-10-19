"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CATEGORY_LABELS,
  LANGUAGE_SHORT_LABELS,
  type TextCategory,
  type TextLanguage,
} from "@/lib/texts";
import { cn } from "@/lib/utils";

export type TextListItem = {
  id: string;
  title: string;
  language: TextLanguage;
  category: TextCategory;
  author: string | null;
  isPublic: boolean;
  createdById: string | null;
  length: number;
};

type TextsBrowserProps = {
  publicTexts: TextListItem[];
  myTexts: TextListItem[];
  currentUserId: string | null;
  initialView: "all" | "mine";
};

type TextView = "all" | "mine";
type LanguageFilter = "all" | TextLanguage;
type CategoryFilter = "all" | TextCategory;

export function TextsBrowser({
  publicTexts,
  myTexts,
  currentUserId,
  initialView,
}: TextsBrowserProps) {
  const [view, setView] = useState<TextView>(
    initialView === "mine" && currentUserId ? "mine" : "all",
  );
  const [language, setLanguage] = useState<LanguageFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");

  const source = view === "mine" ? myTexts : publicTexts;

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");

    return source.filter((text) => {
      const matchesLanguage =
        language === "all" || text.language === language;
      const matchesCategory =
        category === "all" || text.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        text.title.toLocaleLowerCase("ru").includes(normalizedQuery);

      return matchesLanguage && matchesCategory && matchesQuery;
    });
  }, [category, language, query, source]);

  const hasFilters =
    query.trim().length > 0 || language !== "all" || category !== "all";

  const resetFilters = () => {
    setQuery("");
    setLanguage("all");
    setCategory("all");
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2">
          <div className="flex items-center gap-5">
            <TabButton
              active={view === "all"}
              count={publicTexts.length}
              onClick={() => setView("all")}
            >
              Все тексты
            </TabButton>
            {currentUserId ? (
              <TabButton
                active={view === "mine"}
                count={myTexts.length}
                onClick={() => setView("mine")}
              >
                Мои тексты
              </TabButton>
            ) : null}
          </div>

          <Button asChild size="sm" variant="outline">
            <Link href="/texts/new">
              <Plus />
              Создать текст
            </Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию"
              aria-label="Поиск по названию"
              className="h-9 pl-9"
            />
          </div>

          <FilterSelect
            label="Язык"
            value={language}
            onChange={(value) => setLanguage(value as LanguageFilter)}
            className="md:w-40"
          >
            <option value="all">Все языки</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </FilterSelect>

          <FilterSelect
            label="Категория"
            value={category}
            onChange={(value) => setCategory(value as CategoryFilter)}
            className="md:w-40"
          >
            <option value="all">Все категории</option>
            <option value="books">Книги</option>
            <option value="quotes">Цитаты</option>
            <option value="code">Код</option>
          </FilterSelect>

          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 shrink-0 px-2 text-xs text-subtle transition-colors hover:text-ink"
            >
              Сбросить
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-subtle">
        <span>
          Найдено: <span className="font-mono text-ink">{filtered.length}</span>
        </span>
        <span className="font-mono">
          {view === "mine" ? "МОИ ТЕКСТЫ" : "ПУБЛИЧНЫЕ"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-lg border border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm text-subtle">
            {hasFilters
              ? view === "mine"
                ? "Среди ваших текстов ничего не найдено."
                : "По выбранным фильтрам текстов не найдено."
              : view === "mine"
                ? "Вы ещё не создали ни одного текста."
                : "В библиотеке пока нет текстов."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {hasFilters ? (
              <Button type="button" variant="outline" onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            ) : null}
            {view === "mine" ? (
              <Button asChild>
                <Link href="/texts/new">Создать текст</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((text) => (
            <article
              key={text.id}
              className="flex flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-subtle/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-medium tracking-tight text-ink">
                    <Link
                      href={`/practice/${text.id}`}
                      className="rounded-sm transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {text.title}
                    </Link>
                  </h2>
                  <p className="mt-1 truncate text-sm text-subtle">
                    {text.author ?? "Без автора"}
                  </p>
                </div>
                <span className="shrink-0 rounded-sm border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                  {LANGUAGE_SHORT_LABELS[text.language]}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-subtle">
                <span>{CATEGORY_LABELS[text.category]}</span>
                <span className="h-3 w-px bg-line" />
                <span className="font-mono">{text.length} симв.</span>
                {view === "mine" && !text.isPublic ? (
                  <>
                    <span className="h-3 w-px bg-line" />
                    <span className="rounded-sm border border-line px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-subtle">
                      Приватный
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <Button asChild size="sm" className="w-full">
                  <Link href={`/practice/${text.id}`}>Печатать</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 items-center gap-2 border-b text-sm transition-colors",
        active
          ? "border-primary text-ink"
          : "border-transparent text-subtle hover:text-ink",
      )}
    >
      {children}
      <span className="font-mono text-[10px] text-subtle">{count}</span>
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm text-ink transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
    </div>
  );
}
