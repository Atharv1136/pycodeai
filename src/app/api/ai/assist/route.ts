import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { aiCodeAssistance } from '@/ai/flows/ai-code-assistance';

/**
 * AI Code Assistance API endpoint
 * POST /api/ai/assist
 * Provides AI code assistance via Google Gemini
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
    const { instruction, code, uploadedFiles, quickActions } = body;

    if (!instruction) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    console.log('[API] AI assist request from user:', user.id);

    try {
      const result = await aiCodeAssistance({
        instruction,
        code: code || '',
        quickActions: quickActions || [],
        uploadedFiles: uploadedFiles || []
      });

      return NextResponse.json({
        success: true,
        ...result
      });
    } catch (aiError: any) {
      console.error('[API] AI assist error:', aiError);
      return NextResponse.json(
        {
          error: 'AI service error',
          details: aiError?.message || 'Failed to process AI request'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API] AI assist endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

