"use client";

import { PasswordField } from "@/components/PasswordInput";
import Loader from "@/components/ui/loader";
import { useChangePasswordMutation } from "@/services/auth/auth.service";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

type ChangePasswordErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  form?: string;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      const errorMessage = (data as { error?: unknown }).error;

      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof errorMessage === "string") return errorMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function ChangePasswordPage() {
  const t = useTranslations("auth.changePassword");
  const locale = useLocale();
  const router = useRouter();

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<ChangePasswordErrors>({});

  const validateForm = () => {
    const nextErrors: ChangePasswordErrors = {};

    if (!oldPassword) {
      nextErrors.oldPassword = t("oldPasswordRequired");
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

    if (oldPassword && newPassword && oldPassword === newPassword) {
      nextErrors.newPassword = t("samePassword");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      }).unwrap();

      toast.success(t("success"));

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.push(`/${locale}/profile`);
    } catch (error) {
      const message = getErrorMessage(error, t("failed"));

      setErrors({
        form: message,
      });

      toast.error(message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md p-6">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-semibold dark:text-slate-100">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm text-steel dark:text-slate-300">
          {t("subtitle")}
        </p>

        {errors.form && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.form}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <PasswordField
            id="old-password"
            value={oldPassword}
            onValueChange={(value) => {
              setOldPassword(value);
              setErrors((current) => ({
                ...current,
                oldPassword: undefined,
                form: undefined,
              }));
            }}
            placeholder={t("oldPassword")}
            error={errors.oldPassword}
            required
            autoComplete="current-password"
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            className="rounded-xl bg-white px-4 py-3 pr-11 text-ink focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

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
            placeholder={t("newPassword")}
            error={errors.newPassword}
            required
            minLength={6}
            autoComplete="new-password"
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            className="rounded-xl bg-white px-4 py-3 pr-11 text-ink focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
            placeholder={t("confirmPassword")}
            error={errors.confirmPassword}
            required
            minLength={6}
            autoComplete="new-password"
            showPasswordLabel={t("showPassword")}
            hidePasswordLabel={t("hidePassword")}
            className="rounded-xl bg-white px-4 py-3 pr-11 text-ink focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-center font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              t("submit")
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
