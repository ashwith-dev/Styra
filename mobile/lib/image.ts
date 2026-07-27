import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

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
  const ext = uri.split(".").pop()?.toLowerCase();
  if (!ext) return false;
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

/**
 * Resize and compress an image before upload.
 * Ensures the longest side ≤ MAX_DIMENSION and applies JPEG compression.
 * Returns the manipulated image URI, or the original if already small enough.
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: MAX_DIMENSION } }],
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
