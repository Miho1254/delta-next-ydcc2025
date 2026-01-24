import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export interface AIAnalysisResult {
    decompositionLevel: number;
    recommendation: {
        action: string;
        reason: string;
        estimatedDays: number | null;
    };
    chatResponse: string;
    suggestedQuestions?: string[];
}

function translateType(type: string): string {
    const map: Record<string, string> = {
        straw: 'Rơm rạ',
        shrimp_shell: 'Vỏ tôm',
        hyacinth: 'Bèo tây',
        unknown: 'Chưa xác định',
    };
    return map[type] || 'Chưa xác định';
}

export function buildPrompt(
    byproduct: { name: string; type: string; location: string; contextData: unknown },
    recentHistory: string,
    userInput: string
): string {
    const contextData = byproduct.contextData as { decompositionLevel?: number };

    return `
Bạn là một chuyên gia nông nghiệp (AI Agronomist) hỗ trợ nông dân ĐBSCL xử lý phụ phẩm nông nghiệp thành phân bón hữu cơ.
Bạn nói tiếng Việt, giọng miền Tây, thân thiện. Gọi người dùng là "bác".

ĐỐNG Ủ HIỆN TẠI:
- Tên: ${byproduct.name}
- Loại: ${translateType(byproduct.type)}
- Độ phân hủy hiện tại: ${contextData.decompositionLevel || 0}%
- Vị trí: ${byproduct.location}

LỊCH SỬ GẦN ĐÂY:
${recentHistory || 'Chưa có lịch sử'}

CÂU HỎI MỚI:
${userInput}

QUAN TRỌNG - FORMAT TRẢ LỜI (JSON):
{
  "decompositionLevel": <số từ 0-100>,
  "recommendation": {
    "action": "<hành động cần làm>",
    "reason": "<lý do>",
    "estimatedDays": <số ngày còn lại hoặc null>
  },
  "chatResponse": "<câu trả lời thân thiện cho bác nông dân>",
  "suggestedQuestions": ["Câu hỏi 1?", "Câu hỏi 2?", "Câu hỏi 3?"]
}
Chỉ trả về JSON, không có text khác.
`;
}

export async function analyzeWithGemini(prompt: string, imageBase64?: string): Promise<AIAnalysisResult> {
    try {
        let result;

        if (imageBase64) {
            const imagePart = {
                inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg',
                },
            };
            result = await geminiModel.generateContent([prompt, imagePart]);
        } else {
            result = await geminiModel.generateContent(prompt);
        }

        const response = result.response;
        const text = response.text();

        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as AIAnalysisResult;
        }

        // Fallback response
        return {
            decompositionLevel: 0,
            recommendation: {
                action: 'Kiểm tra lại',
                reason: 'AI không thể phân tích, vui lòng thử lại',
                estimatedDays: null,
            },
            chatResponse: text || 'Xin lỗi bác, tui đang bận. Bác thử lại sau nha!',
            suggestedQuestions: [
                'Có cần tưới nước không?',
                'Bao lâu nữa thu hoạch?',
                'Cần đảo đống không?',
            ],
        };
    } catch (error) {
        console.error('Gemini AI Error:', error);
        throw new Error('AI_ERROR');
    }
}
