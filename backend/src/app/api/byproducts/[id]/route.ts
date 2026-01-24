import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse, errorResponse, successResponse } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/byproducts/[id] - Get byproduct detail with timeline
export async function GET(req: NextRequest, { params }: RouteParams) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    try {
        const byproduct = await prisma.byProduct.findFirst({
            where: { id, userId: user.userId },
        });

        if (!byproduct) {
            return errorResponse('NOT_FOUND', 'Không tìm thấy đống ủ', 404);
        }

        const timeline = await prisma.timelineEntry.findMany({
            where: { byproductId: id },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        // Convert BigInt to number for JSON serialization
        const timelineFormatted = timeline.map(entry => ({
            ...entry,
            timestamp: Number(entry.timestamp),
        }));

        return successResponse({ byproduct, timeline: timelineFormatted });
    } catch (error) {
        console.error('GET byproduct detail error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}

// DELETE /api/byproducts/[id] - Delete byproduct
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    try {
        const byproduct = await prisma.byProduct.findFirst({
            where: { id, userId: user.userId },
        });

        if (!byproduct) {
            return errorResponse('NOT_FOUND', 'Không tìm thấy đống ủ', 404);
        }

        await prisma.byProduct.delete({ where: { id } });

        return successResponse({ message: 'Đã xóa thành công' });
    } catch (error) {
        console.error('DELETE byproduct error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}
