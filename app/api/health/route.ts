/**
 * Health Check API Route
 *
 * Provides application health status for monitoring and load balancers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down' | 'unknown';
    ai: 'up' | 'down' | 'unknown';
    storage: 'up' | 'down' | 'unknown';
  };
  metrics: {
    memoryUsage?: number;
    responseTime: number;
  };
}

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    // Check database connectivity
    const databaseStatus = await checkDatabase();

    // Check AI service (OpenAI)
    const aiStatus = await checkAIService();

    // Check storage service
    const storageStatus = await checkStorage();

    // Calculate overall health
    const services = {
      database: databaseStatus,
      ai: aiStatus,
      storage: storageStatus,
    };

    const serviceStatuses = Object.values(services);
    const downServices = serviceStatuses.filter(
      status => status === 'down'
    ).length;
    const unknownServices = serviceStatuses.filter(
      status => status === 'unknown'
    ).length;

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (downServices === 0 && unknownServices === 0) {
      overallStatus = 'healthy';
    } else if (downServices === 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const responseTime = Date.now() - startTime;

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      services,
      metrics: {
        responseTime,
        ...(typeof process !== 'undefined' &&
          process.memoryUsage && {
            memoryUsage:
              Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
              100,
          }),
      },
    };

    // Return appropriate HTTP status code
    const httpStatus =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 207
          : 503;

    return NextResponse.json(healthStatus, { status: httpStatus });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp,
      version: process.env.npm_package_version || '1.0.0',
      uptime: 0,
      services: {
        database: 'unknown',
        ai: 'unknown',
        storage: 'unknown',
      },
      metrics: {
        responseTime,
      },
    };

    return NextResponse.json(errorStatus, { status: 503 });
  }
}

async function checkDatabase(): Promise<'up' | 'down' | 'unknown'> {
  try {
    const supabase = createClient();
    if (!supabase) {
      return 'unknown';
    }

    // Simple query to check database connectivity
    const { error } = await supabase.from('profiles').select('count').limit(1);

    return error ? 'down' : 'up';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'down';
  }
}

async function checkAIService(): Promise<'up' | 'down' | 'unknown'> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return 'unknown';
    }

    // Simple request to OpenAI API to check connectivity
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    return response.ok ? 'up' : 'down';
  } catch (error) {
    console.error('AI service health check failed:', error);
    return 'down';
  }
}

async function checkStorage(): Promise<'up' | 'down' | 'unknown'> {
  try {
    // For now, we'll assume storage is up if Supabase is configured
    // In a real implementation, you might check S3, CloudFlare R2, etc.
    const supabase = createClient();
    return supabase ? 'up' : 'unknown';
  } catch (error) {
    console.error('Storage health check failed:', error);
    return 'down';
  }
}
