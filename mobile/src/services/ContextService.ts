import * as Location from 'expo-location';

interface WeatherData {
    temperature: number;
    humidity: number;
    rain: number;
    weatherCode: number;
}

interface WeatherForecast {
    current: WeatherData;
    rainChance24h: number;
    maxTemp24h: number;
    minTemp24h: number;
}

interface RegionProfile {
    name: string;
    climateZone: string;
    soilType: string;
    commonByproducts: string[];
    compostingTips: string[];
}

interface RichContextData {
    location: string;
    weather: string;
    fullContext: string;
    regionProfile: RegionProfile | null;
    forecast: {
        rainAlert: string | null;
        tempAdvice: string;
    };
    composting: {
        optimalConditions: boolean;
        warnings: string[];
    };
    gps: DetailedLocation | null;
    timeline?: CompostingStage;
}

interface CompostingStage {
    daysElapsed: number;
    phase: string;      // 'Giai đoạn khởi động', 'Giai đoạn nóng', etc.
    advice: string;
}

// Detailed GPS location data for precise localization
interface DetailedLocation {
    latitude: number;
    longitude: number;
    province: string;       // Tỉnh
    district: string;       // Huyện/Quận
    commune: string;        // Xã/Phường
    street: string;         // Đường/Ấp
    fullAddress: string;    // Full formatted address
}

// Weather code to Vietnamese description
function getWeatherDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
        0: 'Trời quang',
        1: 'Trời quang',
        2: 'Có mây',
        3: 'Nhiều mây',
        45: 'Sương mù',
        48: 'Sương mù',
        51: 'Mưa phùn nhẹ',
        53: 'Mưa phùn',
        55: 'Mưa phùn dày',
        61: 'Mưa nhẹ',
        63: 'Mưa vừa',
        65: 'Mưa to',
        71: 'Tuyết nhẹ',
        73: 'Tuyết vừa',
        75: 'Tuyết dày',
        80: 'Mưa rào nhẹ',
        81: 'Mưa rào vừa',
        82: 'Mưa rào to',
        95: 'Giông bão',
        96: 'Giông kèm mưa đá',
        99: 'Giông kèm mưa đá to',
    };
    return weatherCodes[code] || 'Không xác định';
}

// Region profiles for Vietnam
const REGION_PROFILES: Record<string, RegionProfile> = {
    'ĐBSCL': {
        name: 'Đồng bằng sông Cửu Long',
        climateZone: 'Nhiệt đới gió mùa',
        soilType: 'Phù sa - giữ ẩm tốt',
        commonByproducts: ['Rơm rạ', 'Vỏ trấu', 'Lục bình', 'Bã mía'],
        compostingTips: [
            'Nên ủ trong mùa khô (tháng 11-4)',
            'Che phủ kỹ khi mưa lớn',
            'Tận dụng lục bình làm nguồn đạm',
        ],
    },
    'Tây Nguyên': {
        name: 'Tây Nguyên',
        climateZone: 'Cao nguyên nhiệt đới',
        soilType: 'Đất đỏ bazan - giàu khoáng',
        commonByproducts: ['Vỏ cà phê', 'Bã cà phê', 'Vỏ sầu riêng', 'Lá cao su'],
        compostingTips: [
            'Vỏ cà phê cần ủ riêng (chứa caffeine)',
            'Trộn thêm phân bò để cân bằng C/N',
            'Nhiệt độ cao nguyên lý tưởng cho ủ phân',
        ],
    },
    'Đông Nam Bộ': {
        name: 'Đông Nam Bộ',
        climateZone: 'Nhiệt đới gió mùa',
        soilType: 'Đất xám - cần bón phân',
        commonByproducts: ['Vỏ điều', 'Lá cao su', 'Rơm rạ', 'Xơ dừa'],
        compostingTips: [
            'Xơ dừa giữ ẩm tốt, trộn 30% vào đống ủ',
            'Vỏ điều cần nghiền nhỏ trước khi ủ',
        ],
    },
    'Bắc Bộ': {
        name: 'Đồng bằng Bắc Bộ',
        climateZone: 'Cận nhiệt đới gió mùa',
        soilType: 'Phù sa sông Hồng',
        commonByproducts: ['Rơm rạ', 'Thân ngô', 'Vỏ lạc', 'Bã đậu'],
        compostingTips: [
            'Mùa đông lạnh - ủ trong nhà kín hoặc che phủ',
            'Tận dụng nhiệt từ phân chuồng',
        ],
    },
};

