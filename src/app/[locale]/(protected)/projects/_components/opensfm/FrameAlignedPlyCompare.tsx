"use client";

import { useEffect, useMemo, useState } from "react";
import { PointCloudViewer } from "@/components/viewer/point-cloud-viewer";
import { useGetProjectPlyViewerAssetsQuery } from "@/services/project/project.service";

type Props = {
  projectId: string;
};

type ViewpointLike = {
  position?: number[] | null;
  target?: number[] | null;
  up?: number[] | null;
};

function formatTime(timestampMs?: number | null) {
  if (timestampMs === null || timestampMs === undefined) return "--:--";

  const totalSeconds = timestampMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${seconds
    .toFixed(2)
    .padStart(5, "0")}`;
}

function vectorKey(value?: number[] | null) {
  if (!value?.length) return "null";

  return value.map((item) => Number(item).toFixed(6)).join(",");
}

function buildViewpointKey(input: {
  prefix: string;
  frameId?: string | null;
  frameIndex: number;
  viewpoint?: ViewpointLike | null;
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
    },
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const frames = data?.frames ?? [];
  const selectedFrame = frames[selectedIndex] ?? null;

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
        viewpoint: selectedFrame?.rawViewpoint,
      }),
    [selectedFrame?.frameId, selectedFrame?.rawViewpoint, selectedIndex],
  );

  const processedViewpointKey = useMemo(
    () =>
      buildViewpointKey({
        prefix: "processed",
        frameId: selectedFrame?.frameId,
        frameIndex: selectedIndex,
        viewpoint: selectedFrame?.processedViewpoint,
      }),
    [selectedFrame?.frameId, selectedFrame?.processedViewpoint, selectedIndex],
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
    <section className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-ink dark:text-slate-100">
            So sánh PLY theo khung hình
          </h3>

          <p className="text-xs text-steel dark:text-slate-400">
            Chọn frame để đồng bộ góc nhìn giữa Raw PLY và Processed PLY.
          </p>
        </div>

        <div className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {selectedIndex + 1} / {frames.length} frame
        </div>
      </div>

      <div className="grid h-[calc(100vh-175px)] min-h-[560px] w-full grid-cols-6 grid-rows-[145px_minmax(0,1fr)] gap-3 overflow-hidden">
        <div className="col-span-2 row-span-1 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {selectedFrame?.frameName ?? "No frame"}
              </p>

              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Time: {selectedTime}
              </p>
            </div>

            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Selected
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(frames.length - 1, 0)}
            value={selectedIndex}
            onChange={(event) => selectFrame(Number(event.target.value))}
            className="mt-4 w-full"
          />

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>1</span>
            <span>{frames.length}</span>
          </div>
        </div>

        <div className="col-span-2 row-span-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              Frame preview
            </p>

            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {previewLabel}
            </span>
          </div>

          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt="Selected frame"
              className="h-[108px] w-full rounded-lg object-contain"
            />
          ) : (
            <div className="flex h-[108px] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500 dark:bg-slate-800">
              No image
            </div>
          )}
        </div>

        <div className="col-span-2 row-span-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
            Frame có đủ pose
          </div>

          <div className="h-[105px] overflow-y-auto">
            {frames.map((frame, index) => {
              const isActive = index === selectedIndex;

              return (
                <button
                  key={frame.frameId}
                  type="button"
                  onClick={() => selectFrame(index)}
                  className={`grid w-full grid-cols-[1fr_auto] items-center gap-2 border-b border-slate-100 px-3 py-1.5 text-left text-xs last:border-b-0 dark:border-slate-800 ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/30"
                      : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
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
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    Xem
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-3 row-span-1 min-h-0 overflow-hidden">
          {data?.pointClouds.rawPlyUrl ? (
            <PointCloudViewer
              title="Raw PLY"
              plyUrl={data.pointClouds.rawPlyUrl}
              viewpoint={selectedFrame?.rawViewpoint ?? undefined}
              viewpointKey={rawViewpointKey}
              className="h-full min-h-0 w-full"
              viewerClassName="min-h-0"
            />
          ) : null}
        </div>

        <div className="col-span-3 row-span-1 min-h-0 overflow-hidden">
          {data?.pointClouds.processedPlyUrl ? (
            <PointCloudViewer
              title="Processed PLY"
              plyUrl={data.pointClouds.processedPlyUrl}
              viewpoint={selectedFrame?.processedViewpoint ?? undefined}
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
