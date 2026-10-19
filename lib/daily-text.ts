import { prisma } from "@/lib/prisma";

const dailyDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

export function getLocalDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export function formatDailyDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return dailyDateFormatter.format(new Date(year, month - 1, day));
}

function hashCode(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

export async function getOrCreateDailyText(dateKey = getLocalDateKey()) {
  const existing = await prisma.dailyText.findUnique({
    where: { date: dateKey },
    include: {
      text: {
        select: {
          id: true,
          title: true,
          author: true,
          language: true,
          content: true,
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  const texts = await prisma.text.findMany({
    where: { isPublic: true },
    orderBy: { id: "asc" },
    select: { id: true },
  });

  if (texts.length === 0) {
    return null;
  }

  const selected = texts[hashCode(dateKey) % texts.length];

  try {
    return await prisma.dailyText.create({
      data: { date: dateKey, textId: selected.id },
      include: {
        text: {
          select: {
            id: true,
            title: true,
            author: true,
            language: true,
            content: true,
          },
        },
      },
    });
  } catch {
    return prisma.dailyText.findUnique({
      where: { date: dateKey },
      include: {
        text: {
          select: {
            id: true,
            title: true,
            author: true,
            language: true,
            content: true,
          },
        },
      },
    });
  }
}
