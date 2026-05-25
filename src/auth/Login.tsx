import React, { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router";
import { ApiError } from "../shared/api/client";
import { useAuth } from "./auth";
import { getHomePath } from "./types";

const ICONS = [
  // dollar coin
  () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <circle cx="32" cy="32" r="28" fill="#C9A227" opacity="0.85" />
      <circle cx="32" cy="32" r="22" fill="#E8B830" opacity="0.6" />
      <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#7A5C00" fontFamily="serif">$</text>
    </svg>
  ),
  // credit card
  () => (
    <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="2" y="2" width="76" height="52" rx="6" fill="#4A6FA5" opacity="0.75" />
      <rect x="2" y="14" width="76" height="12" fill="#2A4A7A" opacity="0.6" />
      <rect x="10" y="34" width="24" height="6" rx="2" fill="#8FB3D9" opacity="0.7" />
      <circle cx="58" cy="37" r="7" fill="#E8B830" opacity="0.6" />
      <circle cx="66" cy="37" r="7" fill="#C9A227" opacity="0.5" />
    </svg>
  ),
  // piggy bank
  () => (
    <svg viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="34" cy="36" rx="26" ry="22" fill="#C9A227" opacity="0.8" />
      <ellipse cx="34" cy="36" rx="20" ry="16" fill="#E8C84A" opacity="0.4" />
      <circle cx="50" cy="26" r="5" fill="#A07820" opacity="0.7" />
      <rect x="26" y="6" width="16" height="8" rx="4" fill="#A07820" opacity="0.7" />
      <circle cx="28" cy="30" r="3" fill="white" opacity="0.4" />
      <rect x="20" y="54" width="8" height="8" rx="2" fill="#A07820" opacity="0.7" />
      <rect x="40" y="54" width="8" height="8" rx="2" fill="#A07820" opacity="0.7" />
    </svg>
  ),
  // document / invoice
  () => (
    <svg viewBox="0 0 56 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="4" y="4" width="48" height="64" rx="4" fill="#4A6FA5" opacity="0.75" />
      <rect x="12" y="20" width="32" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="12" y="30" width="24" height="4" rx="2" fill="white" opacity="0.3" />
      <rect x="12" y="40" width="28" height="4" rx="2" fill="white" opacity="0.3" />
      <rect x="12" y="50" width="20" height="4" rx="2" fill="white" opacity="0.25" />
      <path d="M36 4 L52 20" stroke="white" strokeWidth="1" opacity="0.3" />
      <path d="M36 4 L36 20 L52 20" fill="#3A5A8A" opacity="0.5" />
    </svg>
  ),
  // wallet
  () => (
    <svg viewBox="0 0 72 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="4" y="12" width="64" height="40" rx="6" fill="#C9A227" opacity="0.8" />
      <rect x="4" y="12" width="64" height="12" rx="6" fill="#A07820" opacity="0.6" />
      <rect x="44" y="28" width="20" height="14" rx="4" fill="#7A5C00" opacity="0.5" />
      <circle cx="54" cy="35" r="4" fill="#E8C84A" opacity="0.7" />
    </svg>
  ),
  // airplane (for collections/travel debt)
  () => (
    <svg viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <path d="M64 32 L8 12 L20 30 L8 36 L20 40 L24 52 L36 42 L52 48 Z" fill="#4A6FA5" opacity="0.75" />
      <path d="M20 30 L20 40" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </svg>
  ),
  // bag of money
  () => (
    <svg viewBox="0 0 60 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <ellipse cx="30" cy="46" rx="24" ry="22" fill="#C9A227" opacity="0.85" />
      <rect x="18" y="16" width="24" height="16" rx="8" fill="#A07820" opacity="0.7" />
      <rect x="22" y="10" width="16" height="8" rx="4" fill="#7A5C00" opacity="0.6" />
      <text x="30" y="52" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#7A5C00" fontFamily="serif">$</text>
    </svg>
  ),
  // receipt
  () => (
    <svg viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <path d="M4 4 L48 4 L48 60 L42 56 L36 60 L30 56 L24 60 L18 56 L12 60 L6 56 L4 60 Z" fill="#4A6FA5" opacity="0.75" />
      <rect x="10" y="14" width="32" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="10" y="22" width="22" height="3" rx="1.5" fill="white" opacity="0.3" />
      <rect x="10" y="30" width="28" height="3" rx="1.5" fill="white" opacity="0.3" />
      <rect x="10" y="42" width="32" height="3" rx="1.5" fill="#E8B830" opacity="0.6" />
    </svg>
  ),
];

type FloatingIcon = {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  iconIndex: number;
  dx: number;
  dy: number;
  dr: number;
};

