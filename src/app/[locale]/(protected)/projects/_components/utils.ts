import type {
  FrameImageDto,
  FrameImageLike,
} from "@/types/dtos/video/video.dto";
import type { ImageAsset } from "./types";

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;

    if (typeof data === "object" && data !== null) {
      const message = (data as { message?: unknown }).message;
      const errorMessage = (data as { error?: unknown }).error;

      if (typeof message === "string") return message;
      if (Array.isArray(message)) return message.join(", ");
      if (typeof errorMessage === "string") return errorMessage;
    }

    if (typeof data === "string") return data;
  }

  return "";
}

function getFileNameFromPath(path?: string) {
  if (!path) return "";

  return path.split("/").pop() || path;
}

export function mapRawFramesToImages(frames: FrameImageLike[]) {
  return frames.map((frame, index) => ({
    id: frame.id ?? `raw-${index}`,
    name: frame.originalName ?? frame.fileName ?? `Raw frame ${index + 1}`,
    url: frame.url ?? frame.signedUrl ?? frame.storageUrl ?? "",
    frameIndex: frame.frameIndex ?? index,
    timestampMs: frame.timestampMs ?? undefined,
  }));
}

export function mapProcessedFramesToImages(frames: FrameImageLike[]) {
  return frames.map((frame, index) => ({
    id: frame.id ?? `processed-${index}`,
    name:
      frame.originalName ?? frame.fileName ?? `Processed frame ${index + 1}`,
    url: frame.url ?? frame.signedUrl ?? frame.storageUrl ?? "",
    frameIndex: frame.frameIndex ?? index,
    timestampMs: frame.timestampMs ?? undefined,
  }));
}

export function mapMaskFramesToImages(frames: FrameImageLike[]) {
  return frames.map((frame, index) => ({
    id: frame.id ?? `mask-${index}`,
    name: frame.originalName ?? frame.fileName ?? `Mask ${index + 1}`,
    url: frame.url ?? frame.signedUrl ?? frame.storageUrl ?? "",
    frameIndex: frame.frameIndex ?? index,
    timestampMs: frame.timestampMs ?? undefined,
  }));
}
