import { NextRequest, NextResponse } from 'next/server';
import { pool, testConnection } from '@/lib/database';

/**
 * Health check endpoint
 * GET /api/health
 * Returns server and database status
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'PyCode AI',
      version: '1.0.0',
      checks: {
        server: {
          status: 'ok',
          uptime: process.uptime()
        },
        database: {
          status: 'unknown',
          message: ''
        }
      }
    };

    // Test database connection
    try {
      const dbConnected = await testConnection();
      if (dbConnected) {
        health.checks.database.status = 'ok';
        health.checks.database.message = 'Connected';
      } else {
        health.checks.database.status = 'error';
        health.checks.database.message = 'Connection failed';
        health.status = 'degraded';
      }
    } catch (dbError: any) {
      health.checks.database.status = 'error';
      health.checks.database.message = dbError?.message || 'Unknown error';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Health check failed'
      },
      { status: 500 }
    );
  }
}

