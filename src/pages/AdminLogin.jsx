import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setAdminAuthed } from "../utils/adminAuth";

// ⚠️  SECURITY NOTE (for production use):
// Credentials should NEVER be validated on the frontend. VITE_ env vars
// are bundled into the JavaScript file that ships to the browser — anyone
// can read them in DevTools. In a real app, POST the credentials to a
// backend endpoint (e.g. POST /api/admin/login), validate server-side,
// and return a signed JWT. The frontend stores only that token, never
// the password itself.
//
// This client-side check is acceptable for a college demo/project where
// security is not a grading criterion, but must be replaced before any
// real deployment.

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const redirectTo = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" ? from : "/admin";
  }, [location.state]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const expectedUser = import.meta.env.VITE_ADMIN_USERNAME || "admin";
    const expectedPass = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

    if (username === expectedUser && password === expectedPass) {
      setAdminAuthed(true);
      navigate(redirectTo, { replace: true });
      return;
    }

    setError("Invalid username or password");
  };

  return (
    <div className="min-h-screen w-full background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-lg text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Sign-in</h1>
            <p className="text-sm text-white/70">
              Sign in to access the admin dashboard.
            </p>
          </div>
          <Link
            to="/"
            className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            ← Home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:border-white/30 text-sm"
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 focus:outline-none focus:border-white/30 text-sm"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-3 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
