"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type Stats = { total: number; active: number; locked: number };
type User = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Giả định bạn lưu token ở localStorage. Chỉnh sửa nếu bạn dùng Cookie/Zustand
  const getToken = () => localStorage.getItem("accessToken");

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) throw new Error("Unauthorized");

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers }),
        fetch(`${API_BASE_URL}/admin/users?limit=20`, { headers }), // Lấy tạm 20 users
      ]);

      if (!statsRes.ok || !usersRes.ok) throw new Error("Failed to fetch");

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      setStats(statsData);
      setUsers(usersData.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu. Bạn có phải là Admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (userId: string) => {
    try {
      const token = getToken();
      const res = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Lỗi cập nhật");

      const data = await res.json();
      toast.success(data.message);

      // Cập nhật UI trực tiếp thay vì reload data
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: data.newStatus } : u,
        ),
      );
      // Gọi lại stats để cập nhật số lượng
      fetchData();
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái tài khoản");
    }
  };

  if (loading)
    return <div className="p-6 text-center">Đang tải dữ liệu...</div>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        Bảng điều khiển Admin
      </h1>

      {/* Thống kê */}
      {stats && (
        <div className="mb-8 grid grid-cols-3 gap-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Tổng người dùng
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">
              Đang hoạt động
            </h3>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {stats.active}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Đã khóa</h3>
            <p className="mt-2 text-3xl font-bold text-rose-600">
              {stats.locked}
            </p>
          </div>
        </div>
      )}

      {/* Danh sách User */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Họ Tên</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Vai trò</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
              <th className="px-6 py-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {user.full_name || "Chưa cập nhật"}
                </td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 uppercase text-xs">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => toggleStatus(user.id)}
                      className={`rounded px-4 py-2 text-xs font-semibold text-white transition-colors ${
                        user.status === "active"
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
                      }`}
                    >
                      {user.status === "active" ? "Khóa" : "Mở khóa"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Không có dữ liệu người dùng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
