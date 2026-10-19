import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Помощь",
};

const faq = [
  {
    question: "Как начать печатать?",
    answer:
      "Нажмите «Начать печатать» на главной — откроется заезд со случайным текстом. Можно печатать без регистрации: результат появится сразу после завершения.",
  },
  {
    question: "Как считается скорость и точность?",
    answer:
      "Скорость (WPM) — это количество верно введённых символов в минуту. Точность — доля правильных символов среди всех введённых. Отсчёт времени начинается с первой клавиши.",
  },
  {
    question: "Что такое строгий режим?",
    answer:
      "В строгом режиме при ошибке текст не продвигается вперёд — нужно нажать Backspace и исправить символ. Режим включается в настройках. Там же можно выключить звук ошибки и звук печати.",
  },
  {
    question: "Почему мой результат не сохранился?",
    answer:
      "Результаты сохраняются только у авторизованных пользователей. Гостю после заезда предлагается зарегистрироваться. Вошедший пользователь нажимает «Сохранить результат» на экране результата.",
  },
  {
    question: "Как сменить тему, шрифт и акцент?",
    answer:
      "Откройте «Настройки» в меню профиля. Тема, акцент, шрифт заезда, размер и режимы применяются сразу и сохраняются в аккаунте.",
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Главная", href: "/" },
          { label: "Помощь" },
        ]}
      />

      <header className="border-b border-line pb-6">
        <p className="eyebrow">Справка</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Помощь
        </h1>
        <p className="mt-2 max-w-xl text-sm text-subtle">
          Короткие ответы на частые вопросы о тренажёре.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {faq.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border border-line bg-surface"
          >
            <summary className="cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
              {item.question}
            </summary>
            <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-subtle">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-line bg-surface px-6 py-8 text-center">
        <p className="text-sm text-subtle">
          Готовы проверить скорость печати?
        </p>
        <Button asChild className="mt-5">
          <Link href="/practice">Начать печатать</Link>
        </Button>
      </div>
    </main>
  );
}
