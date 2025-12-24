import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { createClient } from '@/lib/supabase/server';

// Detect and save newly created files after code execution
export async function POST(request: NextRequest) {
  try {
    const { projectId, userId, existingFiles } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Project files are created in the uploads/{projectId} directory
    const projectDir = join(process.cwd(), 'uploads', projectId);

    if (!existsSync(projectDir)) {
      // No project directory, no files created
      return NextResponse.json({
        success: true,
        newFiles: []
      });
    }

    // Get list of all files in project directory
    const allFiles = await readdir(projectDir, { withFileTypes: true });
    const fileNames = allFiles
      .filter(file => file.isFile())
      .map(file => file.name);

    // Get list of existing files (from project fileTree and database)
    const existingFileNames = new Set(existingFiles || []);

    // Also check database for files
    try {
      const supabase = await createClient();
      const { data: dbFiles } = await supabase
        .from('files')
        .select('filename, original_name')
        .eq('project_id', projectId);

      if (dbFiles) {
        dbFiles.forEach((file: any) => {
          existingFileNames.add(file.filename);
          existingFileNames.add(file.original_name);
        });
      }
    } catch (dbError) {
      console.error('Error querying database for existing files:', dbError);
    }

    // Find new files (files not in existing list)
    const newFileNames = fileNames.filter(name => {
      // Skip files that match upload pattern (timestamped)
      // But include other files that might have been created
      // Check if it's an uploaded file by pattern or if it's a new output file
      const isUploadedFile = /^\d+_/.test(name); // Uploaded files start with timestamp

      // If it's not an uploaded file pattern or it's explicitly new, include it
      return !isUploadedFile || !existingFileNames.has(name);
    });

    // Also check the project root directory for files created there
    const projectRoot = process.cwd();
    const rootFiles = await readdir(projectRoot, { withFileTypes: true }).catch(() => []);
    const rootFileNames = rootFiles
      .filter((file: any) => file.isFile())
      .map((file: any) => file.name)
      .filter((name: string) => {
        // Only include common output file extensions
        return /\.(json|csv|txt|png|jpg|jpeg|pdf|xlsx|xls)$/i.test(name);
      });

    // Combine and process new files
    const allNewFiles = [...newFileNames.map(name => ({ name, dir: projectDir })), ...rootFileNames.map(name => ({ name, dir: projectRoot }))];

    const newFilesData = await Promise.all(
      allNewFiles.map(async ({ name, dir }) => {
        try {
          const filePath = join(dir, name);
          const fileStat = await stat(filePath);

          // Read file content
          let content = '';
          try {
            content = await readFile(filePath, 'utf-8');
          } catch (readError) {
            // If file is binary or can't be read as text, leave content empty
            content = '';
          }

          return {
            name,
            content,
            size: fileStat.size,
            path: dir === projectDir ? `uploads/${projectId}/${name}` : name,
            createdAt: fileStat.birthtime
          };
        } catch (error) {
          console.error(`Error reading file ${name}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validNewFiles = newFilesData.filter(file => file !== null);

    // Save new files to database
    const savedFiles = [];
    const supabase = await createClient();

    for (const file of validNewFiles) {
      try {
        // Use UUID for file ID as per Supabase schema?
        // The schema uses UUID default gen_random_uuid().
        // But here we might want to return the ID.
        // Let's let Supabase generate it or generate a UUID ourselves if we need it.
        // The previous code generated `file_...`.
        // If the schema expects UUID, we should use UUID.
        // I'll assume the schema handles it or I can pass a UUID.
        // Since I can't easily import uuid here without adding dependency (though I could use crypto.randomUUID),
        // I'll let Supabase generate it and return it.

        const filePath = file.path;

        const { data: insertedFile, error } = await supabase
          .from('files')
          .insert({
            project_id: projectId,
            filename: file.name,
            original_name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: 'application/octet-stream'
          })
          .select()
          .single();

        if (error) throw error;

        savedFiles.push({
          id: insertedFile.id,
          name: file.name,
          content: file.content,
          path: filePath,
          size: file.size
        });
      } catch (dbError) {
        console.error(`Error saving file ${file.name} to database:`, dbError);
        // Continue with other files even if one fails
        savedFiles.push({
          name: file.name,
          content: file.content,
          path: file.path,
          size: file.size
        });
      }
    }

    return NextResponse.json({
      success: true,
      newFiles: savedFiles
    });

  } catch (error) {
    console.error('Error detecting new files:', error);
    return NextResponse.json(
      {
        error: 'Failed to detect new files',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

