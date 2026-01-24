# AGRI-LOOP: TECHNICAL SPECIFICATION
**YDCC Hackathon 2025** | **36-Hour MVP** | **Hybrid Mobile App**

---

## 📋 EXECUTIVE SUMMARY

### Vision Statement
Agri-Loop là ứng dụng di động hỗ trợ nông dân ĐBSCL xử lý phụ phẩm nông nghiệp bằng AI, hướng tới **chuyển đổi kép** (Digital & Green Transformation) và **bao trùm xã hội** (Social Inclusivity).

### Core Value Proposition
> **"Chụp ảnh đống phụ phẩm → AI phân tích → Lời khuyên bằng tiếng Việt"**

Nông dân chỉ cần:
1. Chụp ảnh đống rơm/vỏ tôm/bèo tây
2. Hỏi AI bằng giọng nói hoặc text
3. Nhận lời khuyên cụ thể, dễ hiểu

### Target Users
- **Primary:** Nông dân ĐBSCL (60+ tuổi, ít kỹ năng công nghệ)
- **Secondary:** Hợp tác xã, tổ chức nông nghiệp
- **Language:** 100% tiếng Việt, giọng miền Tây

### Key Features (MVP)
| Feature | Description | Priority |
|---------|-------------|----------|
| 📸 **Photo Upload** | Chụp ảnh phụ phẩm, tự động phân tích | P0 - MUST |
| 🤖 **AI Chat** | Trò chuyện với AI về tiến độ ủ phân | P0 - MUST |
| 🎤 **Voice Input** | Hỏi bằng giọng nói (speech-to-text) | P1 - SHOULD |
| 🎯 **Selection Mode** | AI gợi ý câu hỏi, bác chọn nhanh | P0 - MUST |
| ⌨️ **Text Input** | Gõ tay nếu muốn trình bày kỹ | P1 - SHOULD |
| 📊 **Timeline** | Xem lịch sử chăm sóc từng đống ủ | P0 - MUST |
| 🔐 **Simple Auth** | Đăng nhập bằng SĐT (không cần OTP) | P0 - MUST |
| 🛒 **Chợ Nông Sản** | Mock marketplace bán sản phẩm tái chế | P2 - DEMO ONLY |

### Architecture Overview
```
┌─────────────────┐
│  Mobile (Expo)  │  ← React Native, Voice Input, Camera
│   Vietnamese UI │
└────────┬────────┘
         │ HTTPS/REST
         ↓
┌─────────────────┐
│  Backend (Next) │  ← API Routes, JWT Auth, Image Upload
│   Vercel Deploy │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│Supabase │ │ Gemini   │
│Postgres │ │ 1.5 Flash│
│+ Storage│ │ Vision AI│
└─────────┘ └──────────┘
```

### Tech Stack Summary
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Mobile** | Expo Go (React Native) | No build needed, fast iteration |
| **Backend** | Next.js 15 API Routes | Serverless, easy deploy |
| **Database** | Supabase PostgreSQL | Managed, free tier |
| **Storage** | Supabase Storage | CDN included, simple API |
| **AI** | Google Gemini 1.5 Flash | Multimodal (vision + text), fast |
| **Auth** | JWT (no SMS OTP) | Simple for hackathon demo |
| **Deploy** | Vercel + Expo Go | Zero-config deployment |

### Data Model (Simplified)
```
User (Người dùng)
├── phone (primary key, no verification)
├── name
└── region

ByProduct (Đống phụ phẩm)
├── id
├── userId
├── name (VD: "Đống rơm ruộng trên")
├── type (straw | shrimp_shell | hyacinth)
├── status (new | processing | ready_to_harvest)
├── location (GPS)
├── startImageUrl
└── contextData (JSON: current condition)

TimelineEntry (Lịch sử chat)
├── id
├── byproductId
├── timestamp
├── role (user | model)
└── content (text or image URL)
```

### User Journey (3 Steps)
```
1. LOGIN (30s)
   Nhập SĐT → Nhập tên → Bấm "Bắt đầu"

2. CREATE BYPRODUCT (1 min)
   Bấm "+" → Chụp ảnh → Nhập tên → Chọn loại
   → AI phân tích ngay: "Đống rơm này tốt đó bác! 30-45 ngày là xong..."

3. CHAT (3 input modes)
   Mode 1 - VOICE: Bấm mic 🎤 → "Có cần tưới nước không bay?"
   Mode 2 - SELECTION: AI gợi ý 3-4 câu hỏi → Bác chọn nhanh 👆
            • "Có cần tưới nước không?"
            • "Bao lâu nữa thu hoạch?"
            • "Cần đảo đống không?"
   Mode 3 - TEXT: Gõ tay nếu muốn hỏi chi tiết ⌨️
   Mode 4 - PHOTO: Chụp ảnh tiến độ mới 📷

   → AI nhớ context, trả lời dựa trên lịch sử
   → AI tự động tạo 3-4 câu hỏi gợi ý cho lần tiếp theo
```

### Implementation Timeline (36H)
| Phase | Hours | Deliverables |
|-------|-------|--------------|
| **Phase 1: Core** | 0-12h | Database, Auth, Gemini API, Basic UI |
| **Phase 2: Polish** | 12-24h | Error handling, Voice, UI polish, Deploy |
| **Phase 3: Demo** | 24-36h | Bug fixes, Demo script, Presentation |

### Key Simplifications (vs Original Spec)
| Removed ❌ | Kept ✅ | Added ✨ |
|-----------|---------|----------|
| SMS OTP authentication | Simple phone + JWT | **Selection Mode** |
| Offline queue system | Online-only | AI-suggested questions |
| Advanced context (token counting) | Last 5 messages only | 3-4 quick-tap buttons |
| Multi-tier caching | Direct DB queries | Voice + Selection + Text |
| Server image optimization | Mobile compression only | Farmer-friendly UX |
| Push notifications | None | **Chợ Nông Sản (Mock)** |
| Full e-commerce system | None | Demo marketplace UI |
| Docker & CI/CD | Vercel auto-deploy | |
| 15+ error codes | 4 simple errors | |

### Success Metrics (Demo Day)
- ✅ **E2E Flow:** Login → Create → Chat → Photo update (< 3 min)
- ✅ **AI Response:** < 10 seconds
- ✅ **Voice Input:** Works on first try
- ✅ **Vietnamese UX:** Clear, friendly, "Bác Ba Phi" style
- ✅ **WOW Factor:** Live demo with real compost photo

### Risk Mitigation
| Risk | Mitigation |
|------|-----------|
| Gemini rate limit | Max 10 calls/min/user, retry button |
| Poor network | Image compression < 500KB, loading states |
| Image quality | UI hint: "Chụp gần, có ánh sáng" |
| AI timeout | Show error + retry after 2 attempts |

---

# 📐 TECHNICAL ARCHITECTURE

## 1. SYSTEM DESIGN

