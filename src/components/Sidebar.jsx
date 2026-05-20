import { useState, useEffect } from "react";
import { Search, Check } from "lucide-react";
import rainyBg from "../assets/rainy.jpg";
import sunnyBg from "../assets/sunny.jpg";
import cloudyBg from "../assets/cloudy.jpg";
import lightningBg from "../assets/lightning.jpg";
import SidebarDetailCard from "./SidebarDetailCard";
import RainAlertModal from "./RainAlertModal";
import { formatTime } from "../utils/weatherUtils";

import {
  saveSubscription,
  getSubscriptions,
  deleteSubscription,
  updateSubscription,
} from "../services/rainAlertService";

function Sidebar({ cityData, weatherData, weatherCondition, onCityChange }) {
  const [searchInput, setSearchInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [cityData]);

  const loadSubscription = async () => {
    const subscriptions = await getSubscriptions();

    const citySubscription = subscriptions.find((sub) => {
      if (!sub || !cityData) return false;

      const subCountry = (sub.country || "").toLowerCase();
      const countryName = (cityData.country || "").toLowerCase();
      const countryCode = (cityData.country_code || "").toLowerCase();

      return (
        sub.city === cityData.name &&
        (subCountry === countryName || subCountry === countryCode)
      );
    });

    if (citySubscription) {
      setSubscription(citySubscription);
      setIsSubscribed(true);
    } else {
      setIsSubscribed(false);
      setSubscription(null);
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      onCityChange(searchInput);
      setSearchInput("");
    }
  };

  // FIX: replaced deprecated onKeyPress with onKeyDown
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSubscribe = async (subscriptionData) => {
    try {
      const savedSubscription = await saveSubscription(subscriptionData);

      setSubscription(savedSubscription);
      setIsSubscribed(true);
      setIsModalOpen(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      alert("Failed to subscribe: " + error.message);
      throw error;
    }
  };

  const handleUpdateSubscription = async (updates) => {
    if (!subscription?.id) return;

    try {
      const updated = await updateSubscription(subscription.id, updates);

      setSubscription(updated);
      setIsSubscribed(true);
      setIsModalOpen(false);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      alert("Failed to update subscription: " + error.message);
      throw error;
    }
  };

  // FIX: deleteSubscription now throws on failure (consistent with update),
  // so we wrap in try/catch instead of checking a boolean return value
  const handleUnsubscribe = async () => {
    if (!subscription?.id) return;
    try {
      await deleteSubscription(subscription.id);
      setIsSubscribed(false);
      setSubscription(null);
    } catch (error) {
      alert("Failed to unsubscribe: " + error.message);
    }
  };

  const backgrounds = {
    Sunny: sunnyBg,
    Rainy: rainyBg,
    Cloudy: cloudyBg,
    Thunder: lightningBg,
  };

  const dynamicStyle = {
    backgroundImage: `url(${backgrounds[weatherCondition]})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const currentTemp = Math.round(weatherData.current.temperature_2m);
  const feelsLike = Math.round(weatherData.current.apparent_temperature);
  const sunrise = formatTime(weatherData.daily.sunrise[0]);
  const sunset = formatTime(weatherData.daily.sunset[0]);
  const tempMax = Math.round(weatherData.daily.temperature_2m_max[0]);
  const tempMin = Math.round(weatherData.daily.temperature_2m_min[0]);

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <Check size={24} />
          <div>
            <p className="font-semibold">Subscription Activated!</p>
            <p className="text-sm text-green-100">
              Check your email for confirmation
            </p>
          </div>
        </div>
      )}
      <div style={dynamicStyle} className="rounded-3xl">
        <div className="bg-black/70 backdrop-blur-xs p-6 min-h-full shadow-lg rounded-3xl text-white flex flex-col justify-between">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                // FIX: onKeyPress is deprecated — use onKeyDown
                onKeyDown={handleKeyDown}
                className="flex-1 px-6 pb-2.5 pt-2 mb-4 backdrop-blur-sm rounded-3xl bg-white/30 text-white placeholder-gray-200 focus:outline-none"
                placeholder="Search city..."
              />
              <button
                onClick={handleSearch}
                className="p-2.5 mb-4 backdrop-blur-sm bg-white/30 rounded-full hover:bg-white/30 transition"
              >
                <Search size={20} />
              </button>
            </div>

            <h1 className="text-4xl font-bold text-center mt-6">
              {cityData.name}, {cityData.country}
            </h1>
            <p className="text-lg text-center mt-4">
              {weatherCondition} • Feels like {feelsLike}°
            </p>
            <p className="text-7xl font-bold text-center mt-4">
              {currentTemp}°
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <SidebarDetailCard label="Sunrise" value={sunrise} />
            <SidebarDetailCard label="Sunset" value={sunset} />
            <SidebarDetailCard
              label="High / Low"
              value={`${tempMax}° / ${tempMin}°`}
            />
          </div>

          <div className="py-4 mt-4">
            <h3 className="text-2xl font-bold px-2">Rain Alert Bot</h3>
            <p className="text-sm text-gray-300 ps-2 pe-4 mb-3">
              {isSubscribed
                ? `You're subscribed! We'll notify you when rain probability exceeds ${subscription?.threshold}%.`
                : "Subscribe to get an email/SMS when rain probability rises above your threshold."}
            </p>

            {isSubscribed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-xs rounded-2xl text-green-100">
                  <Check size={18} />
                  <span className="text-sm font-medium">
                    Active Subscription
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditMode(true);
                      setIsModalOpen(true);
                    }}
                    className="flex-1 text-center text-sm font-medium text-black/80 bg-green-100 hover:bg-green-200 backdrop-blur-xs px-4 py-2 rounded-2xl transition"
                  >
                    Edit alert
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    className="flex-1 text-center text-sm font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-xs px-4 py-2 rounded-2xl transition"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                }}
                className="w-full text-start text-lg font-semibold text-black/70 bg-green-100 hover:bg-green-200 backdrop-blur-xs px-6 pt-1.5 pb-2 rounded-3xl transition"
              >
                Subscribe now →
              </button>
            )}
          </div>
        </div>
      </div>
      <RainAlertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubscribe={isEditMode ? handleUpdateSubscription : handleSubscribe}
        cityName={cityData.name}
        cityData={cityData}
        mode={isEditMode ? "edit" : "create"}
        initialThreshold={subscription?.threshold}
        initialNotificationMethod={subscription?.notification_method}
        initialEmail={subscription?.email}
        initialPhone={subscription?.phone}
      />
    </>
  );
}

export default Sidebar;
