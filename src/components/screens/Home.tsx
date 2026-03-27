import { useState, useEffect } from 'react';
import {
  AlertCircle, Car, Wind, Droplet, Zap, Bell, Phone, FileText, MapPin,
  Cloud, Droplets, Eye, CloudRain, MapPinOff, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, CityStatus } from '../../lib/supabase';
import { getUserLocation, LocationData } from '../../lib/locationService';
import { getWeatherData, WeatherData, getAQIData, AQIData, getTrafficData } from '../../lib/weatherService';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { profile } = useAuth();
  const [cityStatus, setCityStatus] = useState<CityStatus[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aqi, setAqi] = useState<AQIData | null>(null);
  const [traffic, setTraffic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    initializeData();
    const interval = setInterval(refreshData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function initializeData() {
    setLoading(true);
    await loadLocation();
    await loadCityStatus();
    setLoading(false);
  }

  async function loadLocation() {
    const loc = await getUserLocation();
    if (loc) {
      setLocation(loc);
      setLocationError(false);
      await Promise.all([
        loadWeather(loc),
        loadAQI(loc),
        loadTraffic(loc),
      ]);
    } else {
      setLocationError(true);
    }
  }

  async function loadWeather(loc: LocationData) {
    const weatherData = await getWeatherData(loc.cityName, loc.latitude, loc.longitude);
    setWeather(weatherData);
  }

  async function loadAQI(loc: LocationData) {
    const aqiData = await getAQIData(loc.cityName, loc.latitude, loc.longitude);
    setAqi(aqiData);
  }

  async function loadTraffic(loc: LocationData) {
    const trafficData = await getTrafficData(loc.cityName);
    setTraffic(trafficData);
  }

  async function loadCityStatus() {
    const { data } = await supabase
      .from('city_status')
      .select('*')
      .order('service_type');

    if (data) {
      setCityStatus(data);
    }
  }

  async function refreshData() {
    if (!location) return;
    setRefreshing(true);
    await Promise.all([
      loadWeather(location),
      loadAQI(location),
      loadTraffic(location),
      loadCityStatus(),
    ]);
    setRefreshing(false);
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'Good':
        return 'success';
      case 'moderate':
      case 'Moderate':
        return 'warning';
      case 'poor':
      case 'unhealthy':
      case 'Unhealthy':
        return 'error';
      case 'critical':
      case 'Very Unhealthy':
      case 'Hazardous':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'success';
    if (aqi <= 100) return 'warning';
    if (aqi <= 150) return 'warning';
    if (aqi <= 200) return 'error';
    return 'error';
  };

  const getTrafficColor = (congestion: string) => {
    if (congestion === 'light') return 'success';
    if (congestion === 'moderate') return 'warning';
    return 'error';
  };

  const quickActions = [
    { id: 'report', label: 'Report Issue', icon: FileText, color: 'bg-blue-500' },
    { id: 'track', label: 'Track Issues', icon: MapPin, color: 'bg-teal-500' },
    { id: 'services', label: 'City Services', icon: Zap, color: 'bg-purple-500' },
    { id: 'emergency', label: 'Emergency', icon: Phone, color: 'bg-red-500' },
  ];

  if (loading) {
    return (
      <div className="pb-24">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-white/20 rounded-lg w-1/2" />
            <div className="h-20 bg-white/20 rounded-lg" />
          </div>
        </div>
        <div className="px-6 mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-8 rounded-b-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-200 mb-1">{getGreeting()}</p>
            <h1 className="text-2xl font-bold">{profile?.full_name || 'Citizen'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {locationError ? (
          <Card className="bg-red-50 border border-red-200 p-4 text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-semibold">Enable Location</p>
              <p className="text-sm">Allow location access to see real-time data</p>
            </div>
          </Card>
        ) : location ? (
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <p className="text-sm text-blue-100 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Current Location
              </p>
              <p className="text-lg font-semibold">{location.cityName}</p>
              <p className="text-sm text-blue-100">{location.address}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="px-6 mt-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Real-time Environment</h2>

          {weather && (
            <Card className="p-5 mb-4 bg-gradient-to-br from-blue-50 to-teal-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Weather</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{weather.temperature}°C</p>
                  <p className="text-sm text-gray-600 mb-3">{weather.condition}</p>
                </div>
                <Cloud className="w-12 h-12 text-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>{weather.visibility.toFixed(1)} km visibility</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Droplets className="w-4 h-4 text-gray-500" />
                  <span>{weather.humidity}% humidity</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span>{weather.windSpeed} km/h wind</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <span>UV {weather.uvIndex.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">Updated {weather.updated}</p>
            </Card>
          )}

          {aqi && (
            <Card className="p-5 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Air Quality Index</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{aqi.aqi}</p>
                  <Badge variant={getAQIColor(aqi.aqi)} className="mb-2">
                    {aqi.status}
                  </Badge>
                </div>
                <Wind className="w-12 h-12 text-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="text-gray-700">
                  <p className="text-xs text-gray-500">PM2.5</p>
                  <p className="font-semibold">{aqi.pm25} µg/m³</p>
                </div>
                <div className="text-gray-700">
                  <p className="text-xs text-gray-500">PM10</p>
                  <p className="font-semibold">{aqi.pm10} µg/m³</p>
                </div>
              </div>

              <div className="bg-white/50 rounded-lg p-3 mb-2">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Health Tip:</span> {aqi.healthRecommendation}
                </p>
              </div>

              <p className="text-xs text-gray-500">Updated {aqi.updated}</p>
            </Card>
          )}

          {traffic && (
            <Card className="p-5 bg-gradient-to-br from-orange-50 to-red-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Traffic Status</h3>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{traffic.status}</p>
                  <Badge variant={getTrafficColor(traffic.congestion)}>
                    {traffic.congestion.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">Avg Speed: {traffic.speed} km/h</p>
                </div>
                <Car className="w-12 h-12 text-orange-500" />
              </div>
            </Card>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  hover
                  onClick={() => action.id === 'emergency' ? onNavigate('services') : onNavigate(action.id)}
                  className="p-4"
                >
                  <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">City Services Status</h2>
          <div className="space-y-3">
            {cityStatus.map((status) => (
              <Card key={status.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {status.service_type === 'traffic' && 'Traffic'}
                      {status.service_type === 'air_quality' && 'Air Quality'}
                      {status.service_type === 'water_supply' && 'Water Supply'}
                      {status.service_type === 'power_supply' && 'Power Supply'}
                    </h3>
                    <p className="text-sm text-gray-600">{status.description}</p>
                  </div>
                  <Badge variant={getStatusColor(status.status)}>
                    {status.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card glass className="p-5 bg-gradient-to-r from-teal-500 to-blue-600">
          <div className="flex items-center gap-3 text-white">
            <RefreshCw className="w-6 h-6" />
            <div>
              <h3 className="font-semibold mb-1">Auto-Refresh Enabled</h3>
              <p className="text-sm text-white/90">Data updates every 5 minutes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