### 1.1 Architecture Pattern
**Product-Centric AI Chat**: Mỗi phụ phẩm (đống rơm, vỏ tôm) là một phiên chat xuyên suốt, AI "nhớ" toàn bộ lịch sử chăm sóc.

### 1.2 Technology Choices

#### Mobile App (React Native - Expo)
```typescript
interface MobileTechStack {
  framework: 'Expo Go';              // NO custom native code
  version: 'Expo SDK 50+';
  language: 'TypeScript 5.x';
  stateManagement: 'React useState';  // Keep it simple, NO Zustand

  // Core Features
  voiceInput: 'expo-speech';         // Speech-to-Text ONLY (no TTS)
  camera: 'expo-camera';             // Camera access
  imageManipulator: 'expo-image-manipulator'; // Basic compression
  geolocation: 'expo-location';      // GPS coordinates
  storage: 'AsyncStorage';           // Simple local storage

  // UI/UX
  navigation: 'expo-router';         // File-based routing
  uiLibrary: 'React Native Paper';   // Material Design
  icons: 'react-native-vector-icons';

  // Networking
  http: 'fetch';                     // Built-in, no axios needed
  offlineQueue: 'NONE';              // Online-only for MVP
}
```

**Why Expo Go?**
- Zero build time during development
- QR code scan → instant testing on real device
- No need for EAS Build for hackathon demo
- All needed APIs available (camera, speech, location)

#### Backend Server (Next.js 15)
```typescript
interface BackendTechStack {
  framework: 'Next.js 15 API Routes';
  runtime: 'Node.js 20+';
  language: 'TypeScript 5.x';

  // Database
  database: 'Supabase PostgreSQL';   // Managed, free tier
  orm: 'Prisma 5.x';                 // Type-safe ORM

  // File Storage
  fileStorage: 'Supabase Storage';   // Free tier, CDN included
  imageOptimization: 'NONE';         // Mobile does compression

  // Caching
  cache: 'NONE';                     // Direct database queries

  // Authentication
  auth: 'Simple Phone + JWT';        // NO SMS OTP for hackathon
  smsProvider: 'NONE';               // Skip SMS entirely

  // API Design
  apiStyle: 'REST';                  // Simple endpoints
  validation: 'Zod';                 // Runtime validation

  // Deployment
  deployment: 'Vercel';              // Auto-deploy from GitHub
}
```

**Why Next.js 15 API Routes?**
- Serverless by default (no server management)
- Vercel deployment = git push
- TypeScript native support
- Built-in API route handlers

#### AI Integration
```typescript
interface AITechStack {
  provider: 'Google Gemini 1.5 Flash';
  sdk: '@google/generative-ai';
  version: '^0.2.0';

  features: {
    vision: true;                    // Image analysis
    text: true;                      // Chat responses
    multimodal: true;                // Combined image + text
  };

  contextStrategy: 'Last 5 messages'; // Simple, no token counting

  rateLimits: {
    requestsPerMinute: 60;
    tokensPerMinute: 1000000;
  };

  fallback: {
    strategy: 'Show error + retry button';
    maxRetries: 2;
  };
}
```

**Why Gemini 1.5 Flash?**
- Multimodal: Accepts both image + text in one call
- Fast: < 5s response time
- Free tier: 60 RPM (enough for demo)
- Vietnamese support: Good quality
- Vision API: Analyzes compost photos accurately

#### DevOps & Deployment
```typescript
interface DeploymentStack {
  packageManager: 'npm';
  envManagement: 'dotenv';

  // Deployment
  backend: 'Vercel';                 // Free tier, zero config
  mobile: 'Expo Go';                 // No build needed for demo
  database: 'Supabase';              // Managed PostgreSQL

  // Monitoring
  logging: 'console.log';            // That's it for hackathon

  // CI/CD
  ci: 'NONE';                        // Manual deployment
}
```

---

## 2. DATA MODEL

### 2.1 Entity Relationship Diagram
```
┌──────────────┐
│     User     │
├──────────────┤
│ id (PK)      │
│ phone (UQ)   │
│ name         │
│ region       │
│ createdAt    │
└──────┬───────┘
       │ 1:N
       ↓
┌──────────────┐
│  ByProduct   │
├──────────────┤
│ id (PK)      │
│ userId (FK)  │
│ name         │
│ type         │
│ status       │
│ location     │
│ startImageUrl│
│ contextData  │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │ 1:N
       ↓
┌──────────────┐
│TimelineEntry │
├──────────────┤
│ id (PK)      │
│ byproductId  │
│ timestamp    │
│ role         │
│ content      │
│ metadata     │
└──────────────┘
```

### 2.2 TypeScript Interfaces

#### User (Người dùng)
```typescript
export interface User {
  id: string;                        // UUID
  phone: string;                     // Primary identifier (no verification)
  name: string;                      // VD: "Bác Ba Phi"
  region: string;                    // VD: "Cần Thơ", "An Giang"
  createdAt: string;                 // ISO Date
}
```

#### AgriByProduct (Đống phụ phẩm)
```typescript
export interface AgriByProduct {
  id: string;                        // UUID
  userId: string;
  name: string;                      // VD: "Đống rơm ruộng trên"
  type: ByProductType;
  status: ByProductStatus;
  createdAt: string;                 // ISO Date
  updatedAt: string;

  // Simple context (JSON field)
  contextData: {
    location: string;                // GPS "lat,lng"
    startImageUrl: string;           // Initial photo
    currentCondition: string;        // Simple text summary
    decompositionLevel?: number;     // 0-100%
  };
}

export type ByProductType = 'straw' | 'shrimp_shell' | 'hyacinth' | 'unknown';
export type ByProductStatus = 'new' | 'processing' | 'ready_to_harvest';
```

#### TimelineEntry (Lịch sử tương tác)
```typescript
export interface TimelineEntry {
  id: string;                        // UUID
  byproductId: string;
  timestamp: number;                 // Unix timestamp (ms)
  role: 'user' | 'model';
  content: string;                   // Text or image URL
  metadata?: {
    imageUrl?: string;               // If this entry has an image
    voiceInput?: boolean;            // If from voice input
    decompositionLevel?: number;     // Snapshot at this time
  };
}
```

### 2.3 AI Response Schema

```typescript
export interface AIAnalysisResult {
  byproductId: string;
  timestamp: number;

  // Simple assessment
  decompositionLevel: number;        // 0-100%

  // Main recommendation
  recommendation: {
    action: string;                  // VD: "Tưới nước"
    reason: string;                  // Why
    estimatedDays: number | null;    // Days until ready
  };

  // Simple chat response (Vietnamese)
  chatResponse: string;

  // Suggested questions for Selection Mode (NEW!)
  suggestedQuestions?: string[];     // 3-4 câu hỏi gợi ý
}

// Example AI Response with Selection Mode
const exampleResponse: AIAnalysisResult = {
  byproductId: 'abc123',
  timestamp: Date.now(),
  decompositionLevel: 15,
  recommendation: {
    action: 'Tưới nước',
    reason: 'Đống rơm hơi khô, cần giữ ẩm 60-70%',
    estimatedDays: 35,
  },
  chatResponse: 'Đống rơm đang khô, bác cần tưới nước đẫm nhé!',
  suggestedQuestions: [
    'Có cần tưới nước không bay?',
    'Bao lâu nữa thu hoạch được?',
    'Cần đảo đống không?',
    'Nhiệt độ thế nào là tốt?',
  ],
};
```

