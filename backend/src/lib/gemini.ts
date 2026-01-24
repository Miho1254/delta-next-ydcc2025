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

// Rich context interface for smarter prompts
export interface RichContext {
    location: string;
    weather: string;
    regionName?: string;
    climateZone?: string;
    soilType?: string;
    regionTips?: string[];
    rainAlert?: string | null;
    tempAdvice?: string;
    warnings?: string[];
    daysSinceStart?: number;
    totalInteractions?: number;
    gps?: {
        latitude: number;
        longitude: number;
        province: string;
        district: string;
        commune: string;
        fullAddress: string;
    };
}

// Build GPS location section for precise localization
function buildGPSLocation(richContext: RichContext): string {
    if (!richContext.gps) {
        return '';
    }

    return `
PRECISE LOCATION (GPS):
- Tỉnh/Thành phố: ${richContext.gps.province}
- Huyện/Quận: ${richContext.gps.district || 'Không rõ'}
- Xã/Phường: ${richContext.gps.commune || 'Không rõ'}
- Địa chỉ đầy đủ: ${richContext.gps.fullAddress}
- Tọa độ GPS: ${richContext.gps.latitude.toFixed(4)}, ${richContext.gps.longitude.toFixed(4)}`;
}

// Build region-aware advice section
function buildRegionAdvice(richContext: RichContext): string {
    if (!richContext.regionName) {
        return '';
    }

    let advice = `
REGION KNOWLEDGE:
- Vùng: ${richContext.regionName}
- Khí hậu: ${richContext.climateZone || 'Không rõ'}
- Đất: ${richContext.soilType || 'Không rõ'}`;

    if (richContext.regionTips && richContext.regionTips.length > 0) {
        advice += `
- Kinh nghiệm vùng miền:
${richContext.regionTips.map(tip => `  • ${tip}`).join('\n')}`;
    }

    return advice;
}

// Build weather-aware warnings section
function buildWeatherWarnings(richContext: RichContext): string {
    const parts: string[] = [];

    if (richContext.rainAlert) {
        parts.push(`🌧️ ${richContext.rainAlert}`);
    }

    if (richContext.tempAdvice) {
        parts.push(`🌡️ ${richContext.tempAdvice}`);
    }

    if (richContext.warnings && richContext.warnings.length > 0) {
        parts.push(...richContext.warnings.map(w => `⚠️ ${w}`));
    }

    if (parts.length === 0) return '';

    return `
REAL-TIME WARNINGS:
${parts.join('\n')}`;
}

// Build learning context from history
function buildLearningContext(daysSinceStart?: number, totalInteractions?: number): string {
    if (!daysSinceStart && !totalInteractions) return '';

    return `
COMPOSTING JOURNEY:
- Số ngày từ khi bắt đầu: ${daysSinceStart ?? 'Mới bắt đầu'}
- Số lần tương tác: ${totalInteractions ?? 1}
- Giai đoạn: ${!daysSinceStart || daysSinceStart <= 7 ? 'Khởi động (ngày 1-7)' :
            daysSinceStart <= 21 ? 'Phân hủy mạnh (ngày 8-21)' :
                daysSinceStart <= 35 ? 'Ổn định (ngày 22-35)' :
                    'Hoàn thành (> 35 ngày)'
        }`;
}


export function buildPrompt(
    byproduct: { name: string; type: string; location: string; contextData: unknown },
    recentHistory: string,
    userInput: string,
    realTimeContext?: string,
    richContext?: RichContext
): string {
    const contextData = byproduct.contextData as {
        decompositionLevel?: number;
        daysSinceStart?: number;
        totalInteractions?: number;
    };

    // Build optional sections
    const regionAdvice = richContext ? buildRegionAdvice(richContext) : '';
    const weatherWarnings = richContext ? buildWeatherWarnings(richContext) : '';
    const gpsLocation = richContext ? buildGPSLocation(richContext) : '';
    const learningContext = buildLearningContext(
        contextData.daysSinceStart || richContext?.daysSinceStart,
        contextData.totalInteractions || richContext?.totalInteractions
    );

    return `
ROLE: You are an expert in organic recycling for ALL types of agricultural waste (AI Agronomist).
You speak Vietnamese, Miền Tây accent, very friendly. Address the user as "bác".
You provide SPECIFIC, actionable advice based on PRECISE location, weather, and composting stage.
Use local knowledge when you have province/district information.

CONTEXT:
- Object: ${byproduct.name} (Identified as: ${byproduct.type})
- Location: ${byproduct.location}
- Weather: ${realTimeContext || richContext?.weather || 'Unknown'}
- Decomposition: ${contextData.decompositionLevel || 0}%
${gpsLocation}
${regionAdvice}
${weatherWarnings}
${learningContext}

CONVERSATION HISTORY:
${recentHistory || 'No history yet'}

USER ASKS:
"${userInput}"

SMART LOGIC:
1. Consider the WEATHER forecast when giving advice (rain → cover pile, heat → add water).
2. Apply REGION-SPECIFIC knowledge if available (ĐBSCL rice straw, Tây Nguyên coffee).
3. Track the COMPOSTING JOURNEY stage and adjust expectations accordingly.
4. Identify the biological composition of "${byproduct.type}" (C/N ratio, structure).
5. Determine best composting method (Aerobic vs Anaerobic, Lime, Enzymes, Trichoderma).
6. Give advice in simple Farmer language with ACTIONABLE next steps.
7. If there are WARNINGS, address them proactively in your response.

RESPONSE FORMAT (JSON ONLY):
{
  "decompositionLevel": <0-100 number>,
  "recommendation": {
    "action": "<what to do next - be specific>",
    "reason": "<why - simplified science>",
    "estimatedDays": <number or null>
  },
  "chatResponse": "<friendly advice in Miền Tây accent, address warnings if any>",
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
