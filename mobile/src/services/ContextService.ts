import * as Location from 'expo-location';

interface WeatherData {
    temperature: number;
    humidity: number;
    rain: number;
    weatherCode: number;
}

interface ContextData {
    location: string;
    weather: string;
    fullContext: string;
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

// Get temperature recommendation for composting
function getTemperatureAdvice(temp: number): string {
    if (temp >= 35) return '⚠️ Nắng nóng - Cần che phủ đống ủ';
    if (temp >= 28) return '☀️ Nhiệt độ lý tưởng cho ủ phân';
    if (temp >= 20) return '🌤️ Nhiệt độ tốt';
    return '❄️ Trời lạnh - Quá trình phân hủy chậm';
}

// Fetch weather from Open-Meteo (Free, No API Key)
async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,rain,weather_code&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.current) {
            return {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                rain: data.current.rain,
                weatherCode: data.current.weather_code,
            };
        }
        return null;
    } catch (error) {
        console.error('Weather fetch error:', error);
        return null;
    }
}

// Reverse geocode to get city name
async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results.length > 0) {
            const loc = results[0];
            const city = loc.city || loc.subregion || loc.region || 'Không xác định';
            const district = loc.district || loc.name || '';
            return district ? `${district}, ${city}` : city;
        }
        return 'Không xác định';
    } catch (error) {
        console.error('Geocode error:', error);
        return 'Không xác định';
    }
}

// Main function: Get full context for AI
export async function getContextForAI(): Promise<ContextData> {
    const defaultContext: ContextData = {
        location: 'Không xác định',
        weather: 'Không có dữ liệu',
        fullContext: 'Không có thông tin bổ sung',
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
        const [locationName, weatherData] = await Promise.all([
            reverseGeocode(latitude, longitude),
            fetchWeather(latitude, longitude),
        ]);

        // Build weather string
        let weatherString = 'Không có dữ liệu';
        let tempAdvice = '';

        if (weatherData) {
            const weatherDesc = getWeatherDescription(weatherData.weatherCode);
            tempAdvice = getTemperatureAdvice(weatherData.temperature);
            weatherString = `${weatherData.temperature}°C (${weatherDesc}) | Độ ẩm: ${weatherData.humidity}%`;

            if (weatherData.rain > 0) {
                weatherString += ` | Mưa: ${weatherData.rain}mm`;
            }
        }

        // Build full context string for Gemini
        const fullContext = `📍 Vị trí: ${locationName} | 🌡️ ${weatherString} | ${tempAdvice}`;

        return {
            location: locationName,
            weather: weatherString,
            fullContext,
        };
    } catch (error) {
        console.error('Context service error:', error);
        return defaultContext;
    }
}

// Quick function to get formatted context string only
export async function getContextString(): Promise<string> {
    const context = await getContextForAI();
    return context.fullContext;
}
