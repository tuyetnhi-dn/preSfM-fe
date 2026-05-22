import type { FrameImageDto } from "@/types/dtos/video/video.dto";
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

export function mapRawFramesToImages(frames: FrameImageDto[]): ImageAsset[] {
  return frames
    .filter((frame) => Boolean(frame.raw?.url))
    .map((frame) => ({
      id: frame.id,
      name:
        getFileNameFromPath(frame.raw?.path) ||
        `frame_${String(frame.frameIndex + 1).padStart(6, "0")}.jpg`,
      url: frame.raw?.url,
      frameIndex: frame.frameIndex,
      timestampMs: frame.timestampMs,
      width: frame.width,
      height: frame.height,
    }));
}

export function mapProcessedFramesToImages(
  frames: FrameImageDto[],
): ImageAsset[] {
  return frames
    .filter((frame) => Boolean(frame.processed?.url))
    .map((frame) => ({
      id: frame.id,
      name:
        getFileNameFromPath(frame.processed?.path) ||
        `processed_${String(frame.frameIndex + 1).padStart(6, "0")}.jpg`,
      url: frame.processed?.url,
      frameIndex: frame.frameIndex,
      timestampMs: frame.timestampMs,
      width: frame.width,
      height: frame.height,
    }));
}

export function mapMaskFramesToImages(frames: FrameImageDto[]): ImageAsset[] {
  return frames
    .filter((frame) => Boolean(frame.mask?.url))
    .map((frame) => ({
      id: frame.id,
      name:
        getFileNameFromPath(frame.mask?.path) ||
        `mask_${String(frame.frameIndex + 1).padStart(6, "0")}.png`,
      url: frame.mask?.url,
      frameIndex: frame.frameIndex,
      timestampMs: frame.timestampMs,
      width: frame.width,
      height: frame.height,
    }));
}