### 2.4 Error Types

```typescript
export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  AI_ERROR = 'AI_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
}

export interface AppError {
  code: ErrorCode;
  userMessage: string;               // Vietnamese only
}

// Simple Vietnamese Messages
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Không có mạng, thử lại nha bác',
  SERVER_ERROR: 'Lỗi hệ thống, thử lại sau',
  AI_ERROR: 'AI đang bận, thử lại sau ít phút',
  INVALID_INPUT: 'Thông tin không hợp lệ, kiểm tra lại nha',
};
```

---

## 3. DATABASE SCHEMA (PRISMA)

### 3.1 Prisma Schema Definition
```prisma
// File: backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String      @id @default(uuid())
  phone     String      @unique
  name      String
  region    String      @default("ĐBSCL")
  createdAt DateTime    @default(now())

  byproducts ByProduct[]

  @@index([phone])
  @@map("users")
}

model ByProduct {
  id           String            @id @default(uuid())
  userId       String
  name         String
  type         ByProductType     @default(unknown)
  status       ByProductStatus   @default(new)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  // Simple JSON context
  location     String            // "lat,lng"
  startImageUrl String
  contextData  Json              // Store everything as JSON

  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  timeline     TimelineEntry[]

  @@index([userId])
  @@index([createdAt])
  @@map("byproducts")
}

model TimelineEntry {
  id          String         @id @default(uuid())
  byproductId String
  timestamp   BigInt         // Unix ms
  role        String         // 'user' | 'model'
  content     String         @db.Text
  metadata    Json?          // Optional extra data

  byproduct   ByProduct      @relation(fields: [byproductId], references: [id], onDelete: Cascade)

  @@index([byproductId, timestamp])
  @@map("timeline_entries")
}

enum ByProductType {
  straw
  shrimp_shell
  hyacinth
  unknown
}

enum ByProductStatus {
  new
  processing
  ready_to_harvest
}
```

### 3.2 Migration Commands
```bash
# Initialize Prisma
npx prisma init

# Generate migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# View database in browser
npx prisma studio
```

---

## 4. API CONTRACTS

### 4.1 Authentication Endpoints

#### POST /api/auth/login
**Request:**
```typescript
interface LoginRequest {
  phone: string;                     // Any 10-digit number
  name?: string;                     // Optional for first-time users
}
```

**Response:**
```typescript
interface LoginResponse {
  success: boolean;
  accessToken: string;               // JWT, 7 days expiry
  user: User;
}
```

**Example:**
```bash
curl -X POST https://api.agriloop.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0912345678",
    "name": "Bác Ba Phi"
  }'
```

### 4.2 ByProduct Endpoints

#### POST /api/byproducts
**Request:** (multipart/form-data)
```typescript
interface CreateByProductRequest {
  name: string;
  type: ByProductType;
  location: string;                  // "lat,lng"
  image: File;                       // FormData
}
```

**Response:**
```typescript
interface CreateByProductResponse {
  success: boolean;
  byproduct: AgriByProduct;
  initialAnalysis: AIAnalysisResult;
}
```

#### GET /api/byproducts
**Response:**
```typescript
interface GetByProductsResponse {
  success: boolean;
  data: AgriByProduct[];
}
```

#### GET /api/byproducts/:id
**Response:**
```typescript
interface GetByProductResponse {
  success: boolean;
  byproduct: AgriByProduct;
  timeline: TimelineEntry[];         // Last 20 entries
}
```

#### POST /api/byproducts/:id/chat
**Request:** (multipart/form-data, optional fields)
```typescript
interface ChatRequest {
  text?: string;                     // User question
  image?: File;                      // Optional new image
}
```

**Response:**
```typescript
interface ChatResponse {
  success: boolean;
  analysis: AIAnalysisResult;
  timeline: TimelineEntry[];         // Updated timeline
}
```

### 4.3 Health Check

#### GET /api/health
**Response:**
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded';
  timestamp: number;
  services: {
    database: 'up' | 'down';
    gemini: 'up' | 'down';
    storage: 'up' | 'down';
  };
}
```

---

## 5. IMPLEMENTATION CODE

### 5.1 Authentication (Simple Phone + JWT)

```typescript
// File: backend/src/app/api/auth/login/route.ts

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
        { success: false, error: { code: 'INVALID_INPUT', userMessage: 'Số điện thoại không hợp lệ' } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', userMessage: 'Lỗi hệ thống' } },
      { status: 500 }
    );
  }
}
```

### 5.2 Auth Middleware

```typescript
// File: backend/src/middleware/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextRequest {
  user?: { userId: string; phone: string };
}

export function requireAuth(handler: Function) {
  return async (req: AuthenticatedRequest, context: any) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'NETWORK_ERROR', userMessage: 'Bác cần đăng nhập' } },
        { status: 401 }
      );
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = payload;
      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: { code: 'NETWORK_ERROR', userMessage: 'Hết phiên, đăng nhập lại nha' } },
        { status: 401 }
      );
    }
  };
}
```

### 5.3 Context Manager (Simple)

```typescript
// File: backend/src/lib/contextManager.ts

import { AgriByProduct, TimelineEntry, ByProductType } from '@prisma/client';

export class SimpleContextManager {
  buildPrompt(
    byproduct: AgriByProduct,
    recentTimeline: TimelineEntry[],
    userInput: string
  ): string {
    const systemPrompt = this.getSystemPrompt(byproduct.type);
    const recentHistory = recentTimeline
      .slice(-5)  // Last 5 only
      .map(e => `${e.role}: ${e.content}`)
      .join('\n');

    const contextData = byproduct.contextData as any;

    return `
${systemPrompt}

ĐỐNG Ủ HIỆN TẠI:
- Tên: ${byproduct.name}
- Loại: ${this.translateType(byproduct.type)}
- Độ phân hủy hiện tại: ${contextData.decompositionLevel || 0}%
- Vị trí: ${byproduct.location}

LỊCH SỬ GẦN ĐÂY:
${recentHistory || 'Chưa có lịch sử'}

CÂU HỎI MỚI:
${userInput}

QUAN TRỌNG - FORMAT TRẢ LỜI:
1. Trả lời câu hỏi bằng tiếng Việt, giọng miền Tây, thân thiện. Gọi người dùng là "bác".
2. Sau khi trả lời, đề xuất 3-4 câu hỏi tiếp theo mà bác có thể quan tâm, format:

SUGGESTED_QUESTIONS:
- Câu hỏi 1?
- Câu hỏi 2?
- Câu hỏi 3?
- Câu hỏi 4?
`.trim();
  }

