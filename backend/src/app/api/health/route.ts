import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    const services = {
        database: 'down' as 'up' | 'down',
        gemini: 'up' as 'up' | 'down',
        storage: 'up' as 'up' | 'down',
    };

    try {
        await prisma.$queryRaw`SELECT 1`;
        services.database = 'up';
    } catch {
        services.database = 'down';
    }

    const status = services.database === 'up' ? 'healthy' : 'degraded';

    return NextResponse.json({
        status,
        timestamp: Date.now(),
        services,
    });
}
