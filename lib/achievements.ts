import { prisma } from "@/lib/prisma";

export const ACHIEVEMENT_DEFINITIONS = [
  {
    code: "first_race",
    name: "Первый заезд",
    description: "Завершите и сохраните свой первый заезд.",
  },
  {
    code: "wpm_60",
    name: "60 WPM",
    description: "Достигните скорости 60 WPM в одном заезде.",
  },
  {
    code: "wpm_100",
    name: "100 WPM",
    description: "Достигните скорости 100 WPM в одном заезде.",
  },
  {
    code: "accuracy_100",
    name: "Заезд без ошибок",
    description: "Завершите заезд со 100% точностью.",
  },
  {
    code: "races_10",
    name: "10 заездов",
    description: "Сохраните результаты десяти заездов.",
  },
  {
    code: "texts_3",
    name: "Создал 3 текста",
    description: "Добавьте в библиотеку три собственных текста.",
  },
] as const;

export type AchievementCode = (typeof ACHIEVEMENT_DEFINITIONS)[number]["code"];

export async function syncAchievements(userId: string) {
  const [results, ownedTexts, existing, achievements] = await Promise.all([
    prisma.result.findMany({
      where: { userId },
      select: { wpm: true, accuracy: true },
    }),
    prisma.text.count({ where: { createdById: userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
    prisma.achievement.findMany({
      select: { id: true, code: true },
    }),
  ]);

  const maxWpm = Math.max(0, ...results.map((result) => result.wpm));
  const earnedCodes = new Set<AchievementCode>();

  if (results.length >= 1) earnedCodes.add("first_race");
  if (maxWpm >= 60) earnedCodes.add("wpm_60");
  if (maxWpm >= 100) earnedCodes.add("wpm_100");
  if (results.some((result) => result.accuracy >= 100)) {
    earnedCodes.add("accuracy_100");
  }
  if (results.length >= 10) earnedCodes.add("races_10");
  if (ownedTexts >= 3) earnedCodes.add("texts_3");

  const existingIds = new Set(existing.map((item) => item.achievementId));
  const newlyUnlocked = achievements.filter(
    (achievement) =>
      earnedCodes.has(achievement.code as AchievementCode) &&
      !existingIds.has(achievement.id),
  );

  if (newlyUnlocked.length > 0) {
    await prisma.$transaction(
      newlyUnlocked.map((achievement) =>
        prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id,
            },
          },
          update: {},
          create: { userId, achievementId: achievement.id },
        }),
      ),
    );
  }

  return newlyUnlocked.map((achievement) => achievement.code);
}
