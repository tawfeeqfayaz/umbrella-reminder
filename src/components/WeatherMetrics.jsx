import { Droplet, Wind, CloudRain } from "lucide-react";
import MetricCard from "./MetricCard";
import { getHumidityStatus } from "../utils/weatherUtils";

function WeatherMetrics({ humidity, windSpeed, precipitation }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
      <MetricCard
        title="Humidity"
        value={`${Math.round(humidity)}%`}
        subtitle={getHumidityStatus(humidity)}
        icon={<Droplet size={20} color="#9985ff" strokeWidth={3} />}
      />
      <MetricCard
        title="Wind Speed"
        value={Math.round(windSpeed)}
        unit="km/h"
        icon={<Wind size={20} color="#b4ffc9" strokeWidth={3} />}
      />
      <MetricCard
        title="Precipitation"
        value={Math.round(precipitation)}
        unit="mm"
        icon={<CloudRain size={20} color="#ffb285" strokeWidth={3} />}
      />
    </div>
  );
}

export default WeatherMetrics;
