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


export function buildPrompt(
    byproduct: { name: string; type: string; location: string; contextData: unknown },
    recentHistory: string,
    userInput: string,
    realTimeContext?: string
): string {
    const contextData = byproduct.contextData as { decompositionLevel?: number };

    return `
ROLE: You are an expert in organic recycling for ALL types of agricultural waste (AI Agronomist).
You speak Vietnamese, Mien Tay accent, very friendly. Address the user as "bác".

CONTEXT:
- Object: ${byproduct.name} (Identified as: ${byproduct.type})
- Location: ${byproduct.location}
- Weather: ${realTimeContext || 'Unknown'}
- Decomposition: ${contextData.decompositionLevel || 0}%

HISTORY:
${recentHistory || 'No history yet'}

USER ASKS:
"${userInput}"

LOGIC:
1. Identify the biological composition of "${byproduct.type}" (C/N ratio, structure).
2. Determine best composting method (Aerobic vs Anaerobic, Lime, Enzymes, Trichoderma).
3. Give advice in simple Farmer language.

RESPONSE FORMAT (JSON ONLY):
{
  "decompositionLevel": <0-100 number>,
  "recommendation": {
    "action": "<what to do next>",
    "reason": "<why - simplified science>",
    "estimatedDays": <number or null>
  },
  "chatResponse": "<friendly advice in Mien Tay accent>",
  "suggestedQuestions": ["<short question 1>", "<short question 2>", "<short question 3>"]
}
`;
}

// Simple delay function
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function identifyImage(imageBase64: string): Promise<string> {
    try {
        const prompt = `
        Nhìn hình này và xác định đây là phụ phẩm nông nghiệp gì?
        Trả lời NGẮN GỌN tên tiếng Việt (tối đa 3 từ).
        Ví dụ: "Vỏ sầu riêng", "Rơm rạ", "Phân bò", "Lục bình".
        Nếu không phải phụ phẩm nông nghiệp, trả lời "Không xác định".
        Chỉ trả về tên, không có dấu câu thừa.
        `;

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg',
            },
        };

        const result = await geminiModel.generateContent([prompt, imagePart]);
        const response = result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Gemini Identify Error:', error);
        return 'Không xác định';
    }
}

export async function analyzeWithGemini(prompt: string, imageBase64?: string, retries = 3): Promise<AIAnalysisResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
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

            // Fallback response when JSON parsing fails
            return {
                decompositionLevel: 0,
                recommendation: {
                    action: 'Kiểm tra lại',
                    reason: 'AI chưa rõ, bác chụp lại kỹ hơn nha',
                    estimatedDays: null,
                },
                chatResponse: text || 'Dạ, cái này lạ quá, con chưa nhìn ra. Bác tả kỹ hơn chút không?',
                suggestedQuestions: [
                    'Cái này ủ được không?',
                    'Băm nhỏ ra không?',
                    'Có cần trộn vôi không?',
                ],
            };
        } catch (error) {
            console.error(`Gemini AI Error (attempt ${attempt}/${retries}):`, error);

            // If rate limited and more retries left, wait and retry
            if (attempt < retries) {
                console.log(`Waiting 12 seconds before retry...`);
                await delay(12000); // 12 seconds to respect 5 RPM limit
                continue;
            }

            throw new Error('AI_ERROR');
        }
    }

    throw new Error('AI_ERROR');
}