// Detect region from location name
function detectRegion(locationName: string): RegionProfile | null {
    const loc = locationName.toLowerCase();

    // ĐBSCL keywords
    if (['cần thơ', 'an giang', 'đồng tháp', 'vĩnh long', 'bến tre', 'trà vinh', 'sóc trăng', 'bạc liêu', 'cà mau', 'kiên giang', 'hậu giang', 'long an', 'tiền giang'].some(k => loc.includes(k))) {
        return REGION_PROFILES['ĐBSCL'];
    }

    // Tây Nguyên keywords
    if (['đắk lắk', 'đắk nông', 'gia lai', 'kon tum', 'lâm đồng', 'buôn ma thuột', 'pleiku', 'đà lạt'].some(k => loc.includes(k))) {
        return REGION_PROFILES['Tây Nguyên'];
    }

    // Đông Nam Bộ
    if (['bình dương', 'bình phước', 'đồng nai', 'tây ninh', 'bà rịa', 'vũng tàu', 'hồ chí minh'].some(k => loc.includes(k))) {
        return REGION_PROFILES['Đông Nam Bộ'];
    }

    // Bắc Bộ
    if (['hà nội', 'hải phòng', 'thái bình', 'nam định', 'hải dương', 'hưng yên', 'bắc ninh', 'vĩnh phúc'].some(k => loc.includes(k))) {
        return REGION_PROFILES['Bắc Bộ'];
    }

    return null;
}

// Get temperature recommendation for composting
function getTemperatureAdvice(temp: number): string {
    if (temp >= 38) return '🔥 Nắng gắt - Che phủ đống ủ, tưới thêm nước';
    if (temp >= 35) return '⚠️ Nắng nóng - Cần che phủ đống ủ';
    if (temp >= 28) return '☀️ Nhiệt độ lý tưởng cho ủ phân (28-35°C)';
    if (temp >= 20) return '🌤️ Nhiệt độ tốt - Quá trình phân hủy ổn định';
    if (temp >= 15) return '🌡️ Hơi lạnh - Phân hủy chậm hơn bình thường';
    return '❄️ Trời lạnh - Quá trình phân hủy rất chậm, cần che phủ giữ nhiệt';
}