function useFloatingIcons(count: number) {
  const [icons, setIcons] = useState<FloatingIcon[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      size: Math.random() * 32 + 36,
      rotation: Math.random() * 360,
      iconIndex: i % ICONS.length,
      dx: (Math.random() - 0.5) * 0.04,
      dy: (Math.random() - 0.5) * 0.04,
      dr: (Math.random() - 0.5) * 0.06,
    }))
  );

  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      setIcons((prev) =>
        prev.map((icon) => {
          let nx = icon.x + icon.dx;
          let ny = icon.y + icon.dy;
          let ndx = icon.dx;
          let ndy = icon.dy;
          if (nx < 2 || nx > 95) ndx = -ndx;
          if (ny < 2 || ny > 95) ndy = -ndy;
          nx = Math.max(2, Math.min(95, nx));
          ny = Math.max(2, Math.min(95, ny));
          return { ...icon, x: nx, y: ny, rotation: icon.rotation + icon.dr, dx: ndx, dy: ndy };
        })
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return icons;
}

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, role, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const floatingIcons = useFloatingIcons(18);

  if (isAuthenticated && role) {
    return <Navigate to={getHomePath(role)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    try {
      const userRole = await login(username, password);
      navigate(getHomePath(userRole), { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to reach the server. Start the API with: npm run dev:server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A1A3E",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "1rem",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Animated floating icons */}
      {floatingIcons.map((icon) => {
        const IconComponent = ICONS[icon.iconIndex];
        return (
          <div
            key={icon.id}
            style={{
              position: "absolute",
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              width: icon.size,
              height: icon.size,
              transform: `rotate(${icon.rotation}deg)`,
              opacity: 0.45,
              pointerEvents: "none",
              willChange: "transform",
            }}
          >
            <IconComponent />
          </div>
        );
      })}

      {/* Header branding */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem", position: "relative", zIndex: 10 }}>
        <h1 style={{
          color: "white",
          fontSize: "1.6rem",
          fontWeight: 300,
          letterSpacing: "0.02em",
          margin: 0,
          lineHeight: 1.3,
        }}>
          Top Priority<br />
          <span style={{ fontWeight: 600 }}>Collection Agency</span>
        </h1>
      </div>

      {/* Login card */}
      <div style={{
        width: "100%",
        maxWidth: 360,
        background: "rgba(30, 60, 110, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRadius: 16,
        padding: "2rem",
        border: "1px solid rgba(100, 140, 200, 0.25)",
        position: "relative",
        zIndex: 10,
      }}>
        <h2 style={{
          color: "white",
          fontSize: "1.4rem",
          fontWeight: 700,
          textAlign: "center",
          margin: "0 0 0.4rem",
        }}>
          Login
        </h2>
        <p style={{
          color: "rgba(180, 210, 255, 0.7)",
          fontSize: "0.82rem",
          textAlign: "center",
          margin: "0 0 1.6rem",
        }}>
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{
              display: "block",
              color: "rgba(200, 225, 255, 0.85)",
              fontSize: "0.82rem",
              marginBottom: "0.4rem",
              fontWeight: 500,
            }} htmlFor="username">
              Email Address
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your email"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.65rem 0.9rem",
                background: "rgba(10, 30, 70, 0.7)",
                border: "1px solid rgba(100, 150, 220, 0.3)",
                borderRadius: 8,
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(100, 160, 255, 0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(100, 150, 220, 0.3)")}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              color: "rgba(200, 225, 255, 0.85)",
              fontSize: "0.82rem",
              marginBottom: "0.4rem",
              fontWeight: 500,
            }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0.65rem 0.9rem",
                background: "rgba(10, 30, 70, 0.7)",
                border: "1px solid rgba(100, 150, 220, 0.3)",
                borderRadius: 8,
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(100, 160, 255, 0.7)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(100, 150, 220, 0.3)")}
            />
          </div>

          {error && (
            <p style={{
              color: "#FF8A8A",
              fontSize: "0.8rem",
              margin: 0,
              padding: "0.5rem 0.75rem",
              background: "rgba(255, 80, 80, 0.1)",
              borderRadius: 6,
              border: "1px solid rgba(255, 100, 100, 0.25)",
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.7rem",
              background: loading ? "rgba(80, 120, 200, 0.5)" : "rgba(80, 130, 215, 0.85)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "0.25rem",
              transition: "background 0.2s",
              letterSpacing: "0.03em",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget.style.background = "rgba(90, 145, 235, 0.95)");
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.currentTarget.style.background = "rgba(80, 130, 215, 0.85)");
            }}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

      </div>

      {/* Footer branding */}
      <div style={{ marginTop: "1.75rem", textAlign: "center", position: "relative", zIndex: 10 }}>
        <img src="/logo.png" alt="SynCollect" style={{ height: 60, width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}