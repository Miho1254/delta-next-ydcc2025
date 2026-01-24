import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, unauthorizedResponse, errorResponse, successResponse } from '@/lib/auth';
import { buildPrompt, analyzeWithGemini } from '@/lib/gemini';
import { z } from 'zod';
import { uploadImage } from '@/lib/storage';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const ChatSchema = z.object({
    text: z.string().optional(),
    imageBase64: z.string().optional(),
});

// POST /api/byproducts/[id]/chat - Chat with AI about byproduct
export async function POST(req: NextRequest, { params }: RouteParams) {
    const user = verifyAuth(req);
    if (!user) return unauthorizedResponse();

    const { id } = await params;

    try {
        const body = await req.json();
        const data = ChatSchema.parse(body);

        if (!data.text && !data.imageBase64) {
            return errorResponse('INVALID_INPUT', 'Cần ít nhất 1 tin nhắn hoặc ảnh', 400);
        }

        // Get byproduct
        const byproduct = await prisma.byProduct.findFirst({
            where: { id, userId: user.userId },
        });

        if (!byproduct) {
            return errorResponse('NOT_FOUND', 'Không tìm thấy đống ủ', 404);
        }

        // Get recent timeline
        const recentTimeline = await prisma.timelineEntry.findMany({
            where: { byproductId: id },
            orderBy: { timestamp: 'desc' },
            take: 5,
        });

        const recentHistory = recentTimeline
            .reverse()
            .map((e: { role: string; content: string }) => `${e.role}: ${e.content}`)
            .join('\n');

        // Build prompt and call Gemini
        const userMessage = data.text || 'Xem ảnh mới của đống ủ';
        const prompt = buildPrompt(
            { name: byproduct.name, type: byproduct.type, location: byproduct.location, contextData: byproduct.contextData },
            recentHistory,
            userMessage
        );

        // Upload image if provided
        let imageUrl = '';
        if (data.imageBase64) {
            const fileName = `chat/${id}/${Date.now()}.jpg`;
            imageUrl = await uploadImage(data.imageBase64, fileName);
        }

        const analysis = await analyzeWithGemini(prompt, data.imageBase64);

        // Save user message to timeline
        await prisma.timelineEntry.create({
            data: {
                byproductId: id,
                timestamp: BigInt(Date.now()),
                role: 'user',
                content: userMessage,
                metadata: data.imageBase64 ? { hasImage: true, imageUrl } : {},
            },
        });

        // Save AI response to timeline
        await prisma.timelineEntry.create({
            data: {
                byproductId: id,
                timestamp: BigInt(Date.now() + 1),
                role: 'model',
                content: analysis.chatResponse,
                metadata: {
                    decompositionLevel: analysis.decompositionLevel,
                    suggestedQuestions: analysis.suggestedQuestions,
                },
            },
        });

        // Update byproduct context
        await prisma.byProduct.update({
            where: { id },
            data: {
                contextData: {
                    ...(byproduct.contextData as object),
                    decompositionLevel: analysis.decompositionLevel,
                    currentCondition: analysis.recommendation.action,
                },
                status: analysis.decompositionLevel >= 80 ? 'ready_to_harvest' : 'processing',
            },
        });

        // Get updated timeline
        const updatedTimeline = await prisma.timelineEntry.findMany({
            where: { byproductId: id },
            orderBy: { timestamp: 'desc' },
            take: 20,
        });

        const timelineFormatted = updatedTimeline.map((entry: { id: string; byproductId: string; timestamp: bigint; role: string; content: string; metadata: unknown }) => ({
            ...entry,
            timestamp: Number(entry.timestamp),
        }));

        return successResponse({ analysis, timeline: timelineFormatted });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return errorResponse('INVALID_INPUT', 'Dữ liệu không hợp lệ', 400);
        }
        if ((error as Error).message === 'AI_ERROR') {
            return errorResponse('AI_ERROR', 'AI đang bận, thử lại sau ít phút', 503);
        }
        console.error('Chat error:', error);
        return errorResponse('SERVER_ERROR', 'Lỗi hệ thống');
    }
}
