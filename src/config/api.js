// Weather API Providers
// FIX: API keys now read from environment variables, never hardcoded.
// Create a .env file (and add it to .gitignore!) with:
//   VITE_WEATHERAPI_KEY=your_key_here
//   VITE_OPENWEATHER_KEY=your_key_here
//   VITE_BACKEND_API=http://localhost:5000/api
export const WEATHER_APIS = {
  OPEN_METEO: {
    name: "Open-Meteo",
    base: "https://api.open-meteo.com/v1",
    geocoding: "https://geocoding-api.open-meteo.com/v1",
    requiresKey: false,
  },
  WEATHERAPI: {
    name: "WeatherAPI.com",
    base: "https://api.weatherapi.com/v1",
    requiresKey: true,
    key: import.meta.env.VITE_WEATHERAPI_KEY || "",
  },
  OPENWEATHER: {
    name: "OpenWeatherMap",
    base: "https://api.openweathermap.org/data/2.5",
    requiresKey: true,
    key: import.meta.env.VITE_OPENWEATHER_KEY || "",
  },
};

// FIX: removed duplicate API_BASE and GEOCODING_API exports — they were
// re-stating values already inside WEATHER_APIS, creating two sources of
// truth that could drift. Use WEATHER_APIS.OPEN_METEO.base directly.
export const GEOCODING_API = WEATHER_APIS.OPEN_METEO.geocoding;

// Backend API URL — override via VITE_BACKEND_API in production
export const BACKEND_API =
  import.meta.env.VITE_BACKEND_API || "http://localhost:5000/api";
