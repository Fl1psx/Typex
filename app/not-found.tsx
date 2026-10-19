import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl items-center px-4 py-16 md:min-h-[60vh] md:px-6">
      <div className="w-full max-w-lg rounded-lg border border-line bg-surface p-6 md:p-8">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Страница не найдена
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-subtle">
          Возможно, текст удалён, ссылка устарела или в адресе есть ошибка.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/">На главную</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/texts">К текстам</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
