import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TypingTrainer } from "@/components/typing-trainer";
import { getRandomPublicText } from "@/lib/practice";

export const metadata: Metadata = {
  title: "Заезд",
};

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const session = await getServerSession(authOptions);
  const text = await getRandomPublicText();

  if (!text) {
    redirect("/texts");
  }

  return <TypingTrainer text={text} isAuthenticated={Boolean(session)} />;
}
