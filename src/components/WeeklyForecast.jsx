import weatherIcons from "../utils/weatherIcons";

function WeeklyForecast({ weeklyData }) {
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg text-white">
      <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {weeklyData.map((d, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center bg-black/15 rounded-3xl p-4"
          >
            <p className="text-s">{d.day}</p>
            <p className="text-md font-semibold my-4">{d.temp}</p>
            <span>{weatherIcons[d.icon]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyForecast;
