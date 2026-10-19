import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAchievements } from "@/lib/achievements";
import { createTextSchema } from "@/lib/validations";
import { normalizeTextContent } from "@/lib/texts";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const raw = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = createTextSchema.safeParse({
    ...raw,
    content:
      typeof raw.content === "string"
        ? normalizeTextContent(raw.content)
        : raw.content,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Проверьте введённые данные",
      },
      { status: 400 },
    );
  }

  const { title, content, language, category, isPublic } = parsed.data;

  const text = await prisma.text.create({
    data: {
      title,
      content,
      language,
      category,
      isPublic,
      author: session.user.username,
      createdById: session.user.id,
    },
    select: {
      id: true,
      title: true,
      language: true,
      category: true,
      isPublic: true,
      createdAt: true,
    },
  });

  await syncAchievements(session.user.id);

  revalidatePath("/texts");
  revalidatePath("/leaderboard");
  revalidatePath(`/profile/${encodeURIComponent(session.user.username)}`);

  return NextResponse.json(text, { status: 201 });
}
