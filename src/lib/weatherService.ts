export type WeatherData = {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  uvIndex: number;
  visibility: number;
  updated: string;
};

export type AQIData = {
  city: string;
  aqi: number;
  pm25: number;
  pm10: number;
  status: string;
  healthRecommendation: string;
  updated: string;
};

export type WeatherForecast = {
  date: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  precipitationChance: number;
};

const WEATHER_CACHE = new Map<string, { data: WeatherData; time: number }>();
const AQI_CACHE = new Map<string, { data: AQIData; time: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function getWeatherData(cityName: string, lat: number, lon: number): Promise<WeatherData | null> {
  const cached = WEATHER_CACHE.get(cityName);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index,visibility&temperature_unit=celsius`
    );
    const data = await response.json();
    const current = data.current;

    const weatherData: WeatherData = {
      city: cityName,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      condition: getWeatherCondition(current.weather_code),
      windSpeed: Math.round(current.wind_speed_10m),
      uvIndex: current.uv_index,
      visibility: current.visibility / 1000,
      updated: new Date().toLocaleTimeString(),
    };

    WEATHER_CACHE.set(cityName, { data: weatherData, time: Date.now() });
    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
    return null;
  }
}

export async function getAQIData(cityName: string, lat: number, lon: number): Promise<AQIData | null> {
  const cached = AQI_CACHE.get(cityName);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide`
    );
    const data = await response.json();
    const current = data.current;

    const aqi = current.us_aqi;
    const status = getAQIStatus(aqi);

    const aqiData: AQIData = {
      city: cityName,
      aqi: Math.round(aqi),
      pm25: Math.round(current.pm2_5 * 10) / 10,
      pm10: Math.round(current.pm10 * 10) / 10,
      status,
      healthRecommendation: getHealthRecommendation(aqi),
      updated: new Date().toLocaleTimeString(),
    };

    AQI_CACHE.set(cityName, { data: aqiData, time: Date.now() });
    return aqiData;
  } catch (error) {
    console.error('AQI fetch error:', error);
    return null;
  }
}

export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[] | null> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=celsius&forecast_days=7`
    );
    const data = await response.json();
    const daily = data.daily;

    return daily.time.map((date: string, index: number) => ({
      date,
      tempMax: Math.round(daily.temperature_2m_max[index]),
      tempMin: Math.round(daily.temperature_2m_min[index]),
      condition: getWeatherCondition(daily.weather_code[index]),
      precipitationChance: daily.precipitation_probability_max[index] || 0,
    }));
  } catch (error) {
    console.error('Forecast fetch error:', error);
    return null;
  }
}

export async function getTrafficData(cityName: string): Promise<{ congestion: string; speed: number; status: string } | null> {
  try {
    const trafficData = {
      congestion: getSimulatedTraffic(),
      speed: Math.floor(Math.random() * 80) + 20,
      status: '',
    };

    trafficData.status = trafficData.congestion === 'heavy' ? 'Heavy traffic detected' :
                         trafficData.congestion === 'moderate' ? 'Moderate traffic' :
                         'Light traffic';

    return trafficData;
  } catch (error) {
    console.error('Traffic data error:', error);
    return null;
  }
}

function getWeatherCondition(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail',
  };
  return weatherCodes[code] || 'Unknown';
}

function getAQIStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getHealthRecommendation(aqi: number): string {
  if (aqi <= 50)
    return 'Air quality is good. Enjoy outdoor activities!';
  if (aqi <= 100)
    return 'Air quality is acceptable. Most people can engage in outdoor activities.';
  if (aqi <= 150)
    return 'Members of sensitive groups should limit outdoor activities.';
  if (aqi <= 200)
    return 'Everyone should limit outdoor activities. Wear N95 masks if going out.';
  if (aqi <= 300)
    return 'Avoid outdoor activities. Stay indoors with air purifier if possible.';
  return 'Health alert: Hazardous air quality. Stay indoors and use air purifier.';
}

function getSimulatedTraffic(): 'light' | 'moderate' | 'heavy' {
  const random = Math.random();
  if (random < 0.5) return 'light';
  if (random < 0.8) return 'moderate';
  return 'heavy';
}
