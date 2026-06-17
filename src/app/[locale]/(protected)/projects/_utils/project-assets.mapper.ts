import type { ImageAsset } from "../_components/types";

type StorageAsset = {
  storageFileId?: string | null;
  bucket?: string | null;
  path?: string | null;
  url?: string | null;
};

export type AssetItem = {
  id?: string;
  frameIndex?: number | null;
  timestampMs?: number | null;
  width?: number | null;
  height?: number | null;
  blurScore?: number | string | null;
  noiseScore?: number | string | null;
  isSelected?: boolean | null;
  rejectedReason?: string | null;

  raw?: StorageAsset | null;
  processed?: StorageAsset | null;
  mask?: StorageAsset | null;

  filename?: string | null;
  name?: string | null;
  url?: string | null;
  signedUrl?: string | null;
  publicUrl?: string | null;
};

function getAssetUrl(item: AssetItem, type: "raw" | "processed" | "mask") {
  if (type === "raw") {
    return item.raw?.url ?? item.url ?? item.signedUrl ?? item.publicUrl ?? "";
  }

  if (type === "processed") {
    return (
      item.processed?.url ?? item.url ?? item.signedUrl ?? item.publicUrl ?? ""
    );
  }

  return item.mask?.url ?? item.url ?? item.signedUrl ?? item.publicUrl ?? "";
}

function getAssetName(item: AssetItem, index: number, type: string) {
  const path =
    type === "raw"
      ? item.raw?.path
      : type === "processed"
        ? item.processed?.path
        : item.mask?.path;

  return (
    item.filename ??
    item.name ??
    path?.split("/").pop() ??
    `${type}-${index + 1}`
  );
}

function mapToImageAsset(
  item: AssetItem,
  index: number,
  type: "raw" | "processed" | "mask",
): ImageAsset {
  return {
    id: item.id ?? `${type}-${index}`,
    name: getAssetName(item, index, type),
    url: getAssetUrl(item, type),
  };
}

export function mapRawFramesToImages(items: AssetItem[] = []) {
  return items.map((item, index) => mapToImageAsset(item, index, "raw"));
}

export function mapProcessedFramesToImages(items: AssetItem[] = []) {
  return items.map((item, index) => mapToImageAsset(item, index, "processed"));
}

export function mapMaskFramesToImages(items: AssetItem[] = []) {
  return items.map((item, index) => mapToImageAsset(item, index, "mask"));
}
