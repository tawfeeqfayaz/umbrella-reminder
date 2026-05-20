export const getWeatherIcon = (code, isNight = false) => {
  if (code === 0) return isNight ? "nightClear" : "sunny";
  if (code === 1 || code === 2) return "partlyCloudy";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 85 && code <= 86) return "snowy";
  if (code >= 95 && code <= 99) return "lightning";
  return "cloudy";
};

export const getWeatherCondition = (code) => {
  if (code === 0) return "Sunny";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Cloudy";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Rainy";
  if (code >= 85 && code <= 86) return "Snowy";
  if (code >= 95 && code <= 99) return "Thunder";
  return "Cloudy";
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatTimeShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
};

export const getDayName = (dateString, index) => {
  const date = new Date(dateString);
  const today = new Date();
  // FIX: removed `today.setDate(today.getDate())` — it set the date to
  // itself, doing nothing. The comparison below works correctly without it.

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", { weekday: "short" });
};

export const getHumidityStatus = (h) => {
  if (h < 30) return "dry";
  if (h > 70) return "humid";
  return "normal";
};
