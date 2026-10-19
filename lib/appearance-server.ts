import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_APPEARANCE, parseAppearance } from "@/lib/appearance";
import type { Appearance } from "@/lib/appearance";

export async function getUserAppearance(): Promise<{
  appearance: Appearance;
  isAuthenticated: boolean;
}> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { appearance: DEFAULT_APPEARANCE, isAuthenticated: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { settings: true },
  });

  return {
    appearance: parseAppearance(user?.settings),
    isAuthenticated: true,
  };
}