  private getSystemPrompt(type: ByProductType): string {
    const prompts = {
      straw: `Bạn là chuyên gia ủ rơm rạ ở ĐBSCL.
Rơm rạ cần 30-45 ngày để phân hủy hoàn toàn.
Độ ẩm lý tưởng: 60-70%.
Nhiệt độ tốt: 50-60°C trong giai đoạn phân hủy mạnh.
Cần đảo đống 3-4 lần trong quá trình ủ.`,

      shrimp_shell: `Bạn là chuyên gia xử lý vỏ tôm ở ĐBSCL.
Vỏ tôm cần 60-90 ngày để phân hủy.
Nên nghiền nhỏ trước khi ủ để nhanh hơn.
Có thể trộn với rơm rạ hoặc mùn cưa.
Sản phẩm cuối giàu chitin, canxi, protein.`,

      hyacinth: `Bạn là chuyên gia xử lý bèo tây ở ĐBSCL.
Bèo tây cần 20-30 ngày để phân hủy.
Độ ẩm cao, cần phơi khô bớt trước khi ủ.
Trộn với rơm để cân bằng độ ẩm.`,

      unknown: `Bạn là chuyên gia xử lý phụ phẩm nông nghiệp ở ĐBSCL.
Tư vấn dựa trên hình ảnh và câu hỏi của nông dân.`,
    };

    return prompts[type] || prompts.unknown;
  }

  private translateType(type: ByProductType): string {
    const translations = {
      straw: 'Rơm rạ',
      shrimp_shell: 'Vỏ tôm',
      hyacinth: 'Bèo tây',
      unknown: 'Chưa xác định',
    };
    return translations[type] || type;
  }
}
```

### 5.4 Gemini API Integration

```typescript
// File: backend/src/lib/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeWithGemini(
  prompt: string,
  imageBase64?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const parts: any[] = [{ text: prompt }];

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  const result = await model.generateContent(parts);
  const response = await result.response;
  return response.text();
}

export async function parseAIResponse(rawResponse: string): Promise<{
  decompositionLevel: number;
  recommendation: {
    action: string;
    reason: string;
    estimatedDays: number | null;
  };
  chatResponse: string;
  suggestedQuestions?: string[];  // NEW: Selection mode questions
}> {
  // Simple parsing: Extract structured data from AI response
  // For MVP, AI returns plain text, we extract key info with regex

  const decompositionMatch = rawResponse.match(/(\d+)%/);
  const decompositionLevel = decompositionMatch
    ? parseInt(decompositionMatch[1])
    : 0;

  const daysMatch = rawResponse.match(/(\d+)\s*(ngày|tuần)/i);
  const estimatedDays = daysMatch
    ? (daysMatch[2].includes('tuần') ? parseInt(daysMatch[1]) * 7 : parseInt(daysMatch[1]))
    : null;

  // Extract suggested questions (NEW!)
  const suggestedQuestions: string[] = [];
  const questionsMatch = rawResponse.match(/SUGGESTED_QUESTIONS:([\s\S]*?)(?:\n\n|$)/);

  if (questionsMatch) {
    const questionsText = questionsMatch[1];
    const questions = questionsText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(q => q.length > 0);

    suggestedQuestions.push(...questions);
  }

  // Remove SUGGESTED_QUESTIONS section from chat response
  const chatResponse = rawResponse.replace(/SUGGESTED_QUESTIONS:[\s\S]*$/, '').trim();

  return {
    decompositionLevel,
    recommendation: {
      action: 'Tiếp tục theo dõi',
      reason: 'Dựa trên phân tích AI',
      estimatedDays,
    },
    chatResponse,
    suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
  };
}
```

### 5.5 Create ByProduct Endpoint

```typescript
// File: backend/src/app/api/byproducts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import prisma from '@/lib/prisma';
import { uploadToSupabase } from '@/lib/storage';
import { SimpleContextManager } from '@/lib/contextManager';
import { analyzeWithGemini, parseAIResponse } from '@/lib/gemini';

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const image = formData.get('image') as File;

    if (!name || !type || !location || !image) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', userMessage: 'Thiếu thông tin' } },
        { status: 400 }
      );
    }

    // 1. Upload image to Supabase
    const imageBuffer = Buffer.from(await image.arrayBuffer());
    const imageUrl = await uploadToSupabase(imageBuffer, `${Date.now()}.jpg`);

    // 2. Create ByProduct in database
    const byproduct = await prisma.byProduct.create({
      data: {
        userId: req.user!.userId,
        name,
        type: type as any,
        status: 'new',
        location,
        startImageUrl: imageUrl,
        contextData: {
          location,
          startImageUrl: imageUrl,
          currentCondition: 'Mới tạo',
          decompositionLevel: 0,
        },
      },
    });

    // 3. Initial AI analysis
    const contextManager = new SimpleContextManager();
    const prompt = contextManager.buildPrompt(
      byproduct as any,
      [],
      `Phân tích đống ${type} này và cho lời khuyên ban đầu.`
    );

    const imageBase64 = imageBuffer.toString('base64');
    const aiResponse = await analyzeWithGemini(prompt, imageBase64);
    const analysis = await parseAIResponse(aiResponse);

    // 4. Save AI response to timeline
    await prisma.timelineEntry.create({
      data: {
        byproductId: byproduct.id,
        timestamp: BigInt(Date.now()),
        role: 'model',
        content: analysis.chatResponse,
        metadata: {
          decompositionLevel: analysis.decompositionLevel,
        },
      },
    });

    // 5. Update byproduct with initial analysis
    await prisma.byProduct.update({
      where: { id: byproduct.id },
      data: {
        contextData: {
          ...byproduct.contextData as any,
          decompositionLevel: analysis.decompositionLevel,
        },
      },
    });

    return NextResponse.json({
      success: true,
      byproduct,
      initialAnalysis: {
        byproductId: byproduct.id,
        timestamp: Date.now(),
        ...analysis,
      },
    });

  } catch (error) {
    console.error('Create byproduct error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', userMessage: 'Lỗi tạo đống ủ' } },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  try {
    const byproducts = await prisma.byProduct.findMany({
      where: { userId: req.user!.userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: byproducts,
    });

  } catch (error) {
    console.error('Get byproducts error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', userMessage: 'Lỗi tải danh sách' } },
      { status: 500 }
    );
  }
});
```

### 5.6 Supabase Storage Helper

```typescript
// File: backend/src/lib/storage.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function uploadToSupabase(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('agriloop-byproducts')
    .upload(filename, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('agriloop-byproducts')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}
```

### 5.7 Chat Endpoint

```typescript
// File: backend/src/app/api/byproducts/[id]/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import prisma from '@/lib/prisma';
import { uploadToSupabase } from '@/lib/storage';
import { SimpleContextManager } from '@/lib/contextManager';
import { analyzeWithGemini, parseAIResponse } from '@/lib/gemini';

