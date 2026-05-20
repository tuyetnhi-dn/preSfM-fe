// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { authApiService } from "@/services/auth/auth.service";
// import { useLocale } from "next-intl";

// export function useAuth() {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const locale = useLocale();

//   const sendOtp = async (email: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       await authApiService.sendOtp(email);
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const registerWithOtp = async (
//     email: string,
//     password: string,
//     otp: string,
//   ) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await authApiService.registerWithOtp(email, password, otp);

//       // Nếu Backend trả về token ngay sau khi đăng ký, lưu lại tại đây
//       if (data?.accessToken) {
//         localStorage.setItem("accessToken", data.accessToken);
//       }

//       // Đăng ký thành công điều hướng về trang đăng nhập
//       router.push(`/${locale}/auth/login`);
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message ||
//           "Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await authApiService.login(email, password);

//       // Lưu Token vào LocalStorage phục vụ các API cần quyền truy cập phía sau
//       if (data?.accessToken) {
//         localStorage.setItem("accessToken", data.accessToken);
//       }

//       // Điều hướng về trang Dashboard chính của ứng dụng
//       router.push(`/${locale}/dashboard`);
//     } catch (err: any) {
//       setError(
//         err.response?.data?.message ||
//           "Tài khoản hoặc mật khẩu không chính xác.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     sendOtp,
//     registerWithOtp,
//     login,
//     loading,
//     error,
//   };
// }
