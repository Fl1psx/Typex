"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Check,
  Loader2,
  Moon,
  ShieldCheck,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppearance } from "@/components/appearance-provider";
import {
  ACCENT_NAMES,
  ACCENT_PRESETS,
  RACE_FONT_NAMES,
  RACE_FONTS,
  RACE_FONT_SIZES,
  type Appearance,
  type AppearanceTheme,
} from "@/lib/appearance";
import {
  AVATAR_STYLES,
  AVATAR_STYLE_LABELS,
  type AvatarStyle,
} from "@/lib/profile";
import { isAudioSupported, playClick, playError } from "@/lib/sounds";
import { cn } from "@/lib/utils";

type SettingsFormProps = {
  username: string;
  email: string;
  initialBio: string;
  initialAvatarStyle: AvatarStyle;
  initialAppearance: Appearance;
};

const themeOptions: {
  value: AppearanceTheme;
  label: string;
  icon: typeof Moon;
}[] = [
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "light", label: "Светлая", icon: Sun },
];

export function SettingsForm({
  username,
  email,
  initialBio,
  initialAvatarStyle,
  initialAppearance,
}: SettingsFormProps) {
  const router = useRouter();
  const { applyAppearance } = useAppearance();
  const [bio, setBio] = useState(initialBio);
  const [avatarStyle, setAvatarStyle] =
    useState<AvatarStyle>(initialAvatarStyle);
  const [appearance, setAppearance] =
    useState<Appearance>(initialAppearance);
  const [audioSupported, setAudioSupported] = useState<boolean | null>(null);
  const [errorSoundError, setErrorSoundError] = useState<string | null>(null);
  const [typingSoundError, setTypingSoundError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAudioSupported(isAudioSupported());
  }, []);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  function markChanged() {
    setSaved(false);
  }

  function updateBio(value: string) {
    setBio(value);
    markChanged();
  }

  function updateAvatarStyle(value: AvatarStyle) {
    setAvatarStyle(value);
    markChanged();
  }

  function updateAppearance(patch: Partial<Appearance>) {
    const next = { ...appearance, ...patch };
    setAppearance(next);
    applyAppearance(next);
    markChanged();
  }

  function toggleTypingSound() {
    if (audioSupported === false) {
      return;
    }

    if (appearance.typingSound) {
      updateAppearance({ typingSound: false });
      return;
    }

    if (!playClick()) {
      setTypingSoundError("Браузер не поддерживает Web Audio");
      return;
    }

    setTypingSoundError(null);
    updateAppearance({ typingSound: true });
  }

  function toggleErrorSound() {
    if (audioSupported === false) {
      return;
    }

    if (appearance.errorSound) {
      updateAppearance({ errorSound: false });
      return;
    }

    if (!playError()) {
      setErrorSoundError("Браузер не поддерживает Web Audio");
      return;
    }

    setErrorSoundError(null);
    updateAppearance({ errorSound: true });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, avatarStyle, settings: appearance }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "Не удалось сохранить настройки");
        setLoading(false);
        return;
      }

      setSaved(true);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Не удалось сохранить настройки. Попробуйте ещё раз");
      setLoading(false);
    }
  }

  return (
    <form
      className="mt-6 overflow-hidden rounded-lg border border-line bg-surface"
      onSubmit={handleSubmit}
    >
      <div className="space-y-8 p-5 md:p-6">
        <section>
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-ink">Внешний вид</h2>
            <p className="text-xs leading-relaxed text-subtle">
              Тема и акцент применяются ко всему интерфейсу. Шрифт и размер
              влияют только на текст заезда.
            </p>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-medium text-ink">Тема</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = appearance.theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateAppearance({ theme: option.value })}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-ink"
                          : "border-line bg-background text-subtle hover:border-subtle/50 hover:text-ink",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                      {selected ? (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink">Акцент</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ACCENT_NAMES.map((name) => {
                  const preset = ACCENT_PRESETS[name];
                  const selected = appearance.accent === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => updateAppearance({ accent: name })}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs transition-colors",
                        selected
                          ? "border-primary text-ink"
                          : "border-line text-subtle hover:border-subtle/50 hover:text-ink",
                      )}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-sm border border-black/20"
                        style={{ backgroundColor: preset.hex }}
                      />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink">Шрифт заезда</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {RACE_FONT_NAMES.map((name) => {
                  const selected = appearance.raceFont === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => updateAppearance({ raceFont: name })}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border px-3 py-2 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-line bg-background hover:border-subtle/50",
                      )}
                    >
                      <span
                        className="block text-base text-ink"
                        style={{
                          fontFamily: `${RACE_FONTS[name].variable}, monospace`,
                        }}
                      >
                        Aa Бб 123
                      </span>
                      <span className="mt-1 block text-[11px] text-subtle">
                        {RACE_FONTS[name].label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink">Размер шрифта</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {RACE_FONT_SIZES.map((size) => {
                  const selected = appearance.raceFontSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        updateAppearance({ raceFontSize: size })
                      }
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border py-2 text-center font-mono text-xs transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-ink"
                          : "border-line bg-background text-subtle hover:border-subtle/50 hover:text-ink",
                      )}
                    >
                      {size} px
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <ToggleRow
                icon={
                  appearance.strictMode ? (
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-subtle" />
                  )
                }
                title="Строгий режим (не пускать дальше при ошибке)"
                description="Опечатка не сдвигает курсор и учитывается в точности."
                checked={appearance.strictMode}
                ariaLabel="Строгий режим"
                onToggle={() =>
                  updateAppearance({ strictMode: !appearance.strictMode })
                }
              />

              <ToggleRow
                icon={
                  appearance.errorSound ? (
                    <Volume2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <VolumeX className="mt-1 h-4 w-4 shrink-0 text-subtle" />
                  )
                }
                title="Звук при ошибке"
                description="Тихий сигнал, когда символ не совпал с ожидаемым."
                checked={appearance.errorSound}
                disabled={audioSupported === false}
                ariaLabel="Звук при ошибке"
                note={
                  errorSoundError ??
                  (audioSupported === false
                    ? "Web Audio не поддерживается этим браузером."
                    : null)
                }
                onToggle={toggleErrorSound}
              />

              <ToggleRow
                icon={
                  appearance.typingSound ? (
                    <Volume2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <VolumeX className="mt-1 h-4 w-4 shrink-0 text-subtle" />
                  )
                }
                title="Звук печати"
                description="Короткий клик при правильном нажатии. По умолчанию выключен."
                checked={appearance.typingSound}
                disabled={audioSupported === false}
                ariaLabel="Звук печати"
                note={
                  typingSoundError ??
                  (audioSupported === false
                    ? "Web Audio не поддерживается этим браузером."
                    : null)
                }
                onToggle={toggleTypingSound}
              />
            </div>

            <div className="rounded-md border border-line bg-background p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                Предпросмотр
              </p>
              <p className="race-text mt-3 leading-relaxed text-ink">
                Ритм важнее скорости.{" "}
                <span className="text-primary">Печатайте спокойно.</span>
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-medium text-ink">Аватар</h2>
              <p className="mt-1 text-xs leading-relaxed text-subtle">
                Стиль DiceBear на сплошном фоне. Выберите один из трёх
                вариантов.
              </p>
            </div>
            <Avatar
              username={username}
              style={avatarStyle}
              size={56}
              className="rounded-md"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {AVATAR_STYLES.map((style) => {
              const selected = style === avatarStyle;

              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => updateAvatarStyle(style)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-background"
                      : "border-line bg-background hover:border-subtle/50",
                  )}
                >
                  <Avatar
                    username={username}
                    style={style}
                    size={40}
                    className="rounded-md"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">
                      {AVATAR_STYLE_LABELS[style]}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
                      {style}
                    </span>
                  </span>
                  {selected ? (
                    <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line pt-6">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="bio">Описание</Label>
            <span
              className={cn(
                "font-mono text-[10px]",
                bio.length > 280 ? "text-danger" : "text-subtle",
              )}
            >
              {bio.length} / 280
            </span>
          </div>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => updateBio(event.target.value)}
            placeholder="Коротко о себе: что печатаете, зачем и как долго."
            maxLength={280}
            className="mt-2 min-h-28"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-subtle">
            Отображается в вашем профиле. Можно оставить пустым.
          </p>
        </section>

        <section className="border-t border-line pt-6">
          <h2 className="text-sm font-medium text-ink">Аккаунт</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                value={`@${username}`}
                readOnly
                disabled
                className="disabled:opacity-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                readOnly
                disabled
                className="disabled:opacity-100"
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-subtle">
            Имя пользователя и email изменить нельзя.
          </p>
        </section>

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
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" asChild>
            <Link href={`/profile/${encodeURIComponent(username)}`}>
              Профиль
            </Link>
          </Button>
          {saved ? (
            <span
              role="status"
              className="inline-flex items-center gap-2 text-xs text-primary"
            >
              <Check className="h-4 w-4" />
              Сохранено
            </span>
          ) : null}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {loading ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onToggle,
  ariaLabel,
  disabled = false,
  note,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  disabled?: boolean;
  note?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-line bg-background px-3 py-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon}
        <div>
          <p className="text-xs font-medium text-ink">{title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-subtle">
            {description}
          </p>
          {note ? (
            <p className="mt-1 text-[11px] text-danger">{note}</p>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "relative mt-1 h-6 w-11 shrink-0 rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "border-primary bg-primary" : "border-line bg-surface",
        )}
      >
        <span
          className={cn(
            "absolute left-1 top-1 h-4 w-4 rounded-sm transition-transform",
            checked ? "translate-x-5 bg-primary-foreground" : "bg-subtle",
          )}
        />
      </button>
    </div>
  );
}
