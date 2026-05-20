import { BACKEND_API } from "../config/api";

const DEBUG = import.meta.env.DEV;
const log = (...args) => DEBUG && console.log(...args);
const logError = (...args) => DEBUG && console.error(...args);

// Admin key is needed for protected backend endpoints.
// Set VITE_ADMIN_API_KEY in your .env (must match backend ADMIN_API_KEY).
const ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || "";

const adminHeaders = {
  "Content-Type": "application/json",
  ...(ADMIN_KEY ? { "X-Admin-Key": ADMIN_KEY } : {}),
};

// ── PUBLIC ENDPOINTS ───────────────────────────────────────────────────

export const saveSubscription = async (subscription) => {
  try {
    const response = await fetch(`${BACKEND_API}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save subscription");
    }
    const data = await response.json();
    log("Subscription saved:", data.subscription);
    return data.subscription;
  } catch (error) {
    logError("Failed to save subscription:", error);
    throw error;
  }
};

export const deleteSubscription = async (subscriptionId) => {
  try {
    const response = await fetch(
      `${BACKEND_API}/subscriptions/${subscriptionId}`,
      { method: "DELETE" }
    );
    if (!response.ok) throw new Error("Failed to delete subscription");
    const data = await response.json();
    log("Subscription deleted:", data.message);
  } catch (error) {
    logError("Failed to delete subscription:", error);
    throw error;
  }
};

export const updateSubscription = async (subscriptionId, updates) => {
  try {
    const response = await fetch(
      `${BACKEND_API}/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let message = "Failed to update subscription";
      if (contentType.includes("application/json")) {
        const error = await response.json();
        message = error.error || message;
      }
      throw new Error(message);
    }
    const data = await response.json();
    log("Subscription updated:", data.subscription);
    return data.subscription;
  } catch (error) {
    logError("Failed to update subscription:", error);
    throw error;
  }
};

export const getAlertHistory = async (subscriptionId) => {
  try {
    const response = await fetch(
      `${BACKEND_API}/subscriptions/${subscriptionId}/alerts`
    );
    if (!response.ok) throw new Error("Failed to fetch alert history");
    const data = await response.json();
    return data.alerts || [];
  } catch (error) {
    logError("Failed to get alert history:", error);
    return [];
  }
};

// ── ADMIN-ONLY ENDPOINTS (require X-Admin-Key header) ─────────────────

export const getSubscriptions = async () => {
  try {
    const response = await fetch(`${BACKEND_API}/subscriptions`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch subscriptions");
    const data = await response.json();
    log(`Fetched ${data.count} subscriptions`);
    return data.subscriptions || [];
  } catch (error) {
    logError("Failed to get subscriptions:", error);
    return [];
  }
};

export const checkAlertsManually = async () => {
  try {
    const response = await fetch(`${BACKEND_API}/check-alerts`, {
      method: "POST",
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to check alerts");
    const data = await response.json();
    log("Alert check completed:", data.message);
    return true;
  } catch (error) {
    logError("Failed to check alerts:", error);
    return false;
  }
};

export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_API}/health`);
    if (!response.ok) throw new Error("Backend unhealthy");
    return await response.json();
  } catch (error) {
    logError("Backend health check failed:", error);
    return { status: "offline", monitor_running: false };
  }
};

export const getStatistics = async () => {
  try {
    const response = await fetch(`${BACKEND_API}/stats`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch statistics");
    const data = await response.json();
    return data.statistics;
  } catch (error) {
    logError("Failed to get statistics:", error);
    return null;
  }
};

export const requestNotificationPermission = async () => {
  if ("Notification" in window && Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return Notification.permission === "granted";
};

// Legacy stubs
export const startMonitoring = () => {};
export const stopMonitoring = () => {};
