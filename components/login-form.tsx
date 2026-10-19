"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result || result.error) {
        setError("Неверный email или пароль");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Не удалось войти. Попробуйте ещё раз");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-14 md:min-h-[calc(100vh-7rem)]">
      <div>
        <p className="eyebrow">Аккаунт</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Вход
        </h1>
        <p className="mt-2 text-sm text-subtle">
          Продолжите с того места, где остановились.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "login-error" : undefined}
              className={error ? "border-danger" : undefined}
              onChange={() => setError(null)}
            />
            {error ? (
              <p id="login-error" role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-sm text-subtle">
        Нет аккаунта?{" "}
        <Link
          href="/register"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-primary"
        >
          Зарегистрироваться
        </Link>
      </p>
    </main>
  );
}
