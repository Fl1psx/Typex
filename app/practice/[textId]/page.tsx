import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TypingTrainer } from "@/components/typing-trainer";

export const dynamic = "force-dynamic";

type PracticePageProps = {
  params: { textId: string };
};

export default async function PracticePage({ params }: PracticePageProps) {
  const session = await getServerSession(authOptions);

  const text = await prisma.text.findFirst({
    where: {
      id: params.textId,
      OR: session
        ? [{ isPublic: true }, { createdById: session.user.id }]
        : [{ isPublic: true }],
    },
  });

  if (!text) {
    notFound();
  }

  return (
    <TypingTrainer
      text={{
        id: text.id,
        title: text.title,
        author: text.author,
        language: text.language,
        content: text.content,
      }}
      isAuthenticated={Boolean(session)}
    />
  );
}
