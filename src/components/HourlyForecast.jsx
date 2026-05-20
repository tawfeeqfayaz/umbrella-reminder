import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import weatherIcons from "../utils/weatherIcons";

function HourlyForecast({ hourlyData }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">24-Hour Forecast</h2>
        <div className="flex space-x-2">
          <button
            onClick={scrollLeft}
            className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 bg-black/20 rounded-full hover:bg-black/40 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {hourlyData.map((h, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center rounded-xl py-4 min-w-[80px] flex-shrink-0"
          >
            <p className="text-xs">{h.time}</p>
            <p className="text-2xl font-semibold mt-2">{h.temp}°</p>
            <span className="text-lg mt-2">{weatherIcons[h.icon]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HourlyForecast;
