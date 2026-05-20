import { useEffect, useMemo, useState } from "react";
import {
  getSubscriptions,
  deleteSubscription,
  updateSubscription,
  checkBackendHealth,
  getStatistics,
} from "../services/rainAlertService";

const methodOptions = [
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "both", label: "Both" },
];

function StatCard({ label, value, sublabel }) {
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-5 shadow-lg text-white">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sublabel ? <p className="text-xs text-white/60 mt-1">{sublabel}</p> : null}
    </div>
  );
}

function AdminDashboard() {
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionBusyId, setActionBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [h, s, subs] = await Promise.all([
        checkBackendHealth(),
        getStatistics(),
        getSubscriptions(),
      ]);
      setHealth(h);
      setStats(s);
      setSubscriptions(subs);
    } catch (e) {
      setError(e?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subscriptions;
    return subscriptions.filter((s) => {
      const hay = [
        s.email,
        s.phone,
        s.city,
        s.country,
        s.notification_method,
        String(s.threshold),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [subscriptions, query]);

  const handleDelete = async (sub) => {
    if (!sub?.id) return;
    const ok = window.confirm(
      `Delete subscription #${sub.id} for ${sub.city}, ${sub.country}?`
    );
    if (!ok) return;

    try {
      setActionBusyId(sub.id);
      await deleteSubscription(sub.id);
      await load();
    } finally {
      setActionBusyId(null);
    }
  };

  const handleQuickUpdate = async (sub, updates) => {
    if (!sub?.id) return;
    try {
      setActionBusyId(sub.id);
      await updateSubscription(sub.id, updates);
      await load();
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Backend status"
          value={health?.status === "healthy" ? "Online" : "Offline"}
          sublabel={
            health
              ? `Monitor: ${health.monitor_running ? "running" : "stopped"}`
              : "—"
          }
        />
        <StatCard
          label="Active subscriptions"
          value={stats?.total_subscriptions ?? "—"}
          sublabel={stats?.most_active_city ? `Top city: ${stats.most_active_city}` : ""}
        />
        <StatCard label="Total alerts sent" value={stats?.total_alerts ?? "—"} />
      </div>

      <div className="bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Subscriptions</h2>
            <p className="text-xs text-white/60">
              View, edit threshold/method, or delete subscriptions.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:border-white/30 text-sm w-full sm:w-72"
              placeholder="Search email / city / country / phone…"
            />
            <button
              onClick={load}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-sm">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-white/70">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-white/70">No subscriptions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/70">
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-3">User</th>
                  <th className="text-left py-3 pr-3">City</th>
                  <th className="text-left py-3 pr-3">Method</th>
                  <th className="text-left py-3 pr-3">Threshold</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const busy = actionBusyId === sub.id;
                  return (
                    <tr key={sub.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">
                        <div className="space-y-0.5">
                          <p className="font-medium">
                            {sub.email || sub.phone || "—"}
                          </p>
                          <p className="text-xs text-white/60">
                            #{sub.id} • alerts sent: {sub.alerts_sent ?? 0}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-medium">
                          {sub.city}, {sub.country}
                        </p>
                        <p className="text-xs text-white/60">
                          {Number(sub.latitude).toFixed(2)}°,{" "}
                          {Number(sub.longitude).toFixed(2)}°
                        </p>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          disabled={busy}
                          value={sub.notification_method}
                          onChange={(e) =>
                            handleQuickUpdate(sub, {
                              notification_method: e.target.value,
                            })
                          }
                          className="px-3 py-2 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
                        >
                          {methodOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          disabled={busy}
                          value={sub.threshold}
                          onChange={(e) =>
                            handleQuickUpdate(sub, {
                              threshold: Number(e.target.value),
                            })
                          }
                          className="px-3 py-2 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:border-white/30"
                        >
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((t) => (
                            <option key={t} value={t}>
                              {t}%
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          disabled={busy}
                          onClick={() => handleDelete(sub)}
                          className="px-3 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/20 transition font-semibold"
                        >
                          {busy ? "Working…" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

