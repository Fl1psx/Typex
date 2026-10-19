export const AVATAR_STYLES = ["initials", "bottts", "thumbs"] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export const AVATAR_STYLE_LABELS: Record<AvatarStyle, string> = {
  initials: "Инициалы",
  bottts: "Робот",
  thumbs: "Жест",
};

export function isAvatarStyle(value: string): value is AvatarStyle {
  return (AVATAR_STYLES as readonly string[]).includes(value);
}

export function getAvatarUrl(username: string, style: string) {
  const safeStyle = isAvatarStyle(style) ? style : "initials";
  const seed = encodeURIComponent(username);
  const options =
    "backgroundColor=2a2f3a&backgroundType=solid&radius=0&textColor=e8eaed";

  return `https://api.dicebear.com/9.x/${safeStyle}/svg?seed=${seed}&${options}`;
}
