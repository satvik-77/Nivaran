export type LocationData = {
  latitude: number;
  longitude: number;
  cityName: string;
  address: string;
  timestamp: number;
};

const CACHE_DURATION = 30 * 60 * 1000;
const CACHE_KEY = 'nivaran_user_location';

export async function getUserLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    const cachedLocation = localStorage.getItem(CACHE_KEY);
    if (cachedLocation) {
      const parsed = JSON.parse(cachedLocation);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        resolve(parsed);
        return;
      }
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await reverseGeocode(latitude, longitude);
        const address = await getAddressFromCoords(latitude, longitude);

        const locationData: LocationData = {
          latitude,
          longitude,
          cityName,
          address,
          timestamp: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(locationData));
        resolve(locationData);
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  });
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Unknown Location';
  }
}

async function getAddressFromCoords(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data.address?.road || data.address?.suburb || data.display_name?.split(',')[0] || '';
  } catch (error) {
    console.error('Address lookup error:', error);
    return '';
  }
}

export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 5000 }
    );
  });
}
