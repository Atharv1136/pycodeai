import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Get all uploaded files for a project
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get file metadata from database
    const { data: files, error } = await supabase
      .from('files')
      .select('id, filename, original_name, file_path, file_size, mime_type')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching project files:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project files' },
        { status: 500 }
      );
    }

    const fileList = files || [];

    // Read file contents from filesystem
    const filesWithContent = await Promise.all(
      fileList.map(async (file: any) => {
        try {
          // Construct full path to the uploaded file
          const fullPath = join(process.cwd(), file.file_path);

          // Check if file exists
          if (existsSync(fullPath)) {
            const content = await readFile(fullPath, 'utf-8');
            return {
              id: file.id,
              filename: file.filename,
              originalName: file.original_name,
              filePath: file.file_path,
              fileSize: file.file_size,
              mimeType: file.mime_type,
              content
            };
          } else {
            console.warn(`File not found: ${fullPath}`);
            return {
              id: file.id,
              filename: file.filename,
              originalName: file.original_name,
              filePath: file.file_path,
              fileSize: file.file_size,
              mimeType: file.mime_type,
              content: '' // File doesn't exist, return empty content
            };
          }
        } catch (error) {
          console.error(`Error reading file ${file.file_path}:`, error);
          return {
            id: file.id,
            filename: file.filename,
            originalName: file.original_name,
            filePath: file.file_path,
            fileSize: file.file_size,
            mimeType: file.mime_type,
            content: '' // Return empty content on error
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      files: filesWithContent
    });
  } catch (error) {
    console.error('Error fetching project files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project files', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

