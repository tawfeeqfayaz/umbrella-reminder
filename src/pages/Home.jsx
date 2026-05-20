import { useWeatherData } from "../hooks/useWeatherData";
import { getWeatherCondition } from "../utils/weatherUtils";
import Sidebar from "../components/Sidebar";
import HourlyForecast from "../components/HourlyForecast";
import WeatherMetrics from "../components/WeatherMetrics";
import WeeklyForecast from "../components/WeeklyForecast";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import ApiSelector from "../components/ApiSelector";

function Home() {
  const {
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
    refetch,
  } = useWeatherData("Srinagar");

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    // FIX: was hardcoded refetch("Srinagar") — now retries the current city
    return <ErrorScreen error={error} onRetry={() => refetch(city)} />;
  }

  if (!weatherData || !cityData) return null;

  const weatherCondition = getWeatherCondition(
    weatherData.current.weather_code
  );
  const humidity = weatherData.current.relative_humidity_2m;
  const windSpeed = weatherData.current.wind_speed_10m;
  const precipitation = weatherData.current.precipitation;

  return (
    <div className="min-h-screen w-full flex justify-center items-center background">
      <div className="p-6 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Sidebar
          cityData={cityData}
          weatherData={weatherData}
          weatherCondition={weatherCondition}
          onCityChange={setCity}
        />

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-end">
            <ApiSelector currentApi={apiType} onApiChange={setApiType} />
          </div>
          <HourlyForecast hourlyData={hourlyData} />
          <WeatherMetrics
            humidity={humidity}
            windSpeed={windSpeed}
            precipitation={precipitation}
          />
          <WeeklyForecast weeklyData={weeklyData} />
        </div>
      </div>
    </div>
  );
}

export default Home;
