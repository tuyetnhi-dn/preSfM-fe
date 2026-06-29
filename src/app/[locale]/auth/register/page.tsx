"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import {
  useRegisterWithOtpMutation,
  useSendOtpMutation,
} from "@/services/auth/auth.service";
import { Loader2 } from "lucide-react";

function getErrorMessage(error: unknown): string {
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

  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
  const [registerWithOtp, { isLoading: isRegistering }] =
    useRegisterWithOtpMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const loading = isSendingOtp || isRegistering;

  const onSendOtp = async () => {
    setRegisterError("");

    try {
      await sendOtp({ email }).unwrap();
      setOtpSent(true);
    } catch (error) {
      setRegisterError(getErrorMessage(error));
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setRegisterError("");

    try {
      const res = await registerWithOtp({
        email,
        password,
        otp,
      }).unwrap();

      if (res.accessToken) {
        localStorage.setItem("accessToken", res.accessToken);
      }

      if (res.refreshToken) {
        localStorage.setItem("refreshToken", res.refreshToken);
      }

      if (res.accessToken) {
        router.push(`/${locale}/dashboard`);
      } else {
        router.push(`/${locale}/auth/login`);
      }
    } catch (error) {
      setRegisterError(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto w-full max-w-md card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold dark:text-slate-100">
        {t("registerTitle")}
      </h1>

      <p className="mt-2 text-sm text-steel dark:text-slate-300">
        {t("registerSubtitle")}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("password")}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        <div className="flex gap-3">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder={t("otpCode")}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />

          <button
            type="button"
            disabled={isSendingOtp || !email}
            onClick={onSendOtp}
            className="rounded-xl text-nowrap bg-brand dark:bg-brand px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {otpSent ? t("resend") : t("sendOtp")}
          </button>
        </div>

        {registerError ? (
          <p className="text-sm text-red-600">{registerError}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !otp}
          className="w-full flex items-center justify-center rounded-xl bg-brand dark:bg-brand px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {isRegistering ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            t("register")
          )}
        </button>
      </form>

      <p className="mt-4 text-sm text-steel dark:text-slate-300">
        {t("alreadyHaveAccount")}{" "}
        <Link href={`/${locale}/auth/login`} className="font-medium text-ocean">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
