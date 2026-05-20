import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { WEATHER_APIS } from "../config/api";

function ApiSelector({ currentApi, onApiChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (apiKey) => {
    onApiChange(apiKey);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-2xl text-white hover:bg-black/40 transition"
      >
        <span className="text-sm font-medium">
          {WEATHER_APIS[currentApi].name}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden z-50">
          {Object.entries(WEATHER_APIS).map(([key, api]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition ${
                currentApi === key ? "bg-white/20" : ""
              }`}
            >
              <div className="font-medium">{api.name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ApiSelector;
