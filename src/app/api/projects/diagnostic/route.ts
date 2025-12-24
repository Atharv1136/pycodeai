import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database';

/**
 * Diagnostic endpoint to check project data in database
 * GET /api/projects/diagnostic?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      // Get all projects for user
      const [projects] = await connection.execute(`
        SELECT 
          id, 
          name, 
          description, 
          user_id,
          LENGTH(file_tree) as file_tree_size,
          created_at, 
          updated_at
        FROM projects 
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `, [userId]);

      // Get full project data with file_tree
      const [fullProjects] = await connection.execute(`
        SELECT 
          id, 
          name, 
          file_tree,
          created_at, 
          updated_at
        FROM projects 
        WHERE user_id = ?
        ORDER BY updated_at DESC
        LIMIT 3
      `, [userId]);

      // Analyze file_tree structure
      const analyzedProjects = (fullProjects as any[]).map((project: any) => {
        let analysis = {
          id: project.id,
          name: project.name,
          file_tree_size: 0,
          file_tree_type: typeof project.file_tree,
          file_tree_is_null: project.file_tree === null,
          file_count: 0,
          folder_count: 0,
          sample_structure: null as any,
          error: null as string | null
        };

        try {
          let fileTree;
          if (typeof project.file_tree === 'string') {
            analysis.file_tree_size = project.file_tree.length;
            fileTree = JSON.parse(project.file_tree);
          } else if (project.file_tree) {
            fileTree = project.file_tree;
            analysis.file_tree_size = JSON.stringify(fileTree).length;
          }

          if (fileTree) {
            const countFilesAndFolders = (items: any[]): { files: number; folders: number } => {
              let files = 0;
              let folders = 0;
              
              for (const item of items) {
                if (item.type === 'file') {
                  files++;
                } else if (item.type === 'folder') {
                  folders++;
                  if (item.children && Array.isArray(item.children)) {
                    const counts = countFilesAndFolders(item.children);
                    files += counts.files;
                    folders += counts.folders;
                  }
                }
              }
              
              return { files, folders };
            };

            const counts = countFilesAndFolders(fileTree.children || []);
            analysis.file_count = counts.files;
            analysis.folder_count = counts.folders;
            
            // Get sample structure (first 3 files/folders)
            analysis.sample_structure = {
              name: fileTree.name,
              type: fileTree.type,
              children_count: (fileTree.children || []).length,
              sample_children: (fileTree.children || []).slice(0, 3).map((child: any) => ({
                name: child.name,
                type: child.type,
                has_content: child.type === 'file' && child.content !== undefined,
                content_length: child.type === 'file' ? (child.content?.length || 0) : undefined
              }))
            };
          }
        } catch (error: any) {
          analysis.error = error.message;
        }

        return analysis;
      });

      return NextResponse.json({
        summary: {
          total_projects: Array.isArray(projects) ? projects.length : 0,
          projects_with_data: analyzedProjects.length
        },
        projects: Array.isArray(projects) ? projects : [],
        analyzed_projects: analyzedProjects
      });
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('[Diagnostic] Error:', error);
    return NextResponse.json(
      { 
        error: 'Diagnostic failed', 
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}

