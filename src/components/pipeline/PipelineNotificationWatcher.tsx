"use client";

import { useEffect } from "react";

import { useGetPipelineRunStatusQuery } from "@/services/video/video.service";
import { usePipelineStore } from "@/store/pipeline-store";
import {
  requestBrowserNotificationPermission,
  sendBrowserNotification,
} from "@/lib/notify";
import { toast } from "sonner";

function PipelinePoller({ pipelineRunId }: { pipelineRunId: string }) {
  const updatePipeline = usePipelineStore((s) => s.updatePipeline);
  const removePipeline = usePipelineStore((s) => s.removePipeline);

  const { data } = useGetPipelineRunStatusQuery(pipelineRunId, {
    skip: !pipelineRunId,
    pollingInterval: 5000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!data) return;

    updatePipeline(pipelineRunId, {
      status: data.status,
      progress: data.progress ?? 0,
      currentStage: data.currentStage ?? "",
    });

    if (data.status === "completed") {
      toast.success("Pipeline xử lý hoàn tất.");

      sendBrowserNotification(
        "PreSfM xử lý xong",
        "Pipeline xử lý video đã hoàn thành. Bạn có thể vào dự án để xem kết quả.",
      );

      setTimeout(() => {
        removePipeline(pipelineRunId);
      }, 10000);
    }

    if (data.status === "failed") {
      toast.error("Pipeline xử lý thất bại.");

      sendBrowserNotification(
        "PreSfM xử lý thất bại",
        data.errorMessage ?? "Pipeline xử lý video gặp lỗi.",
      );

      setTimeout(() => {
        removePipeline(pipelineRunId);
      }, 10000);
    }
  }, [data, pipelineRunId, updatePipeline, removePipeline]);

  return null;
}

export function PipelineNotificationWatcher() {
  const pipelines = usePipelineStore((s) => s.pipelines);

  useEffect(() => {
    requestBrowserNotificationPermission();
  }, []);

  return (
    <>
      {pipelines
        .filter(
          (item) => item.status === "pending" || item.status === "running",
        )
        .map((item) => (
          <PipelinePoller
            key={item.pipelineRunId}
            pipelineRunId={item.pipelineRunId}
          />
        ))}
    </>
  );
}
