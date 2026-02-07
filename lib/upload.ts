import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number; // For audio/video
}

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, unknown>;
  allowedFormats?: string[];
  maxFileSize?: number; // in bytes
}

const DEFAULT_OPTIONS: UploadOptions = {
  folder: 'afterme',
  resourceType: 'auto',
  maxFileSize: 10 * 1024 * 1024, // 10MB default
};

/**
 * Upload a file to Cloudinary
 * @param file - Base64 encoded file data or file URL
 * @param options - Upload options
 */
export async function uploadFile(
  file: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn('[Upload] Cloudinary not configured, using data URL fallback');
    // Return the original file as-is (for development without Cloudinary)
    return {
      success: true,
      url: file,
      publicId: `local-${Date.now()}`,
    };
  }

  try {
    // Check file size for base64 data
    if (file.startsWith('data:')) {
      const base64Data = file.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      if (opts.maxFileSize && sizeInBytes > opts.maxFileSize) {
        return {
          success: false,
          error: `File size exceeds maximum allowed (${Math.round(opts.maxFileSize / 1024 / 1024)}MB)`,
        };
      }
    }

    const uploadOptions: Record<string, unknown> = {
      folder: opts.folder,
      resource_type: opts.resourceType,
    };

    if (opts.transformation) {
      uploadOptions.transformation = opts.transformation;
    }

    if (opts.allowedFormats) {
      uploadOptions.allowed_formats = opts.allowedFormats;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
    };
  } catch (error) {
    console.error('[Upload] Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Upload an image with automatic optimization
 */
export async function uploadImage(
  file: string,
  folder: string = 'afterme/images'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'image',
    transformation: {
      quality: 'auto',
      fetch_format: 'auto',
    },
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB for images
  });
}

/**
 * Upload a document (PDF, etc.)
 */
export async function uploadDocument(
  file: string,
  folder: string = 'afterme/documents'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'raw',
    allowedFormats: ['pdf', 'doc', 'docx', 'txt'],
    maxFileSize: 10 * 1024 * 1024, // 10MB for documents
  });
}

/**
 * Upload an audio file (voice messages)
 */
export async function uploadAudio(
  file: string,
  folder: string = 'afterme/audio'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'video', // Cloudinary uses 'video' for audio files
    allowedFormats: ['mp3', 'wav', 'webm', 'ogg', 'm4a'],
    maxFileSize: 25 * 1024 * 1024, // 25MB for audio
  });
}

/**
 * Upload a video file
 */
export async function uploadVideo(
  file: string,
  folder: string = 'afterme/videos'
): Promise<UploadResult> {
  return uploadFile(file, {
    folder,
    resourceType: 'video',
    transformation: {
      quality: 'auto',
    },
    allowedFormats: ['mp4', 'mov', 'avi', 'webm'],
    maxFileSize: 100 * 1024 * 1024, // 100MB for videos
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFile(publicId: string, resourceType: string = 'image'): Promise<boolean> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('[Upload] Cloudinary not configured, skipping delete');
    return true;
  }

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error('[Upload] Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Generate a signed URL for private files
 */
export function getSignedUrl(publicId: string, expiresInSeconds: number = 3600): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return publicId; // Return as-is if not configured
  }

  const timestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: timestamp,
  });
}

/**
 * Get thumbnail URL for an image/video
 */
export function getThumbnailUrl(
  publicId: string,
  width: number = 200,
  height: number = 200
): string {
  if (!process.env.CLOUDINARY_CLOUD_NAME || publicId.startsWith('data:') || publicId.startsWith('http')) {
    return publicId;
  }

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}

/**
 * Parse uploaded file from request
 * Handles both multipart form data and base64 data URLs
 */
export async function parseUploadedFile(request: Request): Promise<{
  file: string | null;
  filename: string | null;
  contentType: string | null;
}> {
  const contentType = request.headers.get('content-type') || '';

  // Handle JSON with base64 data
  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      return {
        file: body.file || body.data || null,
        filename: body.filename || null,
        contentType: body.contentType || null,
      };
    } catch {
      return { file: null, filename: null, contentType: null };
    }
  }

  // Handle multipart form data
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (file) {
        const buffer = await file.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        return {
          file: dataUrl,
          filename: file.name,
          contentType: file.type,
        };
      }
    } catch (error) {
      console.error('[Upload] Error parsing multipart form:', error);
    }
  }

  return { file: null, filename: null, contentType: null };
}
