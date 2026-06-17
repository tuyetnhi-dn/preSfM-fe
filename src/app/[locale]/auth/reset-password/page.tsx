"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const locale = params.locale as string;
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    console.log("SUBMIT CLICKED", { token });

    if (!token) {
      toast.error("Token không hợp lệ.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "Không thể đặt lại mật khẩu.");
      }

      toast.success("Đặt lại mật khẩu thành công.");
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể đặt lại mật khẩu. Token có thể đã hết hạn.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>

      <p className="mt-2 text-sm text-slate-500">
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <input
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        placeholder="Mật khẩu mới"
        className="mt-6 w-full rounded-lg border px-3 py-2"
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        placeholder="Nhập lại mật khẩu mới"
        className="mt-3 w-full rounded-lg border px-3 py-2"
      />

      <button
        type="button"
        onClick={submit}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-brand px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
      </button>
    </main>
  );
}
