
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Rate limit helper: 15 seconds delay to be safe (4 req/min)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log('🌱 Starting Deep Conversation Seed (Single Item - ROBUST VERSION)...');

    // 1. Reset Database
    console.log('🧹 Clearing all data...');
    await prisma.timelineEntry.deleteMany({});
    await prisma.byProduct.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create User
    console.log('👤 Creating Bác Ba Phi...');
    const user = await prisma.user.create({
        data: {
            phone: '0987654321',
            name: 'Bác Ba Phi',
            region: 'Đồng Tháp',
        },
    });

    // 3. Create Single ByProduct (Rice Straw)
    // Image: Real rice straw pile
    const STRAW_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuAQOx5vumrM2uxU_D_PIesNEByQHLuQwnXAzvXeJC5KXfDT9Yb5ar_9ShtP3g8cO1CUvCiPkR7o-KTRKmw_5hs1hU20RkkSFQjXdeKNV1KOCUmoh_Bm11vtGEKsccO7daK577OJVcOhXE1etOMw0vkEu3Y5Px2OEkBEp33gzNvX8IaSzJR3XnMpEGS5Lwm3gPylcepoUEnXDKBU9GGMOJ1cnaNeUr8o2Vf6nHbQnWKENhLa96x9W49EjM2aYp_RKwwFv-GSKn6mVpE";

    console.log('🌾 Creating "Đống Rơm rạ" (Single Item)...');
    const byproduct = await prisma.byProduct.create({
        data: {
            userId: user.id,
            name: "Đống Rơm rạ vụ Đông Xuân",
            type: "Rơm rạ",
            status: 'processing',
            location: "10.456,105.678",
            startImageUrl: STRAW_IMAGE,
            contextData: {
                decompositionLevel: 10,
                startDate: new Date().toISOString()
            },
        }
    });

    // 4. Conversation Script (Natural flow)
    const conversationFlow = [
        {
            user: "Tui mới chất đống rơm này hôm qua, tính ủ làm phân bón lúa vụ tới. Giờ tui cần làm gì đầu tiên hả cô AI?",
            baseTimeOffset: -5 * 24 * 60 * 60 * 1000 // 5 days ago
        },
        {
            user: "Tui có tưới nước rồi, mà sao thấy nước nó chảy tong tong ra ngoài, vậy là dư nước hả?",
            baseTimeOffset: -4 * 24 * 60 * 60 * 1000 // 4 days ago
        },
        {
            user: "Nay sờ vô đống ủ thấy nóng hổi luôn, chắc luộc trứng được luôn quá. Có sao không cô?",
            baseTimeOffset: -3 * 24 * 60 * 60 * 1000 // 3 days ago
        },
        {
            user: "Giờ tui muốn trộn thêm ít phân bò với nấm Trichoderma vô cho nó mau mục, được hông?",
            baseTimeOffset: -1 * 24 * 60 * 60 * 1000 // 1 day ago
        }
    ];

    console.log(`💬 Starting conversation generation (${conversationFlow.length} turns)...`);

    // Shared Chat History Context
    let chatHistory = `
    Context:
    - User: Bác Ba Phi (60 tuổi, Đồng Tháp).
    - Material: Rơm rạ.
    - Location: Mekong Delta.
    - Goal: Rapid decomposition for rice fertilizer.
    `;

    for (let i = 0; i < conversationFlow.length; i++) {
        const turn = conversationFlow[i];
        console.log(`\n🗣️ Turn ${i + 1}/${conversationFlow.length}: "${turn.user}"`);

        // 4.1 Save User Message
        await prisma.timelineEntry.create({
            data: {
                byproductId: byproduct.id,
                timestamp: Date.now() + turn.baseTimeOffset,
                role: 'user',
                content: turn.user,
            }
        });

        // 4.2 Generate AI Response using Gemini with Context
        chatHistory += `User: ${turn.user}\n`;

        const prompt = `
        You are an expert AI Agronomist assistants for Vietnamese farmers.
        Role: Friendly, respectful ("Dạ", "Thưa bác"), using Mekong Delta dialect/terms ("hen", "nghen", "rồi đa").
        
        Current history:
        ${chatHistory}

        Task: Respond to the User's last message.
        - Be concise but helpful.
        - Explain scientifically but simply.
        - Focus on the specific question (water, heat, additives, mixing).
        - IMPORTANT: Return JUST THE TEXT response. NO JSON. NO Markdown code blocks. Just plain text.
        `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();

            // Clean up any lingering markdown if Gemini ignores instructions
            const aiText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            console.log(`🤖 AI: ${aiText.substring(0, 50)}...`);

            // 4.3 Save AI Response
            await prisma.timelineEntry.create({
                data: {
                    byproductId: byproduct.id,
                    timestamp: Date.now() + turn.baseTimeOffset + 10000,
                    role: 'model',
                    content: aiText,
                    metadata: {
                        suggestedQuestions: []
                    }
                }
            });

            chatHistory += `AI: ${aiText}\n`;

        } catch (e) {
            console.error("Gemini Error", e);
            await prisma.timelineEntry.create({
                data: {
                    byproductId: byproduct.id,
                    timestamp: Date.now() + turn.baseTimeOffset + 10000,
                    role: 'model',
                    content: "Dạ mạng hơi yếu, bác kiểm tra lại giúp con nhen.",
                }
            });
        }

        // Rate Limit Wait
        if (i < conversationFlow.length - 1) {
            console.log("⏳ Waiting 15s for rate limit...");
            await delay(15000);
        }
    }

    console.log('✅ Deep Seed Complete! Log in with 0987654321.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
