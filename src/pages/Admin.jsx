import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AdminDashboard from "../components/AdminDashboard";
import { clearAdminAuth, isAdminAuthed } from "../utils/adminAuth";

function Admin() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdminAuthed()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg text-white">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/70">
              Monitor subscriptions and backend health.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearAdminAuth();
                navigate("/admin/login", { replace: true });
              }}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
            >
              Sign out
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
            >
              ← Back to app
            </Link>
          </div>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}

export default Admin;

