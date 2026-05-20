import { GEOCODING_API, WEATHER_APIS } from "../config/api";
import { getWeatherIcon, getDayName } from "../utils/weatherUtils";

export const searchCity = async (cityName) => {
  const response = await fetch(
    `${GEOCODING_API}/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
  );

  if (!response.ok) throw new Error("Failed to search city");

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found");
  }

  return data.results[0];
};

export const reverseGeocode = async (latitude, longitude) => {
  const response = await fetch(
    `${GEOCODING_API}/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
  );

  if (!response.ok) throw new Error("Failed to resolve current location");

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Location not found");
  }

  return data.results[0];
};

export const fetchWeatherData = async (
  latitude,
  longitude,
  apiType = "OPEN_METEO"
) => {
  const apiConfig = WEATHER_APIS[apiType];

  if (!apiConfig) {
    throw new Error("Invalid API type");
  }

  if (apiType === "OPEN_METEO") {
    return fetchOpenMeteoData(latitude, longitude);
  } else if (apiType === "WEATHERAPI") {
    return fetchWeatherAPIData(latitude, longitude, apiConfig.key);
  } else if (apiType === "OPENWEATHER") {
    return fetchOpenWeatherData(latitude, longitude, apiConfig.key);
  }
};

const fetchOpenMeteoData = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    hourly:
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
    timezone: "auto",
    forecast_days: 7,
  });

  const response = await fetch(
    `${WEATHER_APIS.OPEN_METEO.base}/forecast?${params}`
  );

  if (!response.ok) throw new Error("Failed to fetch weather data");

  return await response.json();
};

const fetchWeatherAPIData = async (latitude, longitude, apiKey) => {
  const response = await fetch(
    `${WEATHER_APIS.WEATHERAPI.base}/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`
  );

  if (!response.ok)
    throw new Error("Failed to fetch weather data from WeatherAPI");

  const data = await response.json();

  return {
    current: {
      temperature_2m: data.current.temp_c,
      relative_humidity_2m: data.current.humidity,
      apparent_temperature: data.current.feelslike_c,
      weather_code: convertWeatherAPICode(data.current.condition.code),
      wind_speed_10m: data.current.wind_kph,
      precipitation: data.current.precip_mm,
    },
    hourly: {
      time: data.forecast.forecastday.flatMap((day) =>
        day.hour.map((h) => h.time)
      ),
      temperature_2m: data.forecast.forecastday.flatMap((day) =>
        day.hour.map((h) => h.temp_c)
      ),
      weather_code: data.forecast.forecastday.flatMap((day) =>
        day.hour.map((h) => convertWeatherAPICode(h.condition.code))
      ),
      precipitation_probability: data.forecast.forecastday.flatMap((day) =>
        day.hour.map((h) => h.chance_of_rain)
      ),
    },
    daily: {
      time: data.forecast.forecastday.map((day) => day.date),
      weather_code: data.forecast.forecastday.map((day) =>
        convertWeatherAPICode(day.day.condition.code)
      ),
      temperature_2m_max: data.forecast.forecastday.map(
        (day) => day.day.maxtemp_c
      ),
      temperature_2m_min: data.forecast.forecastday.map(
        (day) => day.day.mintemp_c
      ),
      sunrise: data.forecast.forecastday.map((day) => day.astro.sunrise),
      sunset: data.forecast.forecastday.map((day) => day.astro.sunset),
    },
  };
};

const fetchOpenWeatherData = async (latitude, longitude, apiKey) => {
  const currentRes = await fetch(
    `${WEATHER_APIS.OPENWEATHER.base}/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
  );

  const forecastRes = await fetch(
    `${WEATHER_APIS.OPENWEATHER.base}/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
  );

  if (!currentRes.ok || !forecastRes.ok) {
    throw new Error("Failed to fetch weather data from OpenWeatherMap");
  }

  const currentData = await currentRes.json();
  const forecastData = await forecastRes.json();

  const dailyMap = {};
  forecastData.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyMap[date]) {
      dailyMap[date] = {
        temps: [],
        weather: item.weather[0].id,
        date,
        // FIX: OpenWeatherMap free tier /forecast doesn't return per-day
        // sunrise/sunset. We approximate using the current day's values
        // shifted by day offset. For accurate per-day values, upgrade to
        // the One Call API 3.0 endpoint.
        sunriseTs: currentData.sys.sunrise,
        sunsetTs: currentData.sys.sunset,
      };
    }
    dailyMap[date].temps.push(item.main.temp);
  });

  const dailyData = Object.values(dailyMap).slice(0, 7);

  // Approximate sunrise/sunset for each forecast day by offsetting from today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return {
    current: {
      temperature_2m: currentData.main.temp,
      relative_humidity_2m: currentData.main.humidity,
      apparent_temperature: currentData.main.feels_like,
      weather_code: convertOpenWeatherCode(currentData.weather[0].id),
      wind_speed_10m: currentData.wind.speed * 3.6,
      precipitation: 0,
    },
    hourly: {
      time: forecastData.list.map((item) =>
        new Date(item.dt * 1000).toISOString()
      ),
      temperature_2m: forecastData.list.map((item) => item.main.temp),
      weather_code: forecastData.list.map((item) =>
        convertOpenWeatherCode(item.weather[0].id)
      ),
      precipitation_probability: forecastData.list.map((item) =>
        item.pop ? item.pop * 100 : 0
      ),
    },
    daily: {
      time: dailyData.map((d) => d.date),
      weather_code: dailyData.map((d) => convertOpenWeatherCode(d.weather)),
      temperature_2m_max: dailyData.map((d) => Math.max(...d.temps)),
      temperature_2m_min: dailyData.map((d) => Math.min(...d.temps)),
      // FIX: shift each day's sunrise/sunset by the day offset from today
      sunrise: dailyData.map((d) => {
        const dayOffset =
          (new Date(d.date) - todayStart) / (1000 * 60 * 60 * 24);
        return new Date(
          (d.sunriseTs + dayOffset * 86400) * 1000
        ).toISOString();
      }),
      sunset: dailyData.map((d) => {
        const dayOffset =
          (new Date(d.date) - todayStart) / (1000 * 60 * 60 * 24);
        return new Date(
          (d.sunsetTs + dayOffset * 86400) * 1000
        ).toISOString();
      }),
    },
  };
};

