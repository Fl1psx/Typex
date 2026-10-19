import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAchievements } from "@/lib/achievements";
import { resultSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resultSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Некорректные данные результата",
      },
      { status: 400 },
    );
  }

  const { textId, durationSec } = parsed.data;
  const wpm = Math.round(parsed.data.wpm * 10) / 10;
  const accuracy = Math.round(parsed.data.accuracy * 10) / 10;

  const text = await prisma.text.findFirst({
    where: {
      id: textId,
      OR: [{ isPublic: true }, { createdById: session.user.id }],
    },
    select: { id: true },
  });

  if (!text) {
    return NextResponse.json({ error: "Текст не найден" }, { status: 404 });
  }

  const result = await prisma.result.create({
    data: {
      userId: session.user.id,
      textId,
      wpm,
      accuracy,
      durationSec,
    },
    select: {
      id: true,
      wpm: true,
      accuracy: true,
      durationSec: true,
      createdAt: true,
    },
  });

  const unlockedAchievements = await syncAchievements(session.user.id);

  revalidatePath("/leaderboard");
  revalidatePath("/results");
  revalidatePath(`/profile/${encodeURIComponent(session.user.username)}`);

  return NextResponse.json(
    { ...result, unlockedAchievements },
    { status: 201 },
  );
}
