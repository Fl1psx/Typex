export const TEXT_LANGUAGES = ["ru", "en"] as const;
export const TEXT_CATEGORIES = ["books", "quotes", "code"] as const;

export type TextLanguage = (typeof TEXT_LANGUAGES)[number];
export type TextCategory = (typeof TEXT_CATEGORIES)[number];

export const LANGUAGE_LABELS: Record<TextLanguage, string> = {
  ru: "Русский",
  en: "English",
};

export const LANGUAGE_SHORT_LABELS: Record<TextLanguage, string> = {
  ru: "RU",
  en: "EN",
};

export const CATEGORY_LABELS: Record<TextCategory, string> = {
  books: "Книги",
  quotes: "Цитаты",
  code: "Код",
};

export function normalizeTextContent(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, "  ")
    .trim();
}
