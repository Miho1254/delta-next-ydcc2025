import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const LoginSchema = z.object({
    phone: z.string().regex(/^0\d{9}$/, 'Invalid phone number'),
    name: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { phone, name } = LoginSchema.parse(body);

        // 1. Find or create user
        let user = await prisma.user.findUnique({ where: { phone } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    name: name || `Nông dân ${phone.slice(-4)}`,
                    region: 'ĐBSCL',
                },
            });
        }

        // 2. Generate JWT (7 days)
        const token = jwt.sign(
            { userId: user.id, phone: user.phone },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            accessToken: token,
            user,
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: { code: 'INVALID_INPUT', userMessage: 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)' } },
                { status: 400 }
            );
        }

        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', userMessage: 'Lỗi hệ thống, thử lại sau' } },
            { status: 500 }
        );
    }
}
