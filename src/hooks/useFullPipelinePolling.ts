"use client";

import { useEffect, useRef } from "react";
import { useGetPipelineRunStatusQuery } from "@/services/video/video.service";

type Props = {
  pipelineRunId: string;
  enabled: boolean;
  onStatusChange?: (data: any) => void;
  onCompleted?: (data: any) => void;
  onFailed?: (data: any) => void;
};

export function useFullPipelinePolling({
  pipelineRunId,
  enabled,
  onStatusChange,
  onCompleted,
  onFailed,
}: Props) {
  const completedRef = useRef(false);

  const { data } = useGetPipelineRunStatusQuery(pipelineRunId, {
    skip: !enabled || !pipelineRunId,
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!data || completedRef.current) return;

    onStatusChange?.(data);

    if (data.status === "completed") {
      completedRef.current = true;
      onCompleted?.(data);
    }

    if (data.status === "failed") {
      completedRef.current = true;
      onFailed?.(data);
    }
  }, [data, onStatusChange, onCompleted, onFailed]);
}
