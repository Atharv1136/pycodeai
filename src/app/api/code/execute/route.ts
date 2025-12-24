import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { runPythonCode } from '@/ai/flows/run-python-code';

/**
 * Code Execution API endpoint
 * POST /api/code/execute
 * Executes Python code and returns output
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide a valid token.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, projectId } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    console.log('[API] Code execution request from user:', user.id, 'project:', projectId || 'none');

    try {
      const result = await runPythonCode({
        code,
        projectId: projectId || undefined
      });

      return NextResponse.json({
        success: true,
        output: result.output,
        error: result.error,
        workingDir: result.workingDir
      });
    } catch (execError: any) {
      console.error('[API] Code execution error:', execError);
      return NextResponse.json(
        {
          error: 'Code execution failed',
          details: execError?.message || 'Failed to execute code'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API] Code execute endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

