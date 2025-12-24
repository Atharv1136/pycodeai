import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Construct the full file path
    // Remove leading slash and construct path correctly
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    const fullPath = join(process.cwd(), cleanPath);

    // Read the file content
    const content = await readFile(fullPath, 'utf-8');

    return NextResponse.json({
      success: true,
      content,
      path: filePath
    });

  } catch (error) {
    console.error('File read error:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}
