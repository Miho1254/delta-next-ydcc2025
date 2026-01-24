/**
 * Smart Prompt Testing Script
 * Tests the enhanced prompt directly with Gemini API
 * 
 * Run: npx ts-node src/tests/test-smart-prompt.ts
 */

import { buildPrompt, analyzeWithGemini, RichContext } from '../lib/gemini';

// Test scenarios
const TEST_SCENARIOS = [
    {
        name: 'Test 1: ĐBSCL + Rain Warning',
        byproduct: {
            name: 'Đống ủ rơm #1',
            type: 'Rơm rạ',
            location: 'Cần Thơ',
            contextData: { decompositionLevel: 25 }
        },
        userInput: 'Đống ủ có cần làm gì không?',
        richContext: {
            location: 'Ninh Kiều, Cần Thơ',
            weather: '32°C (Có mây) | Độ ẩm: 78%',
            regionName: 'Đồng bằng sông Cửu Long',
            climateZone: 'Nhiệt đới gió mùa',
            soilType: 'Phù sa - giữ ẩm tốt',
            regionTips: ['Nên ủ trong mùa khô', 'Tận dụng lục bình làm nguồn đạm'],
            rainAlert: '⚠️ Khả năng mưa 70% trong 24h tới',
            tempAdvice: '☀️ Nhiệt độ lý tưởng cho ủ phân (28-35°C)',
            warnings: ['🌧️ Khả năng mưa 70% trong 24h - Che phủ đống ủ!'],
            daysSinceStart: 7,
            totalInteractions: 5,
            gps: {
                latitude: 10.0341,
                longitude: 105.7678,
                province: 'Cần Thơ',
                district: 'Ninh Kiều',
                commune: 'An Khánh',
                fullAddress: 'Đường 30/4, An Khánh, Ninh Kiều, Cần Thơ'
            }
        } as RichContext
    },
    {
        name: 'Test 2: Tây Nguyên + Coffee',
        byproduct: {
            name: 'Vỏ cà phê',
            type: 'Vỏ cà phê',
            location: 'Đắk Lắk',
            contextData: { decompositionLevel: 0 }
        },
        userInput: 'Vỏ cà phê này ủ được không?',
        richContext: {
            location: 'Buôn Ma Thuột, Đắk Lắk',
            weather: '28°C (Trời quang) | Độ ẩm: 65%',
            regionName: 'Tây Nguyên',
            climateZone: 'Cao nguyên nhiệt đới',
            soilType: 'Đất đỏ bazan - giàu khoáng',
            regionTips: ['Vỏ cà phê cần ủ riêng (chứa caffeine)', 'Trộn thêm phân bò'],
            rainAlert: null,
            tempAdvice: '☀️ Nhiệt độ lý tưởng cho ủ phân',
            warnings: [],
            daysSinceStart: 0,
            totalInteractions: 1,
            gps: {
                latitude: 12.6667,
                longitude: 108.0500,
                province: 'Đắk Lắk',
                district: 'Buôn Ma Thuột',
                commune: 'Tân Lợi',
                fullAddress: 'Tân Lợi, Buôn Ma Thuột, Đắk Lắk'
            }
        } as RichContext
    },
    {
        name: 'Test 3: Day 20 Learning Memory',
        byproduct: {
            name: 'Đống ủ lục bình',
            type: 'Lục bình',
            location: 'Long An',
            contextData: { decompositionLevel: 55 }
        },
        userInput: 'Mấy ngày nữa thì xong?',
        richContext: {
            location: 'Tân An, Long An',
            weather: '33°C (Nắng) | Độ ẩm: 70%',
            regionName: 'Đồng bằng sông Cửu Long',
            climateZone: 'Nhiệt đới gió mùa',
            soilType: 'Phù sa',
            regionTips: ['Lục bình phân hủy nhanh', 'Cần thoát nước tốt'],
            rainAlert: null,
            tempAdvice: '⚠️ Nắng nóng - Cần che phủ đống ủ',
            warnings: [],
            daysSinceStart: 20,
            totalInteractions: 12,
            gps: {
                latitude: 10.5333,
                longitude: 106.4000,
                province: 'Long An',
                district: 'Tân An',
                commune: 'Khánh Hậu',
                fullAddress: 'Khánh Hậu, Tân An, Long An'
            }
        } as RichContext
    }
];

async function runTests() {
    console.log('🧪 SMART PROMPT TESTING\n');
    console.log('='.repeat(60));

    // Run ONLY the first scenario to save Quota (20 RPD limit!)
    const scenario = TEST_SCENARIOS[0];
    {
        console.log(`\n📋 ${scenario.name}`);
        console.log('-'.repeat(60));

        // Build prompt
        const prompt = buildPrompt(
            scenario.byproduct,
            'User: Chào bác\nModel: Chào bác nông dân!',
            scenario.userInput,
            scenario.richContext.weather,
            scenario.richContext
        );

        console.log('\n📝 PROMPT PREVIEW (first 500 chars):');
        console.log(prompt.substring(0, 500) + '...\n');

        try {
            console.log('⏳ Calling Gemini API...');
            const result = await analyzeWithGemini(prompt);

            console.log('\n✅ GEMINI RESPONSE:');
            console.log('---');
            console.log(`📊 Decomposition: ${result.decompositionLevel}%`);
            console.log(`🎯 Action: ${result.recommendation.action}`);
            console.log(`📖 Reason: ${result.recommendation.reason}`);
            console.log(`⏰ Days: ${result.recommendation.estimatedDays ?? 'N/A'}`);
            console.log(`💬 Response: ${result.chatResponse}`);
            console.log(`❓ Suggestions: ${result.suggestedQuestions?.join(' | ')}`);
            console.log('---');

            // Verify quality
            const checks = {
                hasVietnamese: /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(result.chatResponse),
                mentionsLocation: result.chatResponse.toLowerCase().includes(scenario.richContext.gps?.province.toLowerCase() || '') ||
                    result.chatResponse.toLowerCase().includes(scenario.richContext.gps?.district.toLowerCase() || ''),
                mentionsWeather: scenario.richContext.warnings.length > 0 ?
                    result.chatResponse.includes('che') || result.chatResponse.includes('phủ') || result.chatResponse.includes('mưa') : true,
                hasSuggestions: (result.suggestedQuestions?.length || 0) >= 2
            };

            console.log('\n🔍 QUALITY CHECKS:');
            console.log(`  ✓ Vietnamese: ${checks.hasVietnamese ? '✅' : '❌'}`);
            console.log(`  ✓ Mentions location: ${checks.mentionsLocation ? '✅' : '⚠️'}`);
            console.log(`  ✓ Weather-aware: ${checks.mentionsWeather ? '✅' : '❌'}`);
            console.log(`  ✓ Has suggestions: ${checks.hasSuggestions ? '✅' : '❌'}`);

        } catch (error) {
            console.log(`\n❌ ERROR: ${(error as Error).message}`);
        }

        console.log('\n' + '='.repeat(60));

        // Wait between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    console.log('\n🏁 TESTING COMPLETE\n');
}

// Run tests
runTests().catch(console.error);
