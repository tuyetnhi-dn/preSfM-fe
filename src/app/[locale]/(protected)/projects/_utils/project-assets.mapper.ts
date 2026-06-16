import type { ImageAsset } from "../_components/types";

type AssetItem = {
  id?: string;
  filename?: string;
  name?: string;
  url?: string;
  signedUrl?: string;
  publicUrl?: string;
  width?: number;
  height?: number;
  timestampMs?: number;
  isSelected?: boolean;
  rejectedReason?: string | null;
  blurScore?: number | null;
  noiseScore?: number | null;
};

function mapToImageAsset(item: AssetItem, index: number): ImageAsset {
  return {
    id: item.id ?? `${index}`,
    name: item.filename ?? item.name ?? `image-${index + 1}`,
    url: item.signedUrl ?? item.publicUrl ?? item.url ?? "",
    width: item.width ?? 0,
    height: item.height ?? 0,
    timestampMs: item.timestampMs ?? 0,
  };
}

export function mapRawFramesToImages(items: AssetItem[] = []) {
  return items.map(mapToImageAsset);
}

export function mapProcessedFramesToImages(items: AssetItem[] = []) {
  return items.map(mapToImageAsset);
}

export function mapMaskFramesToImages(items: AssetItem[] = []) {
  return items.map(mapToImageAsset);
}