const convertWeatherAPICode = (code) => {
  const mapping = {
    1000: 0,
    1003: 1,
    1006: 3,
    1009: 3,
    1030: 45,
    1063: 61,
    1066: 71,
    1069: 67,
    1072: 51,
    1087: 95,
    1114: 75,
    1117: 75,
    1135: 45,
    1147: 48,
    1150: 51,
    1153: 53,
    1168: 56,
    1171: 57,
    1180: 61,
    1183: 61,
    1186: 63,
    1189: 63,
    1192: 65,
    1195: 65,
    1198: 66,
    1201: 67,
    1204: 68,
    1207: 68,
    1210: 71,
    1213: 71,
    1216: 73,
    1219: 73,
    1222: 75,
    1225: 75,
    1237: 86,
    1240: 80,
    1243: 81,
    1246: 82,
    1249: 85,
    1252: 86,
    1255: 85,
    1258: 86,
    1261: 86,
    1264: 86,
    1273: 95,
    1276: 96,
    1279: 95,
    1282: 96,
  };
  return mapping[code] || 3;
};

const convertOpenWeatherCode = (code) => {
  if (code >= 200 && code < 300) return 95;
  if (code >= 300 && code < 400) return 51;
  if (code >= 500 && code < 600) return 61;
  if (code >= 600 && code < 700) return 71;
  if (code >= 700 && code < 800) return 45;
  if (code === 800) return 0;
  if (code === 801) return 1;
  if (code === 802) return 2;
  if (code >= 803) return 3;
  return 3;
};

export const processHourlyData = (hourlyData) => {
  const now = new Date();
  const currentMinutes = now.getMinutes();

  let startMinute = currentMinutes <= 30 ? 30 : 60;
  const nextHalfHour = new Date(now);

  if (startMinute === 60) {
    nextHalfHour.setHours(nextHalfHour.getHours() + 1);
    nextHalfHour.setMinutes(0);
  } else {
    nextHalfHour.setMinutes(30);
  }
  nextHalfHour.setSeconds(0);
  nextHalfHour.setMilliseconds(0);

  const next24Hours = [];

  for (let i = 0; i < 24; i++) {
    const targetTime = new Date(
      nextHalfHour.getTime() + i * 60 * 60 * 1000
    );
    const targetHour = targetTime.getHours();

    let foundIndex = -1;
    for (let j = 0; j < hourlyData.time.length; j++) {
      const dataTime = new Date(hourlyData.time[j]);
      if (dataTime.getHours() === targetHour && dataTime >= nextHalfHour) {
        foundIndex = j;
        break;
      }
    }

    // FIX: was `break` — this stopped ALL remaining hours the moment one
    // hour was missing. Using `continue` instead skips only the missing
    // slot, so later hours that do have data still get included.
    if (foundIndex === -1) continue;

    const isNight = targetHour < 6 || targetHour > 20;
    const displayTime = targetTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    next24Hours.push({
      time: displayTime,
      temp: Math.round(hourlyData.temperature_2m[foundIndex]),
      icon: getWeatherIcon(hourlyData.weather_code[foundIndex], isNight),
      precipitation: hourlyData.precipitation_probability[foundIndex] || 0,
    });
  }

  return next24Hours;
};

export const processDailyData = (dailyData) => {
  return dailyData.time.map((date, idx) => ({
    day: getDayName(date, idx),
    temp: `${Math.round(dailyData.temperature_2m_max[idx])}° / ${Math.round(
      dailyData.temperature_2m_min[idx]
    )}°`,
    icon: getWeatherIcon(dailyData.weather_code[idx]),
  }));
};
