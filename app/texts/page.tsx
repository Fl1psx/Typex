import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  TextsBrowser,
  type TextListItem,
} from "@/components/texts-browser";
import type { TextCategory, TextLanguage } from "@/lib/texts";

export const metadata: Metadata = {
  title: "Тексты",
};

export const dynamic = "force-dynamic";

type TextsPageProps = {
  searchParams: { view?: string };
};

const textSelect = {
  id: true,
  title: true,
  language: true,
  category: true,
  author: true,
  isPublic: true,
  createdById: true,
  content: true,
} as const;

type SelectedText = {
  id: string;
  title: string;
  language: string;
  category: string;
  author: string | null;
  isPublic: boolean;
  createdById: string | null;
  content: string;
};

function toListItem(text: SelectedText): TextListItem {
  return {
    id: text.id,
    title: text.title,
    language: text.language as TextLanguage,
    category: text.category as TextCategory,
    author: text.author,
    isPublic: text.isPublic,
    createdById: text.createdById,
    length: text.content.length,
  };
}

export default async function TextsPage({ searchParams }: TextsPageProps) {
  const session = await getServerSession(authOptions);

  const [publicTexts, myTexts] = await Promise.all([
    prisma.text.findMany({
      where: { isPublic: true },
      orderBy: [{ language: "desc" }, { createdAt: "asc" }],
      select: textSelect,
    }),
    session
      ? prisma.text.findMany({
          where: { createdById: session.user.id },
          orderBy: { createdAt: "desc" },
          select: textSelect,
        })
      : Promise.resolve([] as SelectedText[]),
  ]);

  const initialView =
    searchParams.view === "mine" && session ? "mine" : "all";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Главная", href: "/" },
          { label: "Тексты" },
        ]}
      />
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Библиотека</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Тексты
          </h1>
          <p className="mt-2 max-w-xl text-sm text-subtle">
            Выберите отрывок или создайте свой. Отсчёт начнётся с первого
            введённого символа.
          </p>
        </div>
        <span className="font-mono text-xs text-subtle">
          {publicTexts.length} публичных
        </span>
      </div>

      <div className="mt-6">
        <TextsBrowser
          publicTexts={publicTexts.map(toListItem)}
          myTexts={myTexts.map(toListItem)}
          currentUserId={session?.user.id ?? null}
          initialView={initialView}
        />
      </div>
    </main>
  );
}
