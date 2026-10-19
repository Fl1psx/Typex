import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedText = {
  id: string;
  title: string;
  content: string;
  language: "ru" | "en";
  category: "books" | "quotes" | "code";
  author: string;
};

const texts: SeedText[] = [
  {
    id: "text-ru-pushkin",
    title: "Евгений Онегин",
    author: "Александр Пушкин",
    language: "ru",
    category: "books",
    content:
      "Мой дядя самых честных правил, когда не в шутку занемог, он уважать себя заставил и лучше выдумать не мог. Его пример другим наука; но, боже мой, какая скука с больным сидеть и день и ночь, не отходя ни шагу прочь!",
  },
  {
    id: "text-ru-tolstoy",
    title: "Война и мир",
    author: "Лев Толстой",
    language: "ru",
    category: "books",
    content:
      "Ну, князь, Генуя и Лукка стали не больше как поместьями фамилии Бонапарте. Нет, я предупреждаю вас, что вы скоро меня не убедите, что вы не в состоянии понять всю глубину моего уважения и преданности к вам.",
  },
  {
    id: "text-ru-dostoevsky",
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    language: "ru",
    category: "books",
    content:
      "В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, и медленно, как бы в нерешимости, отправился к К-ну мосту.",
  },
  {
    id: "text-ru-chekhov",
    title: "Человек в футляре",
    author: "Антон Чехов",
    language: "ru",
    category: "books",
    content:
      "Учитель греческого языка, Беликов, был человек замечательный. Он был невысокого роста, сутуловат, с желтым лицом и всегда носил темные очки, фуфайку и калоши. И зонтик у него был в чехле, и часы в чехле из серой замши.",
  },
  {
    id: "text-ru-gogol",
    title: "Мёртвые души",
    author: "Николай Гоголь",
    language: "ru",
    category: "books",
    content:
      "В ворота гостиницы губернского города въехала довольно красивая рессорная небольшая бричка, в какой ездят холостяки: отставные подполковники, штабс-капитаны, помещики, имеющие около сотни душ крестьян.",
  },
  {
    id: "text-en-austen",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    language: "en",
    category: "books",
    content:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.",
  },
  {
    id: "text-en-melville",
    title: "Moby Dick",
    author: "Herman Melville",
    language: "en",
    category: "books",
    content:
      "Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
  },
  {
    id: "text-en-dickens",
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    language: "en",
    category: "books",
    content:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.",
  },
  {
    id: "text-en-carroll",
    title: "Alice in Wonderland",
    author: "Lewis Carroll",
    language: "en",
    category: "books",
    content:
      "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, and what is the use of a book, thought Alice, without pictures or conversations?",
  },
  {
    id: "text-en-doyle",
    title: "A Scandal in Bohemia",
    author: "Arthur Conan Doyle",
    language: "en",
    category: "books",
    content:
      "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler.",
  },
  {
    id: "text-ru-lermontov",
    title: "Герой нашего времени",
    author: "Михаил Лермонтов",
    language: "ru",
    category: "books",
    content:
      "Я был готов любить весь мир, меня никто не понял: и я выучился ненавидеть. Я говорил правду, мне не верили: я начал обманывать. Я стал читать, учиться, но науки мне надоели, и я увидел, что они не дают счастья.",
  },
  {
    id: "text-ru-goncharov",
    title: "Обломов",
    author: "Иван Гончаров",
    language: "ru",
    category: "books",
    content:
      "Жизнь его была похожа на тихую реку: он лежал на диване, смотрел на пыль, танцующую в солнечном луче, и думал, что всякая деятельность есть суета, а покой — высшее благо человека.",
  },
  {
    id: "text-ru-turgenev",
    title: "Отцы и дети",
    author: "Иван Тургенев",
    language: "ru",
    category: "books",
    content:
      "Что такое Базаров? Аркадий усмехнулся. Нигилист, — отвечал он. Нигилист — это человек, который не склоняется ни перед какими авторитетами, который не принимает ни одного принципа на веру, каким бы уважением ни был окружён этот принцип.",
  },
  {
    id: "text-en-fitzgerald",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    language: "en",
    category: "books",
    content:
      "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing any one, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
  },
  {
    id: "text-en-shelley",
    title: "Frankenstein",
    author: "Mary Shelley",
    language: "en",
    category: "books",
    content:
      "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.",
  },
  {
    id: "text-en-wells",
    title: "The Time Machine",
    author: "H. G. Wells",
    language: "en",
    category: "books",
    content:
      "The Time Traveller, for so it will be convenient to speak of him, was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated by the warmth of the discussion.",
  },
  {
    id: "text-ru-quote-chekhov",
    title: "О человеке",
    author: "Антон Чехов",
    language: "ru",
    category: "quotes",
    content:
      "В человеке должно быть всё прекрасно: и лицо, и одежда, и душа, и мысли. Часто я вижу прекрасное лицо и такую одежду, что кружится голова от восторга, но душа и мысли бог знает какие.",
  },
  {
    id: "text-ru-quote-pushkin",
    title: "О слоге",
    author: "Александр Пушкин",
    language: "ru",
    category: "quotes",
    content:
      "Точность и краткость — вот первые достоинства прозы. Она требует мыслей и мыслей — без них блестящие выражения ни к чему не служат.",
  },
  {
    id: "text-ru-quote-tolstoy",
    title: "О движении",
    author: "Лев Толстой",
    language: "ru",
    category: "quotes",
    content:
      "Все хотят изменить мир, но никто не хочет измениться сам. Начните с себя, и мир вокруг станет иным. В этом нет чуда, но есть работа, которой нельзя избежать.",
  },
  {
    id: "text-ru-quote-stolypin",
    title: "О России",
    author: "Пётр Столыпин",
    language: "ru",
    category: "quotes",
    content:
      "Вам нужны великие потрясения, нам нужна великая Россия. У каждой эпохи свои задачи, и решать их нужно спокойно, твёрдо и с верой в будущее.",
  },
  {
    id: "text-en-quote-thoreau",
    title: "On Simplicity",
    author: "Henry David Thoreau",
    language: "en",
    category: "quotes",
    content:
      "Simplicity, simplicity, simplicity! I say, let your affairs be as two or three, and not a hundred or a thousand; instead of a million count half a dozen, and keep your accounts on your thumb nail.",
  },
  {
    id: "text-en-quote-emerson",
    title: "On Courage",
    author: "Ralph Waldo Emerson",
    language: "en",
    category: "quotes",
    content:
      "Whatever you do, you need courage. Whatever course you decide upon, there is always someone to tell you that you are wrong. There are always difficulties arising which tempt you to believe that your critics are right.",
  },
  {
    id: "text-en-quote-aurelius",
    title: "On the Mind",
    author: "Marcus Aurelius",
    language: "en",
    category: "quotes",
    content:
      "You have power over your mind, not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts.",
  },
  {
    id: "text-en-quote-shakespeare",
    title: "On Thinking",
    author: "William Shakespeare",
    language: "en",
    category: "quotes",
    content:
      "There is nothing either good or bad, but thinking makes it so. To me it is a prison. Why, then, your ambition makes it one; it is too narrow for your mind.",
  },
  {
    id: "text-ru-code-typescript",
    title: "TypeScript: тип пользователя",
    author: "Typex",
    language: "ru",
    category: "code",
    content:
      '// Описание профиля\ntype User = { id: string; name: string; age?: number };\nconst user: User = { id: "u_1", name: "Анна" };\nfunction greet({ name }: User): string {\n  return `Привет, ${name}!`;\n}',
  },
  {
    id: "text-ru-code-sql",
    title: "SQL: последние заезды",
    author: "Typex",
    language: "ru",
    category: "code",
    content:
      "-- Последние заезды\nSELECT u.username, r.wpm, r.accuracy\nFROM Result r\nJOIN User u ON u.id = r.userId\nORDER BY r.createdAt DESC\nLIMIT 10;",
  },
  {
    id: "text-ru-code-css",
    title: "CSS: карточка",
    author: "Typex",
    language: "ru",
    category: "code",
    content:
      "/* Карточка текста */\n.card {\n  background: #181B21;\n  border: 1px solid #2A2F3A;\n  padding: 20px;\n  border-radius: 6px;\n}",
  },
  {
    id: "text-en-code-debounce",
    title: "JavaScript: debounce",
    author: "Typex",
    language: "en",
    category: "code",
    content:
      "function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
  },
  {
    id: "text-en-code-fibonacci",
    title: "Python: fibonacci",
    author: "Typex",
    language: "en",
    category: "code",
    content:
      "def fib(n: int) -> int:\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint([fib(i) for i in range(10)])",
  },
  {
    id: "text-en-code-bash",
    title: "Bash: проверка сборки",
    author: "Typex",
    language: "en",
    category: "code",
    content:
      '#!/usr/bin/env bash\nset -euo pipefail\n\nnpm run typecheck\nnpm run build\necho "Build passed"',
  },
];

