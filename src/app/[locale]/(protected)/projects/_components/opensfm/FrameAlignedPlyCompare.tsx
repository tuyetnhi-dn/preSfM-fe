"use client";

import { useEffect, useMemo, useState } from "react";
import { PointCloudViewer } from "@/components/viewer/point-cloud-viewer";
import { useGetProjectPlyViewerAssetsQuery } from "@/services/project/project.service";
import { EyeIcon } from "lucide-react";

type Props = {
  projectId: string;
};

type ViewpointLike = {
  position?: number[] | null;
  target?: number[] | null;
  up?: number[] | null;
  fov?: number | null;
};

type PointCloudViewpoint = {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  fov?: number | null;
};
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/$/, "");

function normalizeApiUrl(url?: string | null) {
  if (!url) return "";

  return url
    .replace("http://localhost:8000/api", API_BASE_URL)
    .replace("http://127.0.0.1:8000/api", API_BASE_URL);
}

function formatTime(timestampMs?: number | null) {
  if (timestampMs === null || timestampMs === undefined) return "--:--";

  const totalSeconds = timestampMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${seconds
    .toFixed(2)
    .padStart(5, "0")}`;
}

function toTuple3(value?: number[] | null): [number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 3) return null;

  const [x, y, z] = value.map(Number);

  if (![x, y, z].every(Number.isFinite)) return null;

  return [x, y, z];
}

function normalizeViewpoint(
  viewpoint?: ViewpointLike | null,
): PointCloudViewpoint | undefined {
  if (!viewpoint) return undefined;

  const position = toTuple3(viewpoint.position);
  const target = toTuple3(viewpoint.target);
  const up = toTuple3(viewpoint.up);

  if (!position || !target || !up) return undefined;

  return {
    position,
    target,
    up,
    fov:
      viewpoint.fov !== null &&
      viewpoint.fov !== undefined &&
      Number.isFinite(Number(viewpoint.fov))
        ? Number(viewpoint.fov)
        : undefined,
  };
}

function vectorKey(value?: [number, number, number] | null) {
  if (!value?.length) return "null";

  return value.map((item) => Number(item).toFixed(6)).join(",");
}

function buildViewpointKey(input: {
  prefix: string;
  frameId?: string | null;
  frameIndex: number;
  viewpoint?: PointCloudViewpoint | null;
}) {
  const viewpoint = input.viewpoint;

  return [
    input.prefix,
    input.frameId ?? input.frameIndex,
    vectorKey(viewpoint?.position),
    vectorKey(viewpoint?.target),
    vectorKey(viewpoint?.up),
  ].join("|");
}

export function FrameAlignedPlyCompare({ projectId }: Props) {
  const { data, isLoading, error } = useGetProjectPlyViewerAssetsQuery(
    projectId,
    {
      skip: !projectId,
      refetchOnMountOrArgChange: true,
    },
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const frames = data?.frames ?? [];
  const selectedFrame = frames[selectedIndex] ?? null;

  const rawViewpoint = useMemo(
    () => normalizeViewpoint(selectedFrame?.rawViewpoint),
    [selectedFrame?.rawViewpoint],
  );

  const processedViewpoint = useMemo(
    () => normalizeViewpoint(selectedFrame?.processedViewpoint),
    [selectedFrame?.processedViewpoint],
  );

  useEffect(() => {
    if (!frames.length) {
      setSelectedIndex(0);
      return;
    }

    if (selectedIndex >= frames.length) {
      setSelectedIndex(frames.length - 1);
    }
  }, [frames.length, selectedIndex]);

  const selectedTime = useMemo(
    () => formatTime(selectedFrame?.timestampMs),
    [selectedFrame?.timestampMs],
  );

  const hasPointCloud =
    Boolean(data?.pointClouds.rawPlyUrl) ||
    Boolean(data?.pointClouds.processedPlyUrl);

  const rawViewpointKey = useMemo(
    () =>
      buildViewpointKey({
        prefix: "raw",
        frameId: selectedFrame?.frameId,
        frameIndex: selectedIndex,
        viewpoint: rawViewpoint,
      }),
    [rawViewpoint, selectedFrame?.frameId, selectedIndex],
  );

  const processedViewpointKey = useMemo(
    () =>
      buildViewpointKey({
        prefix: "processed",
        frameId: selectedFrame?.frameId,
        frameIndex: selectedIndex,
        viewpoint: processedViewpoint,
      }),
    [processedViewpoint, selectedFrame?.frameId, selectedIndex],
  );

  const previewImageUrl =
    selectedFrame?.rawImageUrl ??
    selectedFrame?.processedImageUrl ??
    selectedFrame?.maskUrl ??
    null;

  const previewLabel = selectedFrame?.rawImageUrl
    ? "Raw frame"
    : selectedFrame?.processedImageUrl
      ? "Processed frame"
      : selectedFrame?.maskUrl
        ? "Mask frame"
        : "No image";

  const frameStats = data?.frameStats;

  function selectFrame(index: number) {
    if (!frames.length) return;

    const nextIndex = Math.max(0, Math.min(index, frames.length - 1));
    setSelectedIndex(nextIndex);
  }

  if (isLoading) {
    return (
      <div className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Đang tải dữ liệu so sánh PLY theo khung hình...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
        Không thể tải dữ liệu so sánh PLY theo khung hình.
      </div>
    );
  }

  if (!hasPointCloud || !frames.length) {
    return null;
  }

  return (
    <section className="mt-4 w-full max-w-full overflow-hidden px-4 lg:px-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2">
          {frameStats ? (
            <div className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:block">
              Synced: {frameStats.syncedFrames}/{frameStats.totalSelectedFrames}
            </div>
          ) : null}

          <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {selectedIndex + 1} / {frames.length}
          </div>
        </div>
      </div>

      <div className="grid w-full gap-3 overflow-hidden xl:h-[calc(100vh-190px)] xl:min-h-[500px] xl:grid-cols-2 xl:grid-rows-[80px_180px_minmax(0,1fr)]">
        {/* 1. Frame control */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 px-3 pt-3 dark:border-slate-700 xl:col-start-1 xl:row-start-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {selectedFrame?.frameName ?? "No frame"}
              </span>

              <span className="ml-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Time: {selectedTime}
              </span>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(frames.length - 1, 0)}
            value={selectedIndex}
            onChange={(event) => selectFrame(Number(event.target.value))}
            className="w-full"
          />

          <div className="mt-0 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>1</span>
            <span>{frames.length}</span>
          </div>
        </div>

        {/* 2. Frame list */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-border-base dark:border-border-base xl:col-start-1 xl:row-start-2">
          <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-border-base dark:text-slate-200">
            Frame
          </div>

          <div className="h-full overflow-y-auto">
            {frames.map((frame, index) => {
              const isActive = index === selectedIndex;

              return (
                <button
                  key={frame.frameId ?? `${frame.frameIndex}-${index}`}
                  type="button"
                  onClick={() => selectFrame(index)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-2 border-b border-border-base px-3 py-1.5 text-left text-xs last:border-b-0 dark:border-border-base ${
                    isActive
                      ? "bg-bg-hover dark:bg-bg-hover/80"
                      : "bg-bg-base hover:bg-bg-base/25 dark:bg-bg-base dark:hover:bg-bg-base/25"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                      {frame.frameName}
                    </span>

                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {formatTime(frame.timestampMs)}
                    </span>
                  </span>

                  <span
                    className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                      isActive
                        ? "bg-brand text-white"
                        : "bg-bg-base text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <EyeIcon className="inline h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Frame preview */}
        <div className="min-w-0 overflow-hidden rounded-xl  p-2  xl:col-start-2 xl:row-start-1 xl:row-span-2">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="Selected frame"
              className="h-[calc(100%-24px)] w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-[calc(100%-24px)] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 dark:bg-slate-800">
              No image
            </div>
          )}
        </div>

        {/* 4. Raw PLY */}
        <div className="min-h-0 min-w-0 overflow-hidden rounded-xl xl:col-start-1 xl:row-start-3">
          {data?.pointClouds.rawPlyUrl ? (
            <PointCloudViewer
              title="Raw PLY"
              plyUrl={normalizeApiUrl(data.pointClouds.rawPlyUrl)}
              viewpoint={rawViewpoint}
              viewpointKey={rawViewpointKey}
              className="h-full min-h-0 w-full"
              viewerClassName="min-h-0"
            />
          ) : null}
        </div>

        {/* 5. Processed PLY */}
        <div className="min-h-0 min-w-0 overflow-hidden rounded-xl xl:col-start-2 xl:row-start-3">
          {data?.pointClouds.processedPlyUrl ? (
            <PointCloudViewer
              title="Processed PLY"
              plyUrl={normalizeApiUrl(data.pointClouds.processedPlyUrl)}
              viewpoint={processedViewpoint}
              viewpointKey={processedViewpointKey}
              className="h-full min-h-0 w-full"
              viewerClassName="min-h-0"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
