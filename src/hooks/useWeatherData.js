import { useState, useEffect, useCallback } from "react";
import {
  searchCity,
  fetchWeatherData,
  processHourlyData,
  processDailyData,
  reverseGeocode,
} from "../services/weatherService";

export const useWeatherData = (initialCity = "Srinagar") => {
  const [city, setCity] = useState(initialCity);
  const [apiType, setApiType] = useState("OPEN_METEO");
  const [cityData, setCityData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // FIX: wrapped in useCallback so fetchData has a stable reference.
  // Previously it was recreated on every render, causing stale closure
  // issues and ESLint warnings about missing dependencies.
  const fetchData = useCallback(async (cityName, selectedApiType) => {
    try {
      setLoading(true);
      setError(null);

      const cityInfo = await searchCity(cityName);
      setCityData(cityInfo);

      const weather = await fetchWeatherData(
        cityInfo.latitude,
        cityInfo.longitude,
        selectedApiType || apiType
      );

      setWeatherData(weather);
      setHourlyData(processHourlyData(weather.hourly));
      setWeeklyData(processDailyData(weather.daily));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [apiType]);

  // Initialize using current location if available
  useEffect(() => {
    if (!navigator.geolocation) {
      setInitialized(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const cityInfo = await reverseGeocode(latitude, longitude);
          setCity(cityInfo.name);
          setCityData(cityInfo);
        } catch (err) {
          // Geolocation resolved but reverse geocoding failed — fall back to default city
          console.error("Failed to initialize with current location:", err);
        } finally {
          setInitialized(true);
        }
      },
      (geoError) => {
        // User denied permission or timeout — fall back to default city
        console.error("Geolocation error, falling back to default city:", geoError);
        setInitialized(true);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  // Once initialized, fetch weather whenever city or API changes
  useEffect(() => {
    if (!initialized) return;
    fetchData(city, apiType);
  }, [city, apiType, initialized, fetchData]);

  return {
    city,
    setCity,
    apiType,
    setApiType,
    cityData,
    weatherData,
    hourlyData,
    weeklyData,
    loading,
    error,
    refetch: fetchData,
  };
};
