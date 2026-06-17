"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { getCurrentUser, isAuthenticated } from "@/lib/auth-storage";

type ProfileForm = {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  status?: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    id: "",
    email: "",
    fullName: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setForm({
      id: currentUser.id ?? "",
      email: currentUser.email ?? "",
      fullName: currentUser.fullName ?? "",
      role: currentUser.role ?? "",
      status: currentUser.status ?? "",
    });

    setAuthChecked(true);
  }, [router]);

  const handleSave = () => {
    toast("Chức năng cập nhật hồ sơ cần API từ BE.");
  };

  if (!authChecked) {
    return (
      <section className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-slate-500">Đang tải thông tin cá nhân...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink dark:text-slate-100">
          Thông tin cá nhân
        </h1>

        <p className="mt-2 text-sm text-steel dark:text-slate-300">
          Quản lý thông tin tài khoản và trạng thái người dùng.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
              User ID
            </label>
            <input
              value={form.id}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
              Email
            </label>
            <input
              value={form.email}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
              Họ và tên
            </label>
            <input
              value={form.fullName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  fullName: event.target.value,
                }))
              }
              placeholder="Nhập họ và tên"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                Vai trò
              </label>
              <input
                value={form.role || "user"}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
                Trạng thái
              </label>
              <input
                value={form.status || "active"}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
