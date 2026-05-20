import { useState, useEffect } from "react";
import { X, Mail, MessageSquare, Bell } from "lucide-react";

function RainAlertModal({
  isOpen,
  onClose,
  onSubscribe,
  cityName,
  cityData,
  mode = "create",
  initialThreshold,
  initialNotificationMethod,
  initialEmail,
  initialPhone,
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [threshold, setThreshold] = useState(50);
  const [notificationMethod, setNotificationMethod] = useState("email");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit") {
      setEmail(initialEmail || "");
      setPhone(initialPhone || "");
      setThreshold(initialThreshold ?? 50);
      setNotificationMethod(initialNotificationMethod || "email");
    } else {
      setEmail("");
      setPhone("");
      setThreshold(50);
      setNotificationMethod("email");
    }
    setErrors({});
  }, [
    isOpen,
    mode,
    initialEmail,
    initialPhone,
    initialThreshold,
    initialNotificationMethod,
  ]);

  const validateForm = () => {
    const newErrors = {};

    if (notificationMethod === "email" || notificationMethod === "both") {
      if (!email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (notificationMethod === "sms" || notificationMethod === "both") {
      if (!phone) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
        newErrors.phone = "Invalid phone format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Prepare subscription data with correct field names for backend
        const baseData = {
          email:
            notificationMethod === "email" || notificationMethod === "both"
              ? email
              : null,
          phone:
            notificationMethod === "sms" || notificationMethod === "both"
              ? phone
              : null,
          threshold: threshold,
          notification_method: notificationMethod, // ← Changed: snake_case
        };

        // For create: include city/location fields
        const subscriptionData =
          mode === "edit"
            ? baseData
            : {
                ...baseData,
                city: cityData.name,
                country: cityData.country_code || cityData.country,
                latitude: cityData.latitude,
                longitude: cityData.longitude,
              };

        console.log("📤 Sending subscription data:", subscriptionData);

        await onSubscribe(subscriptionData);

        // Reset form
        setEmail("");
        setPhone("");
        setThreshold(50);
        setNotificationMethod("email");
        setErrors({});
      } catch (error) {
        console.error("Subscription error:", error);
        setErrors({
          submit: error.message || "Failed to subscribe. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl max-w-2xl w-full shadow-2xl">
        <div className="bg-black/40 backdrop-blur-md rounded-3xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Bell size={24} />
                Rain Alert Setup
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {mode === "edit"
                  ? `Update how you get alerts for ${cityName}`
                  : `Get notified when rain is coming to ${cityName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Notification Method */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Notification Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNotificationMethod("email")}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition ${
                    notificationMethod === "email"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  } disabled:opacity-50`}
                >
                  <Mail size={20} />
                  <span className="text-xs">Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationMethod("sms")}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition ${
                    notificationMethod === "sms"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  } disabled:opacity-50`}
                >
                  <MessageSquare size={20} />
                  <span className="text-xs">SMS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationMethod("both")}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition ${
                    notificationMethod === "both"
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  } disabled:opacity-50`}
                >
                  <Bell size={20} />
                  <span className="text-xs">Both</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            {(notificationMethod === "email" ||
              notificationMethod === "both") && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 transition disabled:opacity-50"
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Phone Input */}
            {(notificationMethod === "sms" ||
              notificationMethod === "both") && (
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-white/40 transition disabled:opacity-50"
                />
                {errors.phone && (
                  <p className="text-red-300 text-xs mt-1">{errors.phone}</p>
                )}
                <p className="text-white/50 text-xs mt-1 mb-4">
                  
                </p>
              </div>
            )}

            {/* Threshold Slider */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Rain Probability Threshold: {threshold}%
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-50"
              />
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>10%</span>
                <span>50%</span>
                <span>90%</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-white/70 text-xs leading-relaxed">
                We check the forecast every hour and send notifications when
                rain probability exceeds {threshold}% in the next 24 hours.
                You'll receive alerts up to once every 6 hours.
              </p>
            </div>

            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                <p className="text-red-200 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl bg-white text-blue-600 hover:bg-white/90 transition font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RainAlertModal;
