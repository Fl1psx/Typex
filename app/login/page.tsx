import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Вход",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: { callbackUrl?: string };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/texts");
  }

  const callbackUrl =
    typeof searchParams.callbackUrl === "string" &&
    searchParams.callbackUrl.startsWith("/")
      ? searchParams.callbackUrl
      : "/texts";

  return <LoginForm callbackUrl={callbackUrl} />;
}
