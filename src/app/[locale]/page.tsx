import { useLocale } from "next-intl";
import { redirect } from "next/navigation";

export default function DefaultPage() {
  const locale = useLocale();
  redirect(`/${locale}/home`);
}
