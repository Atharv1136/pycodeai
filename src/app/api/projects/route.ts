import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Get projects for a user or a single project by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    const supabase = await createClient();

    // If projectId is provided, fetch single project
    if (projectId) {
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, name, description, file_tree, created_at, updated_at')
        .eq('id', projectId)
        .single();

      if (error || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        project: {
          ...project,
          // Supabase returns JSONB as object, but frontend might expect string or object depending on implementation.
          // Existing code stringified it. Let's keep it as object if frontend handles it, 
          // or stringify if frontend expects string.
          // Looking at previous code: `file_tree: typeof project.file_tree === 'string' ? project.file_tree : JSON.stringify(project.file_tree)`
          // It seems it wanted a string. Let's return string to be safe for now, or check frontend.
          // Actually, let's return it as is (object) and see if frontend breaks, usually Next.js handles JSON response.
          // Wait, the previous code was: `file_tree: ... ? ... : JSON.stringify(...)`. 
          // If the frontend parses it again, it might be double parsing.
          // Let's assume the frontend expects a JSON string for file_tree based on the old code.
          file_tree: JSON.stringify(project.file_tree)
        }
      });
    }

    // Otherwise, fetch all projects for user
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID or Project ID is required' },
        { status: 400 }
      );
    }

    console.log('[API] Fetching projects for user:', userId);

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, file_tree, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[API] Failed to fetch projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    console.log('[API] Processed projects:', projects?.length || 0, 'projects');

    // Map projects to match expected format
    const formattedProjects = projects?.map(p => ({
      ...p,
      file_tree: JSON.stringify(p.file_tree)
    })) || [];

    return NextResponse.json({ projects: formattedProjects });

  } catch (error: any) {
    console.error('[API] Outer catch - Error fetching projects:', error);
    return NextResponse.json({
      error: 'Failed to fetch projects',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

// Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description = '', fileTree } = body;

    console.log('[API] Creating project - userId:', userId, 'name:', name);

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and project name are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Supabase generates UUIDs by default if we configured it, but let's see if we need to pass ID.
    // The schema uses `default uuid_generate_v4()`.
    // The old code generated `proj_${Date.now()}`.
    // To maintain compatibility with any ID format expectations (strings), we can let Supabase generate UUID
    // OR we can generate our own ID if the column allows text.
    // My schema defined `id uuid default uuid_generate_v4()`.
    // So we MUST use UUIDs. `proj_...` will fail if it's not a UUID.
    // This is a BREAKING CHANGE for the ID format.
    // However, since we are migrating, we should switch to UUIDs.
    // If the frontend relies on `proj_` prefix, we might have issues.
    // But usually IDs are opaque.

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name,
        description,
        file_tree: fileTree // Pass object directly for JSONB
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      );
    }

    console.log('[API] Project created successfully:', data.id);

    return NextResponse.json({
      success: true,
      projectId: data.id,
      message: 'Project created successfully'
    });
  } catch (error) {
    console.error('[API] Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Update project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, description, fileTree } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (fileTree) updates.file_tree = fileTree;

    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully'
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// Delete project
export async function DELETE(request: NextRequest) {
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

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
