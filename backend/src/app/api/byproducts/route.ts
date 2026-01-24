import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse, errorResponse, successResponse } from '@/lib/auth';
import { z } from 'zod';

// GET /api/byproducts - List all byproducts for current user
export async function GET(req: NextRequest) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    try {
        const byproducts = await prisma.byProduct.findMany({
            where: { userId: user.userId },
            orderBy: { createdAt: 'desc' },
        });

        return successResponse({ data: byproducts });
    } catch (error) {
        console.error('GET byproducts error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}

const CreateByProductSchema = z.object({
    name: z.string().min(1, 'Tên không được để trống'),
    type: z.enum(['straw', 'shrimp_shell', 'hyacinth', 'unknown']),
    location: z.string().default('0,0'),
    imageBase64: z.string().optional(),
});

// POST /api/byproducts - Create new byproduct
export async function POST(req: NextRequest) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    try {
        const body = await req.json();
        const data = CreateByProductSchema.parse(body);

        // TODO: Upload image to Supabase Storage and get URL
        const startImageUrl = data.imageBase64 ? 'pending-upload' : '';

        const byproduct = await prisma.byProduct.create({
            data: {
                userId: user.userId,
                name: data.name,
                type: data.type,
                status: 'new_product',
                location: data.location,
                startImageUrl,
                contextData: {
                    decompositionLevel: 0,
                    currentCondition: 'Mới bắt đầu',
                },
            },
        });

        // Create initial timeline entry
        await prisma.timelineEntry.create({
            data: {
                byproductId: byproduct.id,
                timestamp: BigInt(Date.now()),
                role: 'model',
                content: `Đống ${data.name} đã được tạo. Bác bắt đầu theo dõi quá trình ủ phân nhé!`,
                metadata: {},
            },
        });

        return successResponse({ byproduct });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('INVALID_INPUT', 'Thông tin không hợp lệ', 400);
        }
        console.error('POST byproduct error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}
