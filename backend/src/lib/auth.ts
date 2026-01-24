import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
    userId: string;
    phone: string;
}

export function verifyAuth(req: NextRequest): AuthUser | null {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return null;
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
        return payload;
    } catch {
        return null;
    }
}

export function unauthorizedResponse(message = 'Bác cần đăng nhập') {
    return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', userMessage: message } },
        { status: 401 }
    );
}

export function errorResponse(code: string, userMessage: string, status = 500) {
    return NextResponse.json(
        { success: false, error: { code, userMessage } },
        { status }
    );
}

export function successResponse<T>(data: T) {
    return NextResponse.json({ success: true, ...data });
}