export const POST = requireAuth(async (
  req: AuthenticatedRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const byproductId = params.id;
    const formData = await req.formData();
    const text = formData.get('text') as string | null;
    const image = formData.get('image') as File | null;

    if (!text && !image) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', userMessage: 'Cần có câu hỏi hoặc ảnh' } },
        { status: 400 }
      );
    }

    // 1. Get byproduct and recent timeline
    const byproduct = await prisma.byProduct.findUnique({
      where: { id: byproductId },
      include: {
        timeline: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });

    if (!byproduct || byproduct.userId !== req.user!.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', userMessage: 'Không tìm thấy đống ủ' } },
        { status: 404 }
      );
    }

    // 2. Upload image if provided
    let imageUrl: string | undefined;
    let imageBase64: string | undefined;

    if (image) {
      const imageBuffer = Buffer.from(await image.arrayBuffer());
      imageUrl = await uploadToSupabase(imageBuffer, `${byproductId}-${Date.now()}.jpg`);
      imageBase64 = imageBuffer.toString('base64');
    }

    // 3. Save user input to timeline
    const userContent = text || `[Đã chụp ảnh mới]`;
    await prisma.timelineEntry.create({
      data: {
        byproductId,
        timestamp: BigInt(Date.now()),
        role: 'user',
        content: userContent,
        metadata: imageUrl ? { imageUrl } : undefined,
      },
    });

    // 4. Build context and call Gemini
    const contextManager = new SimpleContextManager();
    const prompt = contextManager.buildPrompt(
      byproduct as any,
      byproduct.timeline.reverse(),
      text || 'Phân tích ảnh mới này.'
    );

    const aiResponse = await analyzeWithGemini(prompt, imageBase64);
    const analysis = await parseAIResponse(aiResponse);

    // 5. Save AI response to timeline
    await prisma.timelineEntry.create({
      data: {
        byproductId,
        timestamp: BigInt(Date.now()),
        role: 'model',
        content: analysis.chatResponse,
        metadata: {
          decompositionLevel: analysis.decompositionLevel,
        },
      },
    });

    // 6. Update byproduct context
    await prisma.byProduct.update({
      where: { id: byproductId },
      data: {
        status: analysis.decompositionLevel >= 80 ? 'ready_to_harvest' : 'processing',
        contextData: {
          ...(byproduct.contextData as any),
          decompositionLevel: analysis.decompositionLevel,
          lastUpdated: Date.now(),
        },
      },
    });

    // 7. Get updated timeline
    const updatedTimeline = await prisma.timelineEntry.findMany({
      where: { byproductId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      analysis: {
        byproductId,
        timestamp: Date.now(),
        ...analysis,
      },
      timeline: updatedTimeline,
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', userMessage: 'AI đang bận, thử lại sau' } },
      { status: 500 }
    );
  }
});
```

### 5.8 Retry Wrapper

```typescript
// File: backend/src/lib/retry.ts

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await sleep(delay * (i + 1)); // 1s, 2s
      }
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 5.9 Mobile: Image Compression

```typescript
// File: mobile/src/utils/imageCompression.ts

import * as ImageManipulator from 'expo-image-manipulator';

export async function compressImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1920 } }], // Maintain aspect ratio
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return result.uri;
}
```

### 5.10 Mobile: API Client

