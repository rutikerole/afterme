import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage, uploadDocument, uploadAudio, uploadVideo, parseUploadedFile } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the uploaded file
    const { file, filename, contentType } = await parseUploadedFile(request);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Determine upload type based on content type or filename
    const type = getUploadType(contentType, filename);
    const folder = `afterme/${user.id}/${type}s`;

    let result;

    switch (type) {
      case 'image':
        result = await uploadImage(file, folder);
        break;
      case 'document':
        result = await uploadDocument(file, folder);
        break;
      case 'audio':
        result = await uploadAudio(file, folder);
        break;
      case 'video':
        result = await uploadVideo(file, folder);
        break;
      default:
        result = await uploadImage(file, folder); // Default to image
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      type,
      format: result.format,
      size: result.size,
      width: result.width,
      height: result.height,
      duration: result.duration,
    });
  } catch (error) {
    console.error('[Upload API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getUploadType(
  contentType: string | null,
  filename: string | null
): 'image' | 'document' | 'audio' | 'video' {
  const ct = contentType?.toLowerCase() || '';
  const fn = filename?.toLowerCase() || '';

  // Check content type first
  if (ct.startsWith('image/')) return 'image';
  if (ct.startsWith('audio/')) return 'audio';
  if (ct.startsWith('video/')) return 'video';
  if (ct.includes('pdf') || ct.includes('document') || ct.includes('text/')) return 'document';

  // Check file extension
  const ext = fn.split('.').pop() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const audioExts = ['mp3', 'wav', 'ogg', 'webm', 'm4a', 'aac'];
  const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];

  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'audio';
  if (videoExts.includes(ext)) return 'video';
  if (docExts.includes(ext)) return 'document';

  return 'image'; // Default
}
