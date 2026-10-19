"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LABELS,
  LANGUAGE_LABELS,
  TEXT_CATEGORIES,
  TEXT_LANGUAGES,
  type TextCategory,
  type TextLanguage,
} from "@/lib/texts";
import { cn } from "@/lib/utils";

export function CreateTextForm({ username }: { username: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<TextLanguage>("ru");
  const [category, setCategory] = useState<TextCategory>("books");
  const [isPublic, setIsPublic] = useState(true);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const contentLength = content.trim().length;
  const contentInvalid = contentLength > 0 && contentLength < 50;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setTitleError(null);
    setContentError(null);

    let invalid = false;

    if (title.trim().length < 3) {
      setTitleError("Введите название от 3 символов");
      invalid = true;
    }

    if (contentLength < 50) {
      setContentError("Текст должен быть не короче 50 символов");
      invalid = true;
    }

    if (invalid) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          language,
          category,
          isPublic,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Не удалось создать текст");
        setLoading(false);
        return;
      }

      router.push("/texts?view=mine");
      router.refresh();
    } catch {
      setError("Не удалось создать текст. Попробуйте ещё раз");
      setLoading(false);
    }
  }

  return (
    <form
      className="mt-6 overflow-hidden rounded-lg border border-line bg-surface"
      onSubmit={handleSubmit}
    >
      <div className="space-y-6 p-5 md:p-6">
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleError(null);
            }}
            placeholder="Например: Отрывок о скорости"
            maxLength={120}
            required
            autoFocus
            aria-invalid={titleError ? true : undefined}
            aria-describedby={titleError ? "title-error" : undefined}
            className={titleError ? "border-danger" : undefined}
          />
          {titleError ? (
            <p id="title-error" role="alert" className="text-xs text-danger">
              {titleError}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="content">Текст</Label>
            <span
              className={cn(
                "font-mono text-[10px]",
                contentInvalid ? "text-danger" : "text-subtle",
              )}
            >
              {contentLength} / 5000
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setContentError(null);
            }}
            placeholder="Вставьте или напишите текст от 50 до 5000 символов..."
            maxLength={5000}
            required
            aria-invalid={contentError ? true : undefined}
            aria-describedby={contentError ? "content-error" : undefined}
            className={cn(
              "min-h-48 font-mono text-[13px] leading-6",
              contentError && "border-danger",
            )}
          />
          {contentError ? (
            <p id="content-error" role="alert" className="text-xs text-danger">
              {contentError}
            </p>
          ) : null}
          <p className="text-[11px] leading-relaxed text-subtle">
            Минимум 50 символов. Переносы строк сохраняются — в заезде они
            вводятся клавишей Enter.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="language">Язык</Label>
            <div className="relative">
              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as TextLanguage)
                }
                className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm text-ink transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TEXT_LANGUAGES.map((value) => (
                  <option key={value} value={value}>
                    {LANGUAGE_LABELS[value]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <div className="relative">
              <select
                id="category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as TextCategory)
                }
                className="h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm text-ink transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {TEXT_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-background p-4 transition-colors hover:border-subtle/50">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            <span className="block text-sm text-ink">Публичный текст</span>
            <span className="mt-1 block text-xs leading-relaxed text-subtle">
              Доступен всем в библиотеке и рейтинге. Приватный текст останется
              только у вас.
            </span>
          </span>
        </label>

        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          Автор: @{username}
        </p>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-danger/40 px-3 py-2 text-xs leading-relaxed text-danger"
          >
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 md:px-6">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/texts">Отмена</Link>
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? "Создаём..." : "Создать текст"}
        </Button>
      </div>
    </form>
  );
}