```typescript
// File: mobile/src/api/client.ts

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export class APIClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async login(phone: string, name?: string) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });

    const data = await response.json();

    if (data.success) {
      this.setToken(data.accessToken);
    }

    return data;
  }

  async createByProduct(name: string, type: string, location: string, imageUri: string) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('location', location);

    // @ts-ignore
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    const response = await fetch(`${API_URL}/api/byproducts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }

  async getByProducts() {
    const response = await fetch(`${API_URL}/api/byproducts`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    return response.json();
  }

  async chat(byproductId: string, text?: string, imageUri?: string) {
    const formData = new FormData();
    if (text) formData.append('text', text);

    if (imageUri) {
      // @ts-ignore
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
    }

    const response = await fetch(`${API_URL}/api/byproducts/${byproductId}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    return response.json();
  }
}

export const apiClient = new APIClient();
```

---

## 6. USER FLOWS

### 6.1 Login Flow
```
┌─────────────────┐
│  Open App       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Phone     │  ← Nhập: "0912345678"
│ Enter Name      │  ← Nhập: "Bác Ba Phi" (nếu lần đầu)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tap "Bắt đầu"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /api/auth/login
│  → Find/Create User
│  → Generate JWT
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save Token      │
│ Navigate to     │
│ Dashboard       │
└─────────────────┘
```

### 6.2 Create ByProduct Flow
```
┌─────────────────┐
│  Dashboard      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tap "+" Button  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Camera Screen   │
│ Take Photo      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compress Image  │  ← expo-image-manipulator
│ Get GPS         │  ← expo-location
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Fill Form       │
│ - Name          │  ← "Đống rơm ruộng trên"
│ - Type          │  ← Select: Rơm rạ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tap "Tạo mới"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /api/byproducts
│ → Upload image to Supabase
│ → Create ByProduct record
│ → Call Gemini API
│ → Save initial analysis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Result     │
│ "Đống rơm này   │
│ tốt đó bác!     │
│ 30-45 ngày xong"│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ Detail Screen   │
└─────────────────┘
```

### 6.3 Chat Flow (3 Input Modes)
```
┌─────────────────┐
│ Detail Screen   │
│ - Photo         │
│ - AI Response   │
│ - Suggested Q's │  ← NEW: 3-4 câu hỏi gợi ý
│ - Timeline      │
│ - Input Box     │
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
    ▼         ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Voice  │ │Selection│ │  Text  │
│ Input  │ │  Mode   │ │  Input │
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    │ expo-   │ Tap     │ Manual
    │ speech  │ button  │ typing
    │ (STT)   │         │
    └────┬─────┴─────┬───┘
         │           │
         ▼           ▼
┌─────────────────────────┐
│ POST /api/byproducts/:id/chat
│ → Get recent timeline (5 entries)
│ → Build context prompt (with selection instruction)
│ → Call Gemini API
│ → Parse response + extract suggested questions
│ → Save to timeline
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Update UI               │
│ - New user msg          │
│ - AI response           │
│ - NEW: 3-4 suggested Q's│
│   as big buttons        │
│ - Typing effect         │
└─────────────────────────┘
```

---

## 7. CHỢ NÔNG SẢN (MOCK MARKETPLACE)

### 7.1 Business Rationale
**Purpose:** Demonstration-only feature to showcase future monetization potential and project sustainability.

**NOT for MVP implementation:** This is a "khè" feature - mock UI with fake data to convince judges that:
1. ✅ The project can be self-sustaining (không cần ngân sách nhà nước mãi mãi)
2. ✅ Revenue streams exist (ads, enterprise partnerships, commission)
3. ✅ Ecosystem can grow (farmers → products → consumers → circular economy)

**Reality:** Implementing a real e-commerce platform is out of scope for 36-hour hackathon. We only need:
- 1 screen with product grid
- Fake product data (hardcoded JSON)
- Basic UI (no cart, no payment, no checkout)

### 7.2 Mock UI Design

#### Screen: "Chợ Nông Sản" Tab
```
┌─────────────────────────────────────┐
│ 🌾 Chợ Nông Sản ĐBSCL               │  ← Tab in bottom nav
├─────────────────────────────────────┤
│ 🔍 Search: "phân bón hữu cơ..."     │
├─────────────────────────────────────┤
│                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ 📦     │  │ 🧪     │  │ 🌱     ││
│  │ Phân   │  │ Giá    │  │ Giun   ││
│  │ Rơm Rạ │  │ Trấu   │  │ Quế    ││
│  │        │  │ Tươi   │  │ Đất    ││
│  │ 50k/kg │  │ 30k/kg │  │ 100k/kg││
│  └────────┘  └────────┘  └────────┘│
│                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ 🦐     │  │ 🌾     │  │ 🥬     ││
│  │ Bột    │  │ Phân   │  │ Rau    ││
│  │ Vỏ Tôm │  │ Bèo    │  │ Sạch   ││
│  │ Canxi  │  │ Tây    │  │ Hữu Cơ ││
│  │ 80k/kg │  │ 40k/kg │  │ 25k/mó ││
│  └────────┘  └────────┘  └────────┘│
│                                     │
│  📌 Lưu ý: Đây là demo, chưa mua   │
│     được. Coming soon! 🚧           │
└─────────────────────────────────────┘
```

#### Product Detail (Optional, if time allows)
```
┌─────────────────────────────────────┐
│ 📦 Phân Rơm Rạ Đã Ủ                │
├─────────────────────────────────────┤
│  [Large Product Image]              │
│                                     │
│  💰 Giá: 50,000đ / kg               │
│  📍 Cần Thơ, ĐBSCL                 │
│  ⭐ 4.8 (125 đánh giá)              │
│                                     │
│  📝 Mô tả:                          │
│  Phân rơm rạ ủ hoàn chỉnh sau 45    │
│  ngày. Giàu chất hữu cơ, cải thiện  │
│  đất trồng trọt. Không hóa chất.    │
│                                     │
│  👨‍🌾 Người bán: Bác Ba Phi         │
│                                     │
│  🚧 [Liên hệ mua] (coming soon)    │
└─────────────────────────────────────┘
```

### 7.3 Mock Data Structure

```typescript
// File: mobile/src/data/mockProducts.ts

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  priceVND: number;
  unit: string;                      // 'kg', 'mó', 'bao'
  category: ProductCategory;
  imageUrl: string;                  // Placeholder image
  location: string;
  rating: number;                    // 0-5
  reviewCount: number;
  sellerName: string;
  tags: string[];                    // ['hữu cơ', 'ĐBSCL', 'tái chế']
}

export enum ProductCategory {
  COMPOST = 'compost',               // Phân bón hữu cơ
  FERTILIZER = 'fertilizer',         // Phân bón khác
  VEGETABLES = 'vegetables',         // Rau sạch
  BYPRODUCT = 'byproduct',           // Sản phẩm từ phụ phẩm
}

// MOCK DATA (Hardcoded - NO BACKEND)
export const MOCK_PRODUCTS: MarketplaceProduct[] = [
  {
    id: '1',
    name: 'Phân Rơm Rạ Đã Ủ',
    description: 'Phân rơm rạ ủ hoàn chỉnh sau 45 ngày. Giàu chất hữu cơ, cải thiện đất trồng trọt.',
    priceVND: 50000,
    unit: 'kg',
    category: ProductCategory.COMPOST,
    imageUrl: 'https://placehold.co/400x300/8B4513/FFF?text=Phân+Rơm',
    location: 'Cần Thơ',
    rating: 4.8,
    reviewCount: 125,
    sellerName: 'Bác Ba Phi',
    tags: ['hữu cơ', 'ĐBSCL', 'tái chế'],
  },
  {
    id: '2',
    name: 'Giấm Trấu Tươi',
    description: 'Giấm trấu lên men tự nhiên, giàu vi sinh vật, tốt cho đất.',
    priceVND: 30000,
    unit: 'kg',
    category: ProductCategory.FERTILIZER,
    imageUrl: 'https://placehold.co/400x300/8B6914/FFF?text=Giấm+Trấu',
    location: 'An Giang',
    rating: 4.5,
    reviewCount: 89,
    sellerName: 'Hợp tác xã Thạnh Phú',
    tags: ['tự nhiên', 'vi sinh'],
  },
  {
    id: '3',
    name: 'Giun Quế Đất Ủ',
    description: 'Đất giun quế chất lượng cao, phù hợp trồng rau sạch.',
    priceVND: 100000,
    unit: 'kg',
    category: ProductCategory.COMPOST,
    imageUrl: 'https://placehold.co/400x300/654321/FFF?text=Giun+Quế',
    location: 'Vĩnh Long',
    rating: 4.9,
    reviewCount: 203,
    sellerName: 'Trang trại Xanh',
    tags: ['cao cấp', 'giun quế'],
  },
  {
    id: '4',
    name: 'Bột Vỏ Tôm (Canxi)',
    description: 'Bột vỏ tôm nghiền mịn, giàu canxi và chitin, tốt cho cây trồng.',
    priceVND: 80000,
    unit: 'kg',
    category: ProductCategory.BYPRODUCT,
    imageUrl: 'https://placehold.co/400x300/FF6347/FFF?text=Bột+Vỏ+Tôm',
    location: 'Sóc Trăng',
    rating: 4.6,
    reviewCount: 67,
    sellerName: 'HTX Nuôi Tôm Miền Tây',
    tags: ['vỏ tôm', 'canxi', 'protein'],
  },
  {
    id: '5',
    name: 'Phân Bèo Tây Ủ',
    description: 'Bèo tây phân hủy hoàn toàn, giàu đạm, thích hợp cho ruộng lúa.',
    priceVND: 40000,
    unit: 'kg',
    category: ProductCategory.COMPOST,
    imageUrl: 'https://placehold.co/400x300/228B22/FFF?text=Phân+Bèo',
    location: 'Đồng Tháp',
    rating: 4.4,
    reviewCount: 51,
    sellerName: 'Bác Sáu Minh',
    tags: ['bèo tây', 'đạm cao'],
  },
  {
    id: '6',
    name: 'Rau Sạch Hữu Cơ',
    description: 'Rau cải ngọt trồng bằng phân hữu cơ từ phụ phẩm nông nghiệp.',
    priceVND: 25000,
    unit: 'mó',
    category: ProductCategory.VEGETABLES,
    imageUrl: 'https://placehold.co/400x300/32CD32/FFF?text=Rau+Sạch',
    location: 'Cần Thơ',
    rating: 5.0,
    reviewCount: 342,
    sellerName: 'Vườn Xanh Miền Tây',
    tags: ['rau sạch', 'hữu cơ'],
  },
];
```

### 7.4 UI Implementation (Mobile)

```typescript
// File: mobile/src/screens/MarketplaceScreen.tsx

import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export default function MarketplaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌾 Chợ Nông Sản ĐBSCL</Text>

      {/* Disclaimer Banner */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          📌 Đây là demo, chưa mua được. Coming soon! 🚧
        </Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={MOCK_PRODUCTS}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
            />
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>
              {item.priceVND.toLocaleString('vi-VN')}đ/{item.unit}
            </Text>
            <Text style={styles.productLocation}>📍 {item.location}</Text>
            <Text style={styles.productRating}>
              ⭐ {item.rating} ({item.reviewCount})
            </Text>
          </View>
        )}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  disclaimer: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#F57C00',
    textAlign: 'center',
  },
  grid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productLocation: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  productRating: {
    fontSize: 12,
    color: '#FFA000',
  },
});
```

### 7.5 Navigation Integration

```typescript
// File: mobile/src/navigation/AppNavigator.tsx

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '🏠 Trang chủ',
          tabBarIcon: () => '🏠',
        }}
      />

      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          title: '🛒 Chợ Nông Sản',
          tabBarIcon: () => '🛒',
        }}
      />
    </Tab.Navigator>
  );
}
```

### 7.6 Pitch Talking Points (for Demo)

**When showing this screen to judges:**

> *"Ngoài việc giúp nông dân xử lý phụ phẩm, chúng tôi còn tạo một marketplace để:*
>
> 1. **Bán sản phẩm tái chế:** Phân bón hữu cơ, đất giun quế, bột vỏ tôm... từ chính quá trình ủ phân
> 2. **Tạo thu nhập:** Nông dân không chỉ giải quyết phế thải, còn kiếm thêm từ bán sản phẩm
> 3. **Monetization:** Chúng tôi có thể chạy ads doanh nghiệp (phân bón, máy móc), hoa hồng giao dịch (2-5%), và partnership với hợp tác xã
> 4. **Circular Economy:** Phụ phẩm → Ủ phân → Bán sản phẩm → Trồng rau sạch → Vòng tròn khép kín
>
> *Demo này chỉ là mockup, nhưng sau hackathon, đây sẽ là hướng phát triển chính để dự án tự nuôi sống, không phụ thuộc tài trợ.*"

**Key Messages:**
- ✅ Project sustainability (tự nuôi sống)
- ✅ Revenue model exists (ads, commission, partnerships)
- ✅ Social impact + Economic viability
- ✅ "We're not just tech, we're building an ecosystem"

### 7.7 Implementation Priority

**Priority:** P2 - DEMO ONLY (lowest priority)

**When to build:**
- ⏰ Only if Phase 1 + 2 are complete with time to spare (24-30h mark)
- ⏰ Or build in last 2-3 hours before demo for "wow factor"

**What to build:**
1. ✅ 1 screen with hardcoded products (1 hour)
2. ✅ Bottom tab navigation (30 min)
3. ❌ NO backend API
4. ❌ NO cart system
5. ❌ NO payment integration
6. ❌ NO user ratings (fake data only)

**Total time:** ~1.5 hours maximum

### 7.8 Alternatives (if no time)

If we run out of time, we can:

1. **Pitch-only (no code):** Show mockup screenshots in presentation slides
2. **Static image:** Single image of marketplace UI in app as "Coming Soon"
3. **Skip entirely:** Focus on core AI chat feature (still strong pitch without marketplace)

**Recommendation:** Build if time allows, otherwise just show slides during pitch.

---

## 8. ENVIRONMENT SETUP

### 8.1 Backend .env
```bash
# File: backend/.env

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# JWT
JWT_SECRET=<openssl rand -base64 32>

# Gemini AI
GEMINI_API_KEY=<your-google-api-key>

# Supabase Storage
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=<public-anon-key>
SUPABASE_SERVICE_KEY=<private-service-role-key>

# App
NODE_ENV=development
```

### 8.2 Mobile .env
```bash
# File: mobile/.env

EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 8.3 Setup Commands
```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev

# Mobile
cd mobile
npm install
npx expo start
```

---

## 9. DEPLOYMENT

### 9.1 Vercel (Backend)
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
cd backend
vercel --prod

# 4. Set environment variables in Vercel dashboard
# DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.
```

### 9.2 Expo Go (Mobile)
```bash
# For demo, just use Expo Go app
cd mobile
npx expo start

# Scan QR code with:
# - iOS: Camera app
# - Android: Expo Go app
```

---

## 10. TESTING CHECKLIST

### 10.1 Happy Path
- [ ] Login: Nhập SĐT → Tạo user mới → Nhận JWT
- [ ] Create: Chụp ảnh → Fill form → Upload → AI phân tích < 10s
- [ ] Chat (text): Gõ "Có cần tưới nước không?" → AI trả lời
- [ ] Chat (voice): Bấm mic → Nói → STT → AI trả lời
- [ ] Chat (image): Chụp ảnh mới → AI so sánh với ảnh cũ
- [ ] Timeline: Xem lịch sử 20 entry gần nhất

### 10.2 Edge Cases
- [ ] Poor network: Hiển thị loading, timeout sau 30s
- [ ] Large image: Nén xuống < 500KB
- [ ] Gemini timeout: Retry 2 lần, show error
- [ ] Invalid phone: Show "Số điện thoại không hợp lệ"
- [ ] Empty timeline: Show placeholder "Chưa có trò chuyện"

---

## 11. DEMO SCRIPT (3 MINUTES)

### Scene 1: Login (30s)
**Narration:** *"Tôi là nông dân Cần Thơ, vừa thu hoạch lúa xong. Tôi nghe nói có app AI giúp ủ phân từ rơm rạ."*

**Actions:**
1. Mở app Agri-Loop
2. Nhập SĐT: `0912345678`
3. Nhập tên: `Bác Ba Phi`
4. Bấm **"Bắt đầu"**
5. → Vào Dashboard

---

### Scene 2: Tạo đống ủ mới (1 min)
**Narration:** *"Tôi chụp ảnh đống rơm này để AI phân tích."*

**Actions:**
1. Bấm nút **"+"** to đùng
2. Chụp ảnh đống rơm (hoặc chọn từ thư viện)
3. Nhập tên: `Đống rơm ruộng sau nhà`
4. Chọn loại: **Rơm rạ**
5. Bấm **"Tạo mới"**

**AI Response (hiển thị):**
```
Đống rơm này tốt đó bác! Màu vàng đẹp, rơm khô ráo.

Độ phân hủy hiện tại: 0% (mới bắt đầu)

KHUYÊN BÁC:
- Tưới nước cho ướt đẫm, khoảng 60-70% độ ẩm
- Thêm phân đạm hoặc phân chuồng nếu có
- Che phủ bằng bạt để giữ ẩm

Ước tính: Khoảng 30-45 ngày nữa là thu hoạch được.

3 ngày nữa kiểm tra lại nha bác!
```

---

### Scene 3: Chat với AI (1 min)
**Narration:** *"Tôi hỏi thêm vài câu."*

**Actions:**
1. Vào chi tiết đống ủ
2. Gõ: `Có cần đảo đống không bay?`

**AI Response:**
```
Cần đó bác! Nhưng chưa đâu, đợi khoảng 5-7 ngày nữa,
khi nhiệt độ lên cao (nóng tay khi sờ vào) thì đảo lần đầu.

Đảo giúp oxy vào, phân hủy nhanh hơn.
Tổng cộng đảo 3-4 lần trong suốt quá trình ủ.
```

**NEW: AI hiển thị 4 nút gợi ý (Selection Mode):**
```
┌────────────────────────────────────┐
│ Bác có thể hỏi thêm:               │
├────────────────────────────────────┤
│ [Bao lâu nữa thu hoạch được?     ]│ ← Bấm nút này
│ [Có cần thêm phân đạm không?     ]│
│ [Nhiệt độ thế nào là tốt?        ]│
│ [Phải tưới nước bao nhiêu lít?   ]│
└────────────────────────────────────┘
```

3. Bác bấm nút **"Bao lâu nữa thu hoạch được?"** (Selection Mode)
   → Không cần gõ, không cần nói, chỉ bấm!

**AI Response:**
```
Khoảng 35-40 ngày nữa bác nhé, tính từ hôm nay.

Dấu hiệu chín:
- Màu nâu đen
- Mùi đất ẩm
- Mềm, dễ vỡ khi nắm

Bác cứ chụp ảnh cho tôi xem mỗi tuần, tôi báo cho bác biết!
```

**AI hiển thị nút gợi ý mới:**
```
┌────────────────────────────────────┐
│ [Làm sao biết nhiệt độ đúng?     ]│
│ [Có cần che mưa không?           ]│
│ [Đảo như thế nào cho đúng?       ]│
└────────────────────────────────────┘
```

---

### Scene 4: Update tiến độ (30s)
**Narration:** *"3 ngày sau, tôi đã tưới nước và đảo đống. Chụp ảnh cho AI xem tiến độ."*

**Actions:**
1. Bấm nút **Camera 📷** trong chat
2. Chụp ảnh đống rơm (đã ướt, màu tối hơn)
3. Gửi

**AI Response:**
```
Đẹp lắm bác! Đã ướt đẫm, màu tối hơn hẳn rồi.

Độ phân hủy: 15% (tăng từ 0%)

Nhiệt độ đang lên cao, đúng rồi đó! Tiếp tục giữ ẩm,
đợi 4-5 ngày nữa đảo lần đầu nha bác.

Đang đi đúng hướng rồi! 👍
```

---

### Closing (30s)
**Narration:** *"Với Agri-Loop, tôi có trợ lý AI riêng, luôn bên cạnh chỉ dẫn từng bước. Không cần lo lắng, không phải tra Google, chỉ cần chụp ảnh và hỏi!"*

**Show Dashboard:**
- Danh sách đống ủ
- Tiến độ từng đống (0%, 15%, 45%, 80%)
- Badge "Sẵn sàng thu hoạch" ⭐

---

## 12. VIETNAMESE TERMINOLOGY

```typescript
export const TRANSLATIONS = {
  // ByProduct Types
  byproductTypes: {
    straw: 'Rơm rạ',
    shrimp_shell: 'Vỏ tôm',
    hyacinth: 'Bèo tây',
    unknown: 'Chưa xác định',
  },

  // Status
  status: {
    new: 'Mới tạo',
    processing: 'Đang ủ',
    ready_to_harvest: 'Sẵn sàng thu hoạch',
  },

  // Actions
  actions: {
    water: 'Tưới nước',
    turn: 'Đảo đống',
    cover: 'Che phủ',
    add_nitrogen: 'Thêm phân đạm',
  },

  // UI Labels
  ui: {
    login: 'Đăng nhập',
    phone: 'Số điện thoại',
    name: 'Tên của bác',
    start: 'Bắt đầu',
    create: 'Tạo mới',
    camera: 'Chụp ảnh',
    voice: 'Nói',
    send: 'Gửi',
    back: 'Quay lại',
    loading: 'Đang tải...',
    retry: 'Thử lại',
  },

  // Error Messages
  errors: {
    network: 'Không có mạng, thử lại nha bác',
    server: 'Lỗi hệ thống, thử lại sau',
    ai: 'AI đang bận, thử lại sau ít phút',
    invalid: 'Thông tin không hợp lệ, kiểm tra lại nha',
  },
};
```

---

## 13. KEY SIMPLIFICATIONS SUMMARY

### ✅ KEPT (Core MVP)
- Simple phone auth + JWT (no OTP)
- Gemini AI with basic context (last 5 messages)
- Image upload to Supabase
- 3-table database (User, ByProduct, Timeline)
- Mobile image compression
- Voice input (speech-to-text)
- Basic error handling (4 error types)
- Vietnamese UI/UX

### ❌ REMOVED (Over-engineering)
- SMS OTP authentication
- Offline queue system
- Advanced context management (token counting, timeline summarization)
- Multi-tier caching (L1, L2, L3)
- Server-side image optimization (WebP, thumbnails)
- Push notifications
- **Full e-commerce marketplace (replaced with mock UI)**
- Complex error handling (15+ error codes)
- Monitoring/logging (Sentry, Winston)
- Docker & CI/CD
- Separate database tables (ByProductImage, AIAnalysis, OTPVerification)

### 📊 LOC Estimate
- Backend: ~1,000 lines
- Mobile: ~1,000 lines (+150 lines for mock marketplace)
- **Total: ~2,150 lines** (vs 5,000+ in original spec)

### 🛒 Marketplace Note
- **Chợ Nông Sản** is a demo-only feature with hardcoded mock data
- Purpose: Showcase monetization potential and project sustainability
- NO backend API, NO payment system, NO real transactions
- If time allows: 1.5 hours to implement basic UI
- If no time: Show mockup screenshots in pitch slides
- Key message: "We can be self-sustaining through ads, commissions, and enterprise partnerships"

---

**Document Version:** 3.2 (Added Mock Marketplace Feature)
**Last Updated:** 2025-01-22
**Status:** Ready for Implementation 🚀

**Core Value:** "Chụp ảnh đống phụ phẩm → AI phân tích → Lời khuyên bằng tiếng Việt"
**3 Screens:** Login → Dashboard → Detail (với chat) + Chợ Nông Sản (demo)
**Demo Time:** 3 phút
**Implementation Time:** 36 giờ
