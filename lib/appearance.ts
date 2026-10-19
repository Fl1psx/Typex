import type { CSSProperties } from "react";
import { z } from "zod";

export const APPEARANCE_THEMES = ["dark", "light"] as const;
export const ACCENT_NAMES = ["lime", "amber", "sky", "coral"] as const;
export const RACE_FONT_NAMES = ["jetbrains", "plex", "fira"] as const;
export const RACE_FONT_SIZES = [16, 18, 20, 24] as const;

export type AppearanceTheme = (typeof APPEARANCE_THEMES)[number];
export type AccentName = (typeof ACCENT_NAMES)[number];
export type RaceFontName = (typeof RACE_FONT_NAMES)[number];
export type RaceFontSize = (typeof RACE_FONT_SIZES)[number];

export const ACCENT_PRESETS: Record<
  AccentName,
  { label: string; hsl: string; hex: string; hslLight: string; hexLight: string }
> = {
  lime: {
    label: "Лайм",
    hsl: "83 78% 56%",
    hex: "#A3E635",
    hslLight: "82 72% 30%",
    hexLight: "#4D7C0F",
  },
  amber: {
    label: "Янтарь",
    hsl: "38 92% 50%",
    hex: "#F59E0B",
    hslLight: "28 86% 34%",
    hexLight: "#B45309",
  },
  sky: {
    label: "Голубой",
    hsl: "199 89% 60%",
    hex: "#38BDF8",
    hslLight: "201 90% 32%",
    hexLight: "#0369A1",
  },
  coral: {
    label: "Коралл",
    hsl: "350 89% 71%",
    hex: "#FB7185",
    hslLight: "347 77% 42%",
    hexLight: "#BE123C",
  },
};

export const RACE_FONTS: Record<
  RaceFontName,
  { label: string; variable: string }
> = {
  jetbrains: { label: "JetBrains Mono", variable: "var(--font-jetbrains)" },
  plex: { label: "IBM Plex Mono", variable: "var(--font-plex)" },
  fira: { label: "Fira Code", variable: "var(--font-fira)" },
};

export const THEME_COLORS: Record<
  AppearanceTheme,
  { surface: string; line: string; subtle: string; ink: string }
> = {
  dark: {
    surface: "#181B21",
    line: "#2A2F3A",
    subtle: "#9AA0A6",
    ink: "#E8EAED",
  },
  light: {
    surface: "#FFFFFF",
    line: "#D6D3D1",
    subtle: "#78716C",
    ink: "#1C1917",
  },
};

export const APPEARANCE_STORAGE_KEY = "typex:appearance";

export const appearanceSchema = z.object({
  theme: z.enum(APPEARANCE_THEMES),
  accent: z.enum(ACCENT_NAMES),
  raceFont: z.enum(RACE_FONT_NAMES),
  raceFontSize: z.number().refine(
    (value): value is RaceFontSize =>
      (RACE_FONT_SIZES as readonly number[]).includes(value),
    "Недопустимый размер шрифта",
  ),
  strictMode: z.boolean().default(true),
  errorSound: z.boolean().default(true),
  typingSound: z.boolean().default(false),
});

export type Appearance = z.infer<typeof appearanceSchema>;

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "dark",
  accent: "lime",
  raceFont: "jetbrains",
  raceFontSize: 20,
  strictMode: true,
  errorSound: true,
  typingSound: false,
};

export function parseAppearance(raw: string | null | undefined): Appearance {
  if (!raw) {
    return DEFAULT_APPEARANCE;
  }

  try {
    const value = JSON.parse(raw) as unknown;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return DEFAULT_APPEARANCE;
    }

    const record = value as Record<string, unknown>;
    const legacyTypingSound =
      typeof record.typingSound === "boolean"
        ? record.typingSound
        : typeof record.sound === "boolean"
          ? record.sound
          : undefined;
    const parsed = appearanceSchema.safeParse({
      ...record,
      typingSound: legacyTypingSound,
    });

    return parsed.success ? parsed.data : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function getAppearanceStyle(
  appearance: Appearance,
): CSSProperties & Record<`--${string}`, string> {
  const accent = ACCENT_PRESETS[appearance.accent];
  const accentHsl = appearance.theme === "light" ? accent.hslLight : accent.hsl;

  return {
    "--primary": accentHsl,
    "--accent": accentHsl,
    "--ring": accentHsl,
    "--font-race": RACE_FONTS[appearance.raceFont].variable,
    "--race-size": `${appearance.raceFontSize}px`,
  } as CSSProperties & Record<`--${string}`, string>;
}