const achievements = [
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
];

const testUsers = [
  {
    username: "user1",
    email: "user1@typex.local",
    bio: "Тестовый аккаунт для проверки лидерборда.",
    avatarStyle: "bottts",
    settings: {
      theme: "dark",
      accent: "lime",
      raceFont: "jetbrains",
      raceFontSize: 20,
      strictMode: true,
      errorSound: true,
      typingSound: true,
    },
  },
  {
    username: "user2",
    email: "user2@typex.local",
    bio: "Люблю длинные тексты и светлую тему.",
    avatarStyle: "initials",
    settings: {
      theme: "light",
      accent: "amber",
      raceFont: "plex",
      raceFontSize: 18,
      strictMode: false,
      errorSound: true,
      typingSound: false,
    },
  },
  {
    username: "user3",
    email: "user3@typex.local",
    bio: "Код, цифры и немного классики.",
    avatarStyle: "thumbs",
    settings: {
      theme: "dark",
      accent: "sky",
      raceFont: "fira",
      raceFontSize: 24,
      strictMode: true,
      errorSound: true,
      typingSound: true,
    },
  },
];

type SeedResult = {
  id: string;
  username: string;
  textId: string;
  wpm: number;
  accuracy: number;
  daysAgo: number;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getLocalDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-");
}

