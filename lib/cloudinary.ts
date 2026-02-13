import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
  tags?: string[];
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a file from base64 string
 */
export async function uploadFromBase64(
  base64Data: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    console.warn("[Cloudinary] Not configured, skipping upload");
    return { success: false, error: "Cloudinary not configured" };
  }

  try {
    const uploadOptions: Record<string, unknown> = {
      folder: options.folder || "afterme",
      resource_type: options.resourceType || "auto",
    };

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    if (options.tags) {
      uploadOptions.tags = options.tags;
    }

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload a file from URL
 */
export async function uploadFromUrl(
  url: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    console.warn("[Cloudinary] Not configured, skipping upload");
    return { success: false, error: "Cloudinary not configured" };
  }

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: options.folder || "afterme",
      resource_type: options.resourceType || "auto",
      tags: options.tags,
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("[Cloudinary] Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a file by public ID
 */
export async function deleteFile(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<{ success: boolean; error?: string }> {
  if (!isCloudinaryConfigured()) {
    return { success: false, error: "Cloudinary not configured" };
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return { success: true };
  } catch (error) {
    console.error("[Cloudinary] Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

/**
 * Generate an optimized URL for an image
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return "";
  }

  const transformation = [];

  if (options.width) {
    transformation.push(`w_${options.width}`);
  }
  if (options.height) {
    transformation.push(`h_${options.height}`);
  }
  if (options.crop) {
    transformation.push(`c_${options.crop}`);
  }
  if (options.quality) {
    transformation.push(`q_${options.quality}`);
  }
  if (options.format) {
    transformation.push(`f_${options.format}`);
  }

  const transformStr = transformation.length > 0 ? transformation.join(",") + "/" : "";

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}${publicId}`;
}

/**
 * Upload a memory image
 */
export async function uploadMemoryImage(
  base64Data: string,
  userId: string
): Promise<UploadResult> {
  return uploadFromBase64(base64Data, {
    folder: `afterme/memories/${userId}`,
    resourceType: "image",
    transformation: {
      quality: "auto",
    },
    tags: ["memory", userId],
  });
}

/**
 * Upload a voice message
 */
export async function uploadVoiceMessage(
  base64Data: string,
  userId: string
): Promise<UploadResult> {
  return uploadFromBase64(base64Data, {
    folder: `afterme/voice/${userId}`,
    resourceType: "video", // Audio files are handled as video in Cloudinary
    tags: ["voice", userId],
  });
}

/**
 * Upload a vault document
 */
export async function uploadVaultDocument(
  base64Data: string,
  userId: string,
  category: string
): Promise<UploadResult> {
  return uploadFromBase64(base64Data, {
    folder: `afterme/vault/${userId}/${category}`,
    resourceType: "raw",
    tags: ["vault", category, userId],
  });
}

/**
 * Upload a profile avatar
 */
export async function uploadAvatar(
  base64Data: string,
  userId: string
): Promise<UploadResult> {
  return uploadFromBase64(base64Data, {
    folder: "afterme/avatars",
    resourceType: "image",
    transformation: {
      width: 200,
      height: 200,
      crop: "fill",
      quality: "auto",
    },
    tags: ["avatar", userId],
  });
}

export default cloudinary;
