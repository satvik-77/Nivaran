import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MapPin, Cloud, Wind } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getUserLocation, LocationData } from '../../lib/locationService';
import { getWeatherData, getAQIData, getTrafficData } from '../../lib/weatherService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

const quickQuestions = [
  'How is traffic near me?',
  'Is air quality safe today?',
  'Will it rain today?',
  'Best time to travel?',
];

export function AIAssistant() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hello ${profile?.full_name || 'there'}! I'm your Nivaran AI Assistant with real-time location awareness. I can tell you about weather, air quality, traffic near you, and help with city services. How can I assist you today?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserLocation();
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadUserLocation() {
    const loc = await getUserLocation();
    if (loc) {
      setLocation(loc);
    }
  }

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(async () => {
      const response = await getBotResponse(messageText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = async (userMessage: string): Promise<string> => {
    const lower = userMessage.toLowerCase();

    if (lower.includes('traffic') && lower.includes('near')) {
      if (!location) return 'Please enable location to check traffic near you.';
      const traffic = await getTrafficData(location.cityName);
      if (traffic) {
        return `Traffic status in ${location.cityName}: ${traffic.status}\n\nCurrent speed: ${traffic.speed} km/h\nCongestion: ${traffic.congestion}\n\nBest time to travel is early morning (6-8 AM) or late evening (8-10 PM).`;
      }
      return 'Unable to fetch traffic data. Please try again.';
    }

    if (lower.includes('air quality') || lower.includes('aqi')) {
      if (!location) return 'Please enable location to check air quality.';
      const aqi = await getAQIData(location.cityName, location.latitude, location.longitude);
      if (aqi) {
        return `Air Quality in ${location.cityName}:\n\nAQI: ${aqi.aqi} (${aqi.status})\nPM2.5: ${aqi.pm25} µg/m³\nPM10: ${aqi.pm10} µg/m³\n\n💡 ${aqi.healthRecommendation}`;
      }
      return 'Unable to fetch air quality data. Please try again.';
    }

    if (lower.includes('weather') || lower.includes('rain') || lower.includes('temperature')) {
      if (!location) return 'Please enable location to check weather.';
      const weather = await getWeatherData(location.cityName, location.latitude, location.longitude);
      if (weather) {
        const rainInfo = weather.condition.toLowerCase().includes('rain')
          ? 'Yes, rain is expected. Carry an umbrella!'
          : 'No rain expected today.';
        return `Weather in ${location.cityName}:\n\nTemperature: ${weather.temperature}°C\nCondition: ${weather.condition}\nHumidity: ${weather.humidity}%\nWind: ${weather.windSpeed} km/h\n\n🌧️ ${rainInfo}`;
      }
      return 'Unable to fetch weather data. Please try again.';
    }

    if (lower.includes('best time') || lower.includes('when to travel')) {
      if (!location) return 'Please enable location to get travel recommendations.';
      const traffic = await getTrafficData(location.cityName);
      const weather = await getWeatherData(location.cityName, location.latitude, location.longitude);

      let recommendation = `Travel recommendations for ${location.cityName}:\n\n`;
      recommendation += '✅ Best times:\n';
      recommendation += '• Early morning: 6-8 AM (light traffic)\n';
      recommendation += '• Late evening: 8-10 PM (reduced congestion)\n';
      recommendation += '• Weekdays are better than weekends\n\n';

      if (weather && weather.condition.toLowerCase().includes('rain')) {
        recommendation += '⚠️ Current conditions: Rainy - allow extra time\n';
      }

      if (traffic && traffic.congestion === 'heavy') {
        recommendation += '🚗 Heavy traffic detected - avoid peak hours\n';
      }

      return recommendation;
    }

    if (lower.includes('report') && lower.includes('problem')) {
      return 'To report a city problem:\n\n1. Go to the "Report" tab\n2. Select the issue category\n3. Add location and description\n4. Upload photos if available\n5. Submit and get a complaint ID\n\nYou can track your complaint in the "Track" tab.';
    }

    if (lower.includes('emergency')) {
      return 'Emergency Numbers:\n\n📞 Police: 100\n🚒 Fire: 101\n🚑 Ambulance: 102\n⚠️ Disaster: 108\n💡 Electricity: 1912\n💧 Water: 1916\n\nCall immediately for urgent situations!';
    }

    if (lower.includes('complaint') && lower.includes('track')) {
      return 'To track your complaints:\n\n1. Go to the "Track" tab\n2. View all your reported issues\n3. Check status (Submitted, Under Review, Assigned, In Progress, Resolved)\n4. See assigned officer details\n5. Chat with support if needed\n\nYou can also set notification preferences in Profile.';
    }

    return `I'm here to help with real-time city data! I can tell you about:\n\n🌤️ Weather and temperature\n💨 Air quality and pollution levels\n🚗 Traffic and travel times\n⏰ Best times to travel\n🆘 Emergency numbers\n📝 Report and track issues\n🏙️ City services\n\nWhat would you like to know?`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Assistant</h1>
            {location && (
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-blue-200" />
                <p className="text-sm text-blue-100">{location.cityName}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-sm text-blue-100">Location-aware & Online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-32">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'bot'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                    : 'bg-teal-500'
                }`}
              >
                {message.sender === 'bot' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>

              <div
                className={`flex-1 max-w-[75%] ${
                  message.sender === 'user' ? 'items-end' : 'items-start'
                } flex flex-col`}
              >
                <Card
                  className={`p-4 ${
                    message.sender === 'bot'
                      ? 'bg-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                </Card>
                <span className="text-xs text-gray-500 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <Card className="p-4 bg-white">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </Card>
            </div>
          )}

          {messages.length === 1 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3 font-medium">Quick Questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(question)}
                    className="text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-gray-700 flex items-center gap-2"
                  >
                    {question.includes('traffic') && <Wind className="w-4 h-4 text-orange-500" />}
                    {question.includes('air') && <Wind className="w-4 h-4 text-green-500" />}
                    {question.includes('rain') && <Cloud className="w-4 h-4 text-blue-500" />}
                    {question.includes('travel') && <MapPin className="w-4 h-4 text-teal-500" />}
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          {location && (
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>Using location: {location.cityName}</span>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about weather, traffic, air quality..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
