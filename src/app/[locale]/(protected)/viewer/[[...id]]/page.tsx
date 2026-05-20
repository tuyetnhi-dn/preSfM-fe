"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { PointCloudViewer } from "@/components/viewer/point-cloud-viewer";
import { viewerService } from "@/services/viewer.service";

export default function ViewerPage() {
  const t = useTranslations("viewer");

  const params = useParams<{ id?: string[] }>();

  const id = params?.id?.[0];

  const defaultPlyUrl = "/viewer/reconstruction.ply";

  const plyUrl = id ? viewerService.getPlyUrl(id) : defaultPlyUrl;

  return (
    <section className="space-y-4">
      <header className="card p-4 sm:p-6">
        <h1 className="text-2xl font-semibold dark:text-slate-100">
          {t("title")}
        </h1>

        <p className="mt-2 text-sm text-steel dark:text-slate-300">
          {t("modelId")}: {id || "Mô hình mặc định"}
        </p>
      </header>

      <PointCloudViewer plyUrl={plyUrl} />
    </section>
  );
}
