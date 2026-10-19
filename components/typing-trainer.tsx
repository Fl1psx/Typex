"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useAppearance } from "@/components/appearance-provider";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { playClick, playError } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import {
  applyTypingInput,
  calculateAccuracy,
  calculateWpm,
  charsEqual,
  countCorrect,
} from "@/lib/wpm";

type TrainerText = {
  id: string;
  title: string;
  author: string | null;
  language: string;
  content: string;
};

type FinalStats = {
  wpm: number;
  accuracy: number;
  durationSec: number;
};

const BLOCKED_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Delete",
  "Insert",
]);

const ERROR_FLASH_MS = 150;
const HINT_TIMEOUT_MS = 5000;

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function formatTime(totalMs: number) {
  const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function TypingTrainer({
  text,
  eyebrow,
  isAuthenticated = false,
}: {
  text: TrainerText;
  eyebrow?: string;
  isAuthenticated?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { appearance } = useAppearance();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [errorFlashIndex, setErrorFlashIndex] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [focused, setFocused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [confirmingAbort, setConfirmingAbort] = useState(false);

  const typedRef = useRef("");
  const errorsRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const flashTimerRef = useRef<number | null>(null);

  const characters = useMemo(() => Array.from(text.content), [text.content]);
  const typedCharacters = useMemo(() => Array.from(typed), [typed]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), HINT_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (startedAt === null || endedAt !== null) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => window.clearInterval(timer);
  }, [startedAt, endedAt]);

  const elapsedMs =
    startedAt === null ? 0 : Math.max(0, (endedAt ?? now) - startedAt);

  const correctChars = useMemo(
    () => countCorrect(typed, text.content),
    [typed, text.content],
  );

  const liveWpm =
    startedAt !== null && elapsedMs > 0
      ? calculateWpm(correctChars, elapsedMs)
      : 0;
  const liveAccuracy = calculateAccuracy(correctChars, errors);
  const hasStarted =
    startedAt !== null || endedAt !== null || finalStats !== null;
  const wpmValue = finalStats
    ? `${finalStats.wpm.toFixed(1)} WPM`
    : hasStarted
      ? `${Math.round(liveWpm)} WPM`
      : "—";
  const accuracyValue = finalStats
    ? `${finalStats.accuracy.toFixed(1)} %`
    : hasStarted
      ? `${Math.round(liveAccuracy)} %`
      : "—";
  const timeValue = finalStats
    ? formatTime(finalStats.durationSec * 1000)
    : hasStarted
      ? formatTime(elapsedMs)
      : "—";
  const progress =
    characters.length > 0
      ? Math.min(100, (typedCharacters.length / characters.length) * 100)
      : 0;

  const flashError = useCallback((index: number) => {
    setErrorFlashIndex(index);

    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
    }

    flashTimerRef.current = window.setTimeout(() => {
      setErrorFlashIndex(null);
      flashTimerRef.current = null;
    }, ERROR_FLASH_MS);
  }, []);

  const finishRace = useCallback(
    (value: string, errorCount: number, start: number) => {
      if (finishedRef.current) {
        return;
      }

      const end = Date.now();
      const correct = countCorrect(value, text.content);
      const durationMs = Math.max(1, end - start);

      finishedRef.current = true;
      setEndedAt(end);
      setNow(end);
      setFinalStats({
        wpm: roundOne(calculateWpm(correct, durationMs)),
        accuracy: roundOne(calculateAccuracy(correct, errorCount)),
        durationSec: Math.max(1, Math.round(durationMs / 1000)),
      });
      setFinished(true);
      inputRef.current?.blur();
    },
    [text.content],
  );

  const processTypedInput = (input: string) => {
    if (finishedRef.current || input.length === 0) {
      return;
    }

    setShowHint(false);

    const update = applyTypingInput(
      { accepted: typedRef.current, errors: errorsRef.current },
      text.content,
      input,
      appearance.strictMode,
    );

    if (update.accepted !== typedRef.current) {
      typedRef.current = update.accepted;
      setTyped(update.accepted);
    }

    if (update.errors !== errorsRef.current) {
      errorsRef.current = update.errors;
      setErrors(update.errors);
    }

    if (update.rejected) {
      if (appearance.errorSound) {
        playError();
      }

      if (appearance.strictMode && update.errorIndex !== null) {
        flashError(update.errorIndex);
      }
    }

    if (update.correctChars > 0 && appearance.typingSound) {
      playClick();
    }

    if (update.acceptedChars > 0 && startedAtRef.current === null) {
      const start = Date.now();
      startedAtRef.current = start;
      setStartedAt(start);
      setNow(start);
    }

    if (Array.from(update.accepted).length >= characters.length) {
      const start = startedAtRef.current ?? Date.now();
      finishRace(update.accepted, update.errors, start);
    }
  };

  const handleBeforeInput = (event: FormEvent<HTMLTextAreaElement>) => {
    if (!appearance.strictMode || finishedRef.current) {
      return;
    }

    const nativeEvent = event.nativeEvent as InputEvent;

    if (nativeEvent.inputType !== "insertText" || !nativeEvent.data) {
      return;
    }

    event.preventDefault();
    processTypedInput(nativeEvent.data);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (finishedRef.current) {
      return;
    }

    const raw = event.target.value.replace(/\r/g, "");
    const current = typedRef.current;

    if (raw === current) {
      return;
    }

    if (raw.length < current.length && current.startsWith(raw)) {
      typedRef.current = raw;
      setTyped(raw);
      return;
    }

    if (raw.length > current.length && raw.startsWith(current)) {
      processTypedInput(raw.slice(current.length));
      event.target.value = typedRef.current;
      return;
    }

    event.target.value = current;
  };

  const keepCaretAtEnd = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    const input = event.currentTarget;
    const end = input.value.length;

    if (input.selectionStart !== end || input.selectionEnd !== end) {
      input.setSelectionRange(end, end);
    }
  };

  const reset = useCallback(() => {
    typedRef.current = "";
    errorsRef.current = 0;
    startedAtRef.current = null;
    finishedRef.current = false;

    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }

    setTyped("");
    setErrors(0);
    setErrorFlashIndex(null);
    setStartedAt(null);
    setEndedAt(null);
    setNow(Date.now());
    setFinished(false);
    setFinalStats(null);
    setSaving(false);
    setSaveError(null);
    setConfirmingAbort(false);
    setShowHint(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const saveResult = async () => {
    if (!finalStats || saving) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textId: text.id,
          wpm: finalStats.wpm,
          accuracy: finalStats.accuracy,
          durationSec: finalStats.durationSec,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setSaveError(data?.error ?? "Не удалось сохранить результат");
        setSaving(false);
        return;
      }

      router.push("/results");
      router.refresh();
    } catch {
      setSaveError("Не удалось сохранить результат");
      setSaving(false);
    }
  };

  const requestAbort = useCallback(() => {
    if (finishedRef.current) {
      return;
    }

    if (startedAtRef.current !== null || typedRef.current.length > 0) {
      setConfirmingAbort(true);
      return;
    }

    reset();
  }, [reset]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (finishedRef.current) {
      event.preventDefault();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      requestAbort();
      return;
    }

    if (BLOCKED_KEYS.has(event.key)) {
      event.preventDefault();
      return;
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      ["a", "c", "v", "x"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
    }
  };

  const registerHref = `/register?callbackUrl=${encodeURIComponent(pathname)}`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { label: "Тексты", href: "/texts" },
            { label: text.title },
            { label: "Печатать" },
          ]}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="shrink-0"
        >
          <RotateCcw />
          Заново
        </Button>
      </div>

      <header className="mt-6">
        <p className="eyebrow">{eyebrow ?? `Заезд · ${text.language}`}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {text.title}
        </h1>
        <p className="mt-1 text-sm text-subtle">
          {text.author ?? "Без автора"} · {characters.length} символов
        </p>
      </header>

      {showHint ? (
        <p
          role="status"
          className="mt-4 text-sm text-subtle transition-opacity duration-300"
        >
          Печатайте текст. Ошибки подсвечиваются. Esc — выйти
        </p>
      ) : null}

      <section
        className={cn(
          "mt-6 rounded-lg border bg-surface transition-colors",
          focused ? "border-primary/40" : "border-line",
        )}
      >
        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          <Metric label="Скорость" value={wpmValue} />
          <Metric label="Точность" value={accuracyValue} />
          <Metric label="Время" value={timeValue} />
        </div>

        <div
          className="relative p-5 md:p-8"
          onContextMenu={(event) => event.preventDefault()}
        >
          <div
            aria-hidden="true"
            className="race-text select-none whitespace-pre-wrap break-words leading-[1.9] tracking-[0.01em]"
          >
            {characters.map((char, index) => {
              const isTyped = index < typedCharacters.length;
              const isCurrent = index === typedCharacters.length && !finished;
              const isCorrect =
                isTyped && charsEqual(typedCharacters[index], char);
              const isFlashing = isCurrent && errorFlashIndex === index;

              return (
                <span
                  key={index}
                  className={cn(
                    !isTyped && !isCurrent && "text-subtle/70",
                    isTyped && isCorrect && "text-ink",
                    isTyped &&
                      !isCorrect &&
                      "bg-danger/10 text-danger underline decoration-danger underline-offset-4",
                    isCurrent &&
                      !isFlashing &&
                      "race-current rounded-[2px] bg-primary/20 text-ink",
                    isFlashing &&
                      "race-error animate-shake rounded-[2px] bg-red-500/20 text-ink",
                  )}
                >
                  {char === "\n" ? "↵\n" : char}
                </span>
              );
            })}
          </div>

          <textarea
            ref={inputRef}
            value={typed}
            onBeforeInput={handleBeforeInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={keepCaretAtEnd}
            onClick={keepCaretAtEnd}
            onPaste={(event) => event.preventDefault()}
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            maxLength={text.content.length}
            rows={1}
            aria-label="Поле ввода текста"
            className="absolute inset-0 h-full w-full resize-none cursor-text text-base opacity-0"
          />
        </div>

        <div className="h-0.5 w-full bg-line">
          <div
            className="h-full bg-primary transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-[11px] text-subtle">
          <span>
            {finished
              ? "Заезд завершён"
              : !hasStarted
                ? "Начните печатать"
                : "Backspace — исправить · Esc — прервать"}
          </span>
          <span className="font-mono">
            {typedCharacters.length} / {characters.length}
          </span>
        </div>
      </section>

      <Dialog
        open={confirmingAbort}
        onOpenChange={(open) => {
          setConfirmingAbort(open);
          if (!open) {
            window.requestAnimationFrame(() => inputRef.current?.focus());
          }
        }}
      >
        <DialogContent
          className="max-w-sm"
          onEscapeKeyDown={() => setConfirmingAbort(false)}
          onPointerDownOutside={(event) => {
            event.preventDefault();
            setConfirmingAbort(false);
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Прервать заезд?</DialogTitle>
            <DialogDescription>
              Прогресс и статистика текущего заезда будут сброшены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmingAbort(false)}
            >
              Нет
            </Button>
            <Button type="button" onClick={reset}>
              Да
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={finished} onOpenChange={() => undefined}>
        <DialogContent
          hideClose
          className="max-w-md"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader>
            <p className="eyebrow">Заезд завершён</p>
            <DialogTitle>Результат</DialogTitle>
            <DialogDescription>
              {text.title}
              {text.author ? ` · ${text.author}` : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 divide-x divide-line border-y border-line">
            <ResultStat
              emphasis
              label="Скорость"
              value={finalStats ? `${finalStats.wpm.toFixed(1)} WPM` : "—"}
            />
            <ResultStat
              label="Точность"
              value={finalStats ? `${finalStats.accuracy.toFixed(1)} %` : "—"}
            />
            <ResultStat
              label="Время"
              value={
                finalStats ? formatTime(finalStats.durationSec * 1000) : "—"
              }
            />
          </div>

          {saveError ? (
            <p
              role="alert"
              className="rounded-md border border-danger/40 px-3 py-2 text-xs text-danger"
            >
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={reset}
              disabled={saving}
              className="h-11 w-full text-base"
            >
              Ещё раз
            </Button>
            {isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                onClick={saveResult}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="animate-spin" /> : null}
                {saving ? "Сохраняем..." : "Сохранить результат"}
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href={registerHref}>
                  Сохранить результат — зарегистрируйтесь
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="w-full">
              <Link href="/texts">Выбрать другой текст</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4 md:px-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl text-ink md:text-2xl">{value}</p>
    </div>
  );
}

function ResultStat({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="px-3 py-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-subtle">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-ink",
          emphasis ? "text-2xl" : "text-lg",
        )}
      >
        {value}
      </p>
    </div>
  );
}