// Fetch weather with forecast from Open-Meteo
async function fetchWeatherWithForecast(latitude: number, longitude: number): Promise<WeatherForecast | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=2`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.current && data.daily) {
            return {
                current: {
                    temperature: data.current.temperature_2m,
                    humidity: data.current.relative_humidity_2m,
                    rain: data.current.rain,
                    weatherCode: data.current.weather_code,
                },
                rainChance24h: data.daily.precipitation_probability_max?.[0] || 0,
                maxTemp24h: data.daily.temperature_2m_max?.[0] || data.current.temperature_2m,
                minTemp24h: data.daily.temperature_2m_min?.[0] || data.current.temperature_2m,
            };
        }
        return null;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// Reverse geocode to get detailed location
interface GeocodedLocation {
    displayName: string;
    detailed: DetailedLocation;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodedLocation> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
            const loc = results[0];

            // Extract all location components
            const province = loc.region || loc.subregion || 'Không xác định';
            const district = loc.city || loc.subregion || '';
            const commune = loc.district || '';
            const street = loc.street || loc.name || '';

            // Build full address
            const addressParts = [street, commune, district, province].filter(Boolean);
            const fullAddress = addressParts.join(', ');

            // Simple display name
            const displayName = commune && district
                ? `${commune}, ${district}`
                : district || province;

            return {
                displayName,
                detailed: {
                    latitude,
                    longitude,
                    province,
                    district,
                    commune,
                    street,
                    fullAddress,
                },
            };
        }

        return {
            displayName: 'Không xác định',
            detailed: {
                latitude,
                longitude,
                province: 'Không xác định',
                district: '',
                commune: '',
                street: '',
                fullAddress: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            },
        };
    } catch (error) {
        console.error('Geocode error:', error);
        return {
            displayName: 'Không xác định',
            detailed: {
                latitude,
                longitude,
                province: 'Lỗi định vị',
                district: '',
                commune: '',
                street: '',
                fullAddress: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            },
        };
    }
}

// Analyze composting conditions
function analyzeCompostingConditions(forecast: WeatherForecast | null): { optimalConditions: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let optimal = true;

    if (!forecast) {
        return { optimalConditions: true, warnings: [] };
    }

    // Rain warning
    if (forecast.rainChance24h >= 70) {
        warnings.push(`🌧️ Khả năng mưa ${forecast.rainChance24h}% trong 24h - Che phủ đống ủ!`);
        optimal = false;
    } else if (forecast.rainChance24h >= 40) {
        warnings.push(`🌦️ Có thể mưa ${forecast.rainChance24h}% - Chuẩn bị bạt che`);
    }

    // Temperature warnings
    if (forecast.current.temperature >= 38) {
        warnings.push('🔥 Nhiệt độ cao - Tưới nước giữ ẩm cho đống ủ');
        optimal = false;
    } else if (forecast.current.temperature < 15) {
        warnings.push('❄️ Nhiệt độ thấp - Quá trình phân hủy chậm');
    }

    // Humidity warnings
    if (forecast.current.humidity < 40) {
        warnings.push('💨 Độ ẩm thấp - Cần tưới nước cho đống ủ');
    } else if (forecast.current.humidity > 85) {
        warnings.push('💧 Độ ẩm cao - Đảo đống ủ để thoáng khí');
    }

    return { optimalConditions: optimal, warnings };
}

// Analyze composting stage based on start date
function analyzeTimeline(startDateStr?: string): CompostingStage | undefined {
    if (!startDateStr) return undefined;

    const start = new Date(startDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let phase = '';
    let advice = '';

    if (days <= 3) {
        phase = 'Giai đoạn 1: Khởi động (Mesophilic)';
        advice = 'Vi sinh vật bắt đầu hoạt động. Cần đảm bảo độ ẩm 50-60%.';
    } else if (days <= 15) {
        phase = 'Giai đoạn 2: Nóng (Thermophilic)';
        advice = 'Nhiệt độ đống ủ tăng cao. Cần đảo trộn 3-4 ngày/lần để cung cấp oxy.';
    } else if (days <= 30) {
        phase = 'Giai đoạn 3: Nguội dần (Cooling)';
        advice = 'Nhiệt độ giảm, nấm hoạt động mạnh. Tưới nước bổ sung nếu khô.';
    } else {
        phase = 'Giai đoạn 4: Ổn định (Curing)';
        advice = 'Đống ủ chuyển sang màu nâu đen, mùi đất. Sắp thu hoạch được.';
    }

    return { daysElapsed: days, phase, advice };
}

// Main function: Get RICH context for AI
export async function getContextForAI(productData?: { createdAt: string }): Promise<RichContextData> {
    const defaultContext: RichContextData = {
        location: 'Không xác định',
        weather: 'Không có dữ liệu',
        fullContext: 'Không có thông tin bổ sung',
        regionProfile: null,
        forecast: {
            rainAlert: null,
            tempAdvice: 'Không có dữ liệu nhiệt độ',
        },
        composting: {
            optimalConditions: true,
            warnings: [],
        },
        gps: null,
    };

    try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return defaultContext;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        // Fetch location name and weather in parallel
        const [geocodedLocation, forecast] = await Promise.all([
            reverseGeocode(latitude, longitude),
            fetchWeatherWithForecast(latitude, longitude),
        ]);

        // Detect region from display name
        const regionProfile = detectRegion(geocodedLocation.displayName);

        // Build weather string
        let weatherString = 'Không có dữ liệu';
        let tempAdvice = 'Không có dữ liệu nhiệt độ';
        let rainAlert: string | null = null;

        if (forecast) {
            const weatherDesc = getWeatherDescription(forecast.current.weatherCode);
            tempAdvice = getTemperatureAdvice(forecast.current.temperature);
            weatherString = `${forecast.current.temperature}°C (${weatherDesc}) | Độ ẩm: ${forecast.current.humidity}%`;

            if (forecast.current.rain > 0) {
                weatherString += ` | Mưa: ${forecast.current.rain}mm`;
            }

            // Add 24h forecast
            weatherString += ` | Dự báo: ${forecast.minTemp24h}-${forecast.maxTemp24h}°C`;

            if (forecast.rainChance24h >= 50) {
                rainAlert = `⚠️ Khả năng mưa ${forecast.rainChance24h}% trong 24h tới`;
            }
        }

        // Analyze composting conditions
        const compostingAnalysis = analyzeCompostingConditions(forecast);

        // Analyze timeline
        const timeline = analyzeTimeline(productData?.createdAt);

        // Build full context string for Gemini with detailed GPS
        let fullContext = `📍 Vị trí: ${geocodedLocation.detailed.fullAddress} | 🌡️ ${weatherString}`;

        if (regionProfile) {
            fullContext += ` | 🗺️ Vùng: ${regionProfile.name} (${regionProfile.climateZone})`;
        }

        fullContext += ` | ${tempAdvice}`;

        if (rainAlert) {
            fullContext += ` | ${rainAlert}`;
        }

        if (compostingAnalysis.warnings.length > 0) {
            fullContext += ` | CẢNH BÁO: ${compostingAnalysis.warnings.join('; ')}`;
        }

        if (timeline) {
            fullContext += ` | ⏳ ${timeline.phase} (Ngày ${timeline.daysElapsed}): ${timeline.advice}`;
        }

        // Add GPS coordinates for precision
        fullContext += ` | GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

        return {
            location: geocodedLocation.displayName,
            weather: weatherString,
            fullContext,
            regionProfile,
            forecast: {
                rainAlert,
                tempAdvice,
            },
            composting: compostingAnalysis,
            gps: geocodedLocation.detailed,
            timeline
        };
    } catch (error) {
        console.error('Context service error:', error);
        return defaultContext;
    }
}

// Quick function to get formatted context string only
export async function getContextString(createdAt?: string): Promise<string> {
    const context = await getContextForAI(createdAt ? { createdAt } : undefined);
    return context.fullContext;
}

// Export types for use in other files
export type { RichContextData, RegionProfile, WeatherForecast, DetailedLocation, CompostingStage };
