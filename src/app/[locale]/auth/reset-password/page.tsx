"use client";

import { PasswordField } from "@/components/PasswordInput";
import { useResetPasswordMutation } from "@/services/auth/auth.service";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

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

type ResetPasswordErrors = {
  form?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function ResetPasswordForm() {
  const t = useTranslations("auth.ResetPassword");
  const locale = useLocale();

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const validateForm = () => {
    const nextErrors: ResetPasswordErrors = {};

    if (!token) {
      nextErrors.form = t("invalidToken");
    }

    if (!newPassword) {
      nextErrors.newPassword = t("newPasswordRequired");
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = t("passwordMinLength");
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = t("confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = t("passwordMismatch");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword,
      }).unwrap();

      toast.success(t("success"));
      router.push(`/${locale}/auth/login`);
    } catch (error) {
      const message = getErrorMessage(error, t("failed"));

      setErrors({
        form: message,
      });

      toast.error(message);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <p className="mt-2 text-sm text-slate-500">{t("description")}</p>

      {errors.form && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </div>
      )}

      <form onSubmit={submit} className="mt-6">
        <PasswordField
          id="new-password"
          value={newPassword}
          onValueChange={(value) => {
            setNewPassword(value);
            setErrors((current) => ({
              ...current,
              newPassword: undefined,
              form: undefined,
            }));
          }}
          placeholder={t("newPasswordPlaceholder")}
          error={errors.newPassword}
          disabled={isLoading}
          minLength={6}
          autoComplete="new-password"
          containerClassName="mt-3"
        />

        <PasswordField
          id="confirm-password"
          value={confirmPassword}
          onValueChange={(value) => {
            setConfirmPassword(value);
            setErrors((current) => ({
              ...current,
              confirmPassword: undefined,
              form: undefined,
            }));
          }}
          placeholder={t("confirmPasswordPlaceholder")}
          error={errors.confirmPassword}
          disabled={isLoading}
          minLength={6}
          autoComplete="new-password"
          containerClassName="mt-3"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{t("submit")}</span>
        </button>
      </form>
    </main>
  );
}
