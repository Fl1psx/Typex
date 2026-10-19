import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Проверьте введённые данные",
      },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: parsed.data.bio.length > 0 ? parsed.data.bio : null,
      avatarStyle: parsed.data.avatarStyle,
      settings: JSON.stringify(parsed.data.settings),
    },
    select: {
      username: true,
      bio: true,
      avatarStyle: true,
      settings: true,
    },
  });

  revalidatePath(`/profile/${encodeURIComponent(user.username)}`);
  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return NextResponse.json(user);
}
