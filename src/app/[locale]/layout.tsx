import { NextIntlClientProvider } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import StoreProvider from "@/providers/StoreProvider";
import { PipelineNotificationWatcher } from "@/components/pipeline/PipelineNotificationWatcher";
import { RoleBasedShell } from "@/components/layout/RoleBasedShell";

const locales = ["en", "vi"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) {
    notFound();
  }

  unstable_setRequestLocale(locale);

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <main className="mx-auto w-full max-w-7xl">
        <StoreProvider>
          <PipelineNotificationWatcher />
          <RoleBasedShell>{children}</RoleBasedShell>
        </StoreProvider>
      </main>
    </NextIntlClientProvider>
  );
}
