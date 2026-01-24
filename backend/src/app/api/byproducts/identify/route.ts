import { NextRequest } from 'next/server';
import { verifyAuth, unauthorizedResponse, errorResponse, successResponse } from '@/lib/auth';
import { identifyImage } from '@/lib/gemini';
import { z } from 'zod';

const IdentifySchema = z.object({
    imageBase64: z.string().min(1, 'Ảnh không được để trống'),
});

// POST /api/byproducts/identify - Identify byproduct from image
export async function POST(req: NextRequest) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    try {
        const body = await req.json();
        const data = IdentifySchema.parse(body);

        const identifiedName = await identifyImage(data.imageBase64);

        return successResponse({ identifiedName });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('INVALID_INPUT', 'Thông tin không hợp lệ', 400);
        }
        console.error('POST identify error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}
