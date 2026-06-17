"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      toast.error("Vui lòng nhập email.");
      return;
    }

    try {
      setLoading(true);
      const locale = useLocale() || "en";

      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          locale: locale,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      toast.success("Link đặt lại mật khẩu đã được gửi tới email.");
    } catch {
      toast.error("Không thể gửi email đặt lại mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Quên mật khẩu</h1>

      <p className="mt-2 text-sm text-slate-500">
        Nhập email để nhận link đặt lại mật khẩu.
      </p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="mt-6 w-full rounded-lg border px-3 py-2"
      />

      <button
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-brand px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </button>
    </main>
  );
}
