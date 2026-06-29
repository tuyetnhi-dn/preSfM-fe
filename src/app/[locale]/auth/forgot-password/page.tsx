"use client";

import { useForgotPasswordMutation } from "@/services/auth/auth.service";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.message)) {
      return data.message.join(", ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function ForgotPasswordPage() {
  const locale = useLocale() || "en";
  const t = useTranslations("ForgotPassword");

  const [email, setEmail] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error(t("emailRequired"));
      return;
    }

    try {
      await forgotPassword({
        email: normalizedEmail,
        locale,
      }).unwrap();

      toast.success(t("success"));
    } catch (error) {
      toast.error(getErrorMessage(error, t("failed")));
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <p className="mt-2 text-sm text-slate-500">{t("description")}</p>

      <form onSubmit={submit}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          className="mt-6 w-full rounded-lg border px-3 py-2"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full flex items-center justify-center text-base rounded-lg bg-brand px-4 py-2 text-white disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 items-center animate-spin" />
          ) : (
            t("submitButton")
          )}
        </button>
      </form>
    </main>
  );
}