function hashCode(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

const seedResults: SeedResult[] = [
  { id: "seed-result-u1-01", username: "user1", textId: "text-ru-pushkin", wpm: 156.1, accuracy: 98.1, daysAgo: 1 },
  { id: "seed-result-u1-02", username: "user1", textId: "text-en-austen", wpm: 151, accuracy: 99.2, daysAgo: 2 },
  { id: "seed-result-u1-03", username: "user1", textId: "text-ru-code-typescript", wpm: 147.3, accuracy: 97.4, daysAgo: 3 },
  { id: "seed-result-u1-04", username: "user1", textId: "text-en-fitzgerald", wpm: 142.5, accuracy: 100, daysAgo: 4 },
  { id: "seed-result-u1-05", username: "user1", textId: "text-ru-tolstoy", wpm: 138.2, accuracy: 98.8, daysAgo: 5 },
  { id: "seed-result-u1-06", username: "user1", textId: "text-en-code-debounce", wpm: 132.8, accuracy: 96.9, daysAgo: 6 },
  { id: "seed-result-u1-07", username: "user1", textId: "text-ru-quote-chekhov", wpm: 126.4, accuracy: 98.3, daysAgo: 7 },
  { id: "seed-result-u1-08", username: "user1", textId: "text-en-dickens", wpm: 121.6, accuracy: 97.1, daysAgo: 8 },
  { id: "seed-result-u1-09", username: "user1", textId: "text-ru-gogol", wpm: 118.3, accuracy: 99.6, daysAgo: 9 },
  { id: "seed-result-u1-10", username: "user1", textId: "text-en-code-fibonacci", wpm: 112.9, accuracy: 98.4, daysAgo: 10 },
  { id: "seed-result-u2-01", username: "user2", textId: "text-en-melville", wpm: 129.4, accuracy: 97.8, daysAgo: 1 },
  { id: "seed-result-u2-02", username: "user2", textId: "text-ru-dostoevsky", wpm: 118.7, accuracy: 99.1, daysAgo: 2 },
  { id: "seed-result-u2-03", username: "user2", textId: "text-en-quote-thoreau", wpm: 112.3, accuracy: 98.2, daysAgo: 4 },
  { id: "seed-result-u2-04", username: "user2", textId: "text-ru-lermontov", wpm: 105.4, accuracy: 100, daysAgo: 6 },
  { id: "seed-result-u2-05", username: "user2", textId: "text-en-shelley", wpm: 98.7, accuracy: 96.4, daysAgo: 8 },
  { id: "seed-result-u2-06", username: "user2", textId: "text-ru-quote-pushkin", wpm: 92.1, accuracy: 98.9, daysAgo: 10 },
  { id: "seed-result-u2-07", username: "user2", textId: "text-en-code-bash", wpm: 86.5, accuracy: 97.2, daysAgo: 12 },
  { id: "seed-result-u3-01", username: "user3", textId: "text-ru-chekhov", wpm: 94.2, accuracy: 96.7, daysAgo: 1 },
  { id: "seed-result-u3-02", username: "user3", textId: "text-en-carroll", wpm: 88.7, accuracy: 98.4, daysAgo: 3 },
  { id: "seed-result-u3-03", username: "user3", textId: "text-ru-quote-stolypin", wpm: 80.1, accuracy: 97.5, daysAgo: 5 },
  { id: "seed-result-u3-04", username: "user3", textId: "text-en-wells", wpm: 74.5, accuracy: 99.3, daysAgo: 7 },
  { id: "seed-result-u3-05", username: "user3", textId: "text-ru-code-sql", wpm: 68.8, accuracy: 98.1, daysAgo: 9 },
];

async function main() {
  for (const text of texts) {
    const { id, ...data } = text;

    await prisma.text.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const userIds = new Map<string, string>();

  for (const user of testUsers) {
    const saved = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        passwordHash,
        bio: user.bio,
        avatarStyle: user.avatarStyle,
        settings: JSON.stringify(user.settings),
      },
      create: {
        username: user.username,
        email: user.email,
        passwordHash,
        bio: user.bio,
        avatarStyle: user.avatarStyle,
        settings: JSON.stringify(user.settings),
      },
      select: { id: true, username: true },
    });

    userIds.set(saved.username, saved.id);
  }

  const textContent = new Map(texts.map((text) => [text.id, text.content]));

  for (const result of seedResults) {
    const userId = userIds.get(result.username);
    const content = textContent.get(result.textId);

    if (!userId || content === undefined) {
      throw new Error(`Invalid seed result ${result.id}`);
    }

    const durationSec = Math.max(
      1,
      Math.round((content.length / 5 / result.wpm) * 60),
    );
    const createdAt = new Date(
      Date.now() - result.daysAgo * 24 * 60 * 60 * 1000,
    );
    const data = {
      userId,
      textId: result.textId,
      wpm: result.wpm,
      accuracy: result.accuracy,
      durationSec,
      createdAt,
    };

    await prisma.result.upsert({
      where: { id: result.id },
      update: data,
      create: { id: result.id, ...data },
    });
  }

  const dateKey = getLocalDateKey();
  const publicTextIds = texts.map((text) => text.id).sort();
  const selectedDailyTextId =
    publicTextIds[hashCode(dateKey) % publicTextIds.length];

  const daily = await prisma.dailyText.upsert({
    where: { date: dateKey },
    update: {},
    create: { date: dateKey, textId: selectedDailyTextId },
    select: { textId: true },
  });

  const dailyUserId = userIds.get("user3");
  const dailyContent = textContent.get(daily.textId);

  if (dailyUserId && dailyContent !== undefined) {
    const dailyWpm = 82.4;
    const durationSec = Math.max(
      1,
      Math.round((dailyContent.length / 5 / dailyWpm) * 60),
    );

    await prisma.result.deleteMany({
      where: { id: { startsWith: "seed-daily-result-" } },
    });
    await prisma.result.create({
      data: {
        id: `seed-daily-result-${dateKey}`,
        userId: dailyUserId,
        textId: daily.textId,
        wpm: dailyWpm,
        accuracy: 98.8,
        durationSec,
        createdAt: new Date(),
      },
    });
  }

  const allAchievements = await prisma.achievement.findMany({
    select: { id: true, code: true },
  });
  const achievementIds = new Map(
    allAchievements.map((achievement) => [achievement.code, achievement.id]),
  );

  for (const user of testUsers) {
    const userId = userIds.get(user.username);

    if (!userId) {
      continue;
    }

    const [results, ownedTexts] = await Promise.all([
      prisma.result.findMany({
        where: { userId },
        select: { wpm: true, accuracy: true },
      }),
      prisma.text.count({ where: { createdById: userId } }),
    ]);
    const maxWpm = Math.max(0, ...results.map((result) => result.wpm));
    const codes = new Set<string>();

    if (results.length >= 1) codes.add("first_race");
    if (maxWpm >= 60) codes.add("wpm_60");
    if (maxWpm >= 100) codes.add("wpm_100");
    if (results.some((result) => result.accuracy >= 100)) {
      codes.add("accuracy_100");
    }
    if (results.length >= 10) codes.add("races_10");
    if (ownedTexts >= 3) codes.add("texts_3");

    for (const code of codes) {
      const achievementId = achievementIds.get(code);

      if (!achievementId) {
        continue;
      }

      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId },
        },
        update: {},
        create: { userId, achievementId },
      });
    }
  }

  console.log(
    `Seeded ${texts.length} texts, ${achievements.length} achievements, ${testUsers.length} test users, ${seedResults.length} historical results and today's daily leaderboard result.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
