"use server";

import { db, COLLECTIONS } from "@/lib/firebase";

interface WeatherCache {
  location: string;
  lat: number;
  lon: number;
  forecastData: any;
  fetchedAt: Date;
}

/**
 * Fetch weather forecast for a specific date and location
 * Using OpenWeatherMap 5-day/3-hour forecast API (free tier) with database caching
 */
export async function getWeatherForMatch(
  location: string,
  matchDate: Date
): Promise<{ icon: string; temp: number; condition: string } | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.warn("OPENWEATHER_API_KEY not set, returning mock weather");
    return getMockWeather();
  }

  try {
    // For North Carolina locations, use approximate coordinates
    const coords = getCoordinatesForLocation(location);

    if (!coords) {
      return getMockWeather();
    }

    // Check if match is within 5 days (forecast limit)
    const now = new Date();
    const daysAway = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysAway > 5 || daysAway < 0) {
      // Outside forecast range, return mock data
      return getMockWeather();
    }

    // Check cache first
    const cacheKey = `${coords.lat}_${coords.lon}`;
    const cachedWeather = await getCachedWeather(cacheKey);

    let forecastData;
    if (cachedWeather && isCacheValid(cachedWeather.fetchedAt)) {
      // Use cached data
      forecastData = cachedWeather.forecastData;
    } else {
      // Fetch fresh data from API
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=imperial`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Weather API error:", response.status, errorText);
        return getMockWeather();
      }

      forecastData = await response.json();

      // Cache the forecast data
      await cacheWeatherData(cacheKey, location, coords, forecastData);
    }

    // Find the closest forecast to the match time
    const matchTime = matchDate.getTime();
    let closestForecast = null;
    let smallestDiff = Infinity;

    for (const item of forecastData.list) {
      const forecastTime = item.dt * 1000;
      const diff = Math.abs(forecastTime - matchTime);

      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestForecast = item;
      }
    }

    if (closestForecast) {
      return {
        icon: getWeatherEmoji(closestForecast.weather[0].main),
        temp: Math.round(closestForecast.main.temp),
        condition: closestForecast.weather[0].description,
      };
    }

    // Fallback to mock if no matching forecast found
    return getMockWeather();
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return getMockWeather();
  }
}

/**
 * Get cached weather data from Firestore
 */
async function getCachedWeather(cacheKey: string): Promise<WeatherCache | null> {
  try {
    const doc = await db.collection(COLLECTIONS.WEATHER_CACHE).doc(cacheKey).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return {
      location: data?.location,
      lat: data?.lat,
      lon: data?.lon,
      forecastData: data?.forecastData,
      fetchedAt: data?.fetchedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error reading weather cache:", error);
    return null;
  }
}

/**
 * Cache weather data in Firestore
 */
async function cacheWeatherData(
  cacheKey: string,
  location: string,
  coords: { lat: number; lon: number },
  forecastData: any
): Promise<void> {
  try {
    await db.collection(COLLECTIONS.WEATHER_CACHE).doc(cacheKey).set({
      location,
      lat: coords.lat,
      lon: coords.lon,
      forecastData,
      fetchedAt: new Date(),
    });
  } catch (error) {
    console.error("Error caching weather data:", error);
  }
}

/**
 * Check if cached data is still valid (less than 3 hours old)
 */
function isCacheValid(fetchedAt: Date): boolean {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return fetchedAt > threeHoursAgo;
}

/**
 * Get approximate coordinates for common NC cricket locations
 */
function getCoordinatesForLocation(location: string): { lat: number; lon: number } | null {
  const locationLower = location.toLowerCase();

  // Common cricket grounds in NC
  const locations: Record<string, { lat: number; lon: number }> = {
    "bond park": { lat: 35.7915, lon: -78.7811 },
    "cary": { lat: 35.7915, lon: -78.7811 },
    "apex": { lat: 35.7326, lon: -78.8503 },
    "morrisville": { lat: 35.8235, lon: -78.8253 },
    "durham": { lat: 35.9940, lon: -78.8986 },
    "raleigh": { lat: 35.7796, lon: -78.6382 },
    "charlotte": { lat: 35.2271, lon: -80.8431 },
    "chapel hill": { lat: 35.9132, lon: -79.0558 },
  };

  // Try to match location
  for (const [key, coords] of Object.entries(locations)) {
    if (locationLower.includes(key)) {
      return coords;
    }
  }

  // Default to Cary if no match
  return locations["cary"];
}

/**
 * Convert OpenWeather condition to emoji
 */
function getWeatherEmoji(condition: string): string {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes("clear")) return "☀️";
  if (conditionLower.includes("cloud")) return "☁️";
  if (conditionLower.includes("rain")) return "🌧️";
  if (conditionLower.includes("thunder")) return "⛈️";
  if (conditionLower.includes("snow")) return "❄️";
  if (conditionLower.includes("mist") || conditionLower.includes("fog")) return "🌫️";

  return "🌤️"; // Default partly cloudy
}

/**
 * Return mock weather data when API is unavailable
 */
function getMockWeather(): { icon: string; temp: number; condition: string } {
  const temps = [72, 75, 78, 80, 82, 85];
  const conditions = [
    { icon: "☀️", condition: "Clear" },
    { icon: "🌤️", condition: "Partly Cloudy" },
    { icon: "☁️", condition: "Cloudy" },
  ];

  const randomTemp = temps[Math.floor(Math.random() * temps.length)];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

  return {
    icon: randomCondition.icon,
    temp: randomTemp,
    condition: randomCondition.condition,
  };
}
