import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Image } from "react-native";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const COMPRESSION_QUALITY = 0.8;
const MAX_DIMENSION = 2048; // longest side

export interface ImageCheckResult {
  valid: boolean;
  reason?: string;
  uri?: string;
}

/** Validates file extension against allowed types. */
export function validateFormat(uri: string): boolean {
  // Strip query params (e.g. photo.jpg?timestamp=123) and fragments before extracting extension
  const cleanUri = uri.split("?")[0].split("#")[0];
  const ext = cleanUri.split(".").pop()?.toLowerCase();
  if (!ext) return true; // If no extension (e.g. content:// URIs), allow through
  return ["jpg", "jpeg", "png", "webp"].includes(ext);
}

/** Validates file size is under the limit. */
export async function validateSize(uri: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return false;
    if (info.size != null && info.size > MAX_IMAGE_SIZE_BYTES) return false;
    return true;
  } catch {
    return false;
  }
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/**
 * Resize and compress an image before upload.
 * Shrinks the longest side to ≤ MAX_DIMENSION with JPEG compression.
 * Images already within the limit are returned unchanged — resizing a
 * smaller image up to 2048px would upscale it (blurry, larger file).
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const { width, height } = await getImageSize(uri);
    const longest = Math.max(width, height);
    if (longest <= MAX_DIMENSION) {
      return uri;
    }
    const scale = MAX_DIMENSION / longest;
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: Math.round(width * scale) } }],
      { compress: COMPRESSION_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch {
    // If compression fails (e.g. remote URI), return original
    return uri;
  }
}

/**
 * Run all client-side image checks. Returns a result indicating
 * whether the image is suitable for upload.
 */
export async function checkImage(uri: string): Promise<ImageCheckResult> {
  if (!validateFormat(uri)) {
    return { valid: false, reason: "Unsupported format. Use JPEG, PNG, or WEBP." };
  }

  const sizeOk = await validateSize(uri);
  if (!sizeOk) {
    return { valid: false, reason: "Image is too large. Maximum size is 10 MB." };
  }

  const compressed = await compressImage(uri);
  return { valid: true, uri: compressed };
}

export { MAX_IMAGE_SIZE_BYTES };
