import { prisma } from "@/lib/prisma";

export async function getRandomPublicText() {
  const count = await prisma.text.count({ where: { isPublic: true } });

  if (count === 0) {
    return null;
  }

  const skip = Math.floor(Math.random() * count);
  const [text] = await prisma.text.findMany({
    where: { isPublic: true },
    orderBy: { id: "asc" },
    skip,
    take: 1,
    select: {
      id: true,
      title: true,
      author: true,
      language: true,
      content: true,
    },
  });

  return text ?? null;
}
