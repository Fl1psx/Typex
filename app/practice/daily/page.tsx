import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TypingTrainer } from "@/components/typing-trainer";
import {
  formatDailyDateKey,
  getLocalDateKey,
  getOrCreateDailyText,
} from "@/lib/daily-text";

export const metadata: Metadata = {
  title: "Текст дня",
};

export const dynamic = "force-dynamic";

export default async function DailyPracticePage() {
  const session = await getServerSession(authOptions);
  const dateKey = getLocalDateKey();
  const daily = await getOrCreateDailyText(dateKey);

  if (!daily) {
    redirect("/texts");
  }

  return (
    <TypingTrainer
      text={daily.text}
      isAuthenticated={Boolean(session)}
      eyebrow={`Текст дня · ${formatDailyDateKey(dateKey)}`}
    />
  );
}
