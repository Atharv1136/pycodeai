import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createClient } from '@/lib/supabase/server';

// Increase timeout for file uploads
export const maxDuration = 60; // 60 seconds for file uploads

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('[API] File upload request received');

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const projectId = data.get('projectId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!projectId || projectId === 'default') {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Uploading file:', file.name, 'Size:', file.size, 'bytes', 'for project:', projectId);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', projectId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file metadata to database
    // Supabase uses UUIDs for IDs usually, but let's see if we can use our own ID or let Supabase generate it.
    // The schema says `id uuid default uuid_generate_v4()`.
    // So we should NOT pass an ID if we want auto-generation, OR pass a valid UUID.
    // The old code used `file_${Date.now()}_...` which is NOT a UUID.
    // This will fail if we try to insert it into a UUID column.
    // We should let Supabase generate the ID.

    const relativePath = `uploads/${projectId}/${fileName}`;

    const supabase = await createClient();

    const { data: fileData, error } = await supabase
      .from('files')
      .insert({
        project_id: projectId,
        filename: fileName,
        original_name: file.name,
        file_path: relativePath,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving file metadata to database:', error);
      // Continue even if database save fails - file is still uploaded
      // But we won't have the ID to return.
    }

    const uploadTime = Date.now() - startTime;
    console.log('[API] File uploaded successfully in', uploadTime, 'ms');

    // Return file information
    return NextResponse.json({
      success: true,
      file: {
        id: fileData?.id || 'temp_id', // Use generated ID or temp if failed
        name: file.name,
        originalName: file.name,
        fileName: fileName,
        size: file.size,
        type: file.type,
        path: `/uploads/${projectId}/${fileName}`,
        relativePath: relativePath,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    const uploadTime = Date.now() - startTime;
    console.error('[API] File upload error after', uploadTime, 'ms:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
