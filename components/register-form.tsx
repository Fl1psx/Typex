"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    let invalid = false;

    if (username.trim().length < 3) {
      setUsernameError("Имя пользователя должно быть не короче 3 символов");
      invalid = true;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      invalid = true;
    }

    if (password.length < 8) {
      setPasswordError("Пароль должен быть не короче 8 символов");
      invalid = true;
    }

    if (invalid) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        const message = data?.error ?? "Не удалось создать аккаунт";

        if (/email/i.test(message)) {
          setEmailError(message);
        } else if (/польз|имен|username/i.test(message)) {
          setUsernameError(message);
        } else {
          setError(message);
        }

        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        router.push("/login");
        return;
      }

      router.push("/texts");
      router.refresh();
    } catch {
      setError("Не удалось создать аккаунт. Попробуйте ещё раз");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-14 md:min-h-[calc(100vh-7rem)]">
      <div>
        <p className="eyebrow">Аккаунт</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Регистрация
        </h1>
        <p className="mt-2 text-sm text-subtle">
          Сохраняйте результаты и следите за прогрессом.
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface p-6">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="typemaster"
              minLength={3}
              maxLength={24}
              required
              autoFocus
              aria-invalid={usernameError ? true : undefined}
              aria-describedby={usernameError ? "username-error" : undefined}
              className={usernameError ? "border-danger" : undefined}
              onChange={() => setUsernameError(null)}
            />
            {usernameError ? (
              <p
                id="username-error"
                role="alert"
                className="text-xs text-danger"
              >
                {usernameError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "email-error" : undefined}
              className={emailError ? "border-danger" : undefined}
              onChange={() => setEmailError(null)}
            />
            {emailError ? (
              <p id="email-error" role="alert" className="text-xs text-danger">
                {emailError}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Минимум 8 символов"
              minLength={8}
              maxLength={72}
              required
              aria-invalid={passwordError ? true : undefined}
              aria-describedby="password-hint"
              className={passwordError ? "border-danger" : undefined}
              onChange={() => setPasswordError(null)}
            />
            {passwordError ? (
              <p role="alert" className="text-xs text-danger">
                {passwordError}
              </p>
            ) : (
              <p id="password-hint" className="text-[11px] text-subtle">
                Требования: не короче 8 символов.
              </p>
            )}
          </div>

          {error ? (
            <p
              role="alert"
              className="rounded-md border border-danger/40 px-3 py-2 text-xs leading-relaxed text-danger"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : null}
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>
      </div>

      <p className="mt-4 text-sm text-subtle">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-primary"
        >
          Войти
        </Link>
      </p>
    </main>
  );
}
