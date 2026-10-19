import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Проверьте введённые данные",
      },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
    select: { email: true, username: true },
  });

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.email === email
            ? "Этот email уже зарегистрирован"
            : "Это имя пользователя уже занято",
      },
      { status: 409 },
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email или имя пользователя уже заняты" },
        { status: 409 },
      );
    }

    console.error("Registration failed", error);

    return NextResponse.json(
      { error: "Не удалось создать аккаунт. Попробуйте ещё раз" },
      { status: 500 },
    );
  }
}
