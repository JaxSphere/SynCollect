import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, CalendarDays, Settings, RefreshCw, LogOut, User, Lock } from 'lucide-react';
import { useAuth } from '../../auth/auth';

// Replace with your real sync hook
function useSync() {
  const [syncing, setSyncing] = useState(false);
  const unsyncedCount = 0; // replace with real count

  const syncNow = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 1500)); // replace with real sync call
    setSyncing(false);
  };

  return { unsyncedCount, syncing, syncNow };
}

export function SettingsScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { unsyncedCount, syncing, syncNow } = useSync();

  const [autoSync, setAutoSync] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.11)',
  };

  const sectionLabel = "text-white font-semibold text-base mb-2 px-1";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b38 0%, #112044 50%, #0d1b38 100%)' }}
    >
      {/* Top bar */}
      <div
        className="px-5 pt-8 pb-4 text-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-white text-lg font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 space-y-5">

        {/* Sync card */}
        <div className="rounded-2xl p-5 text-center" style={glass}>
          <p className="text-white text-5xl font-bold mb-1">{unsyncedCount}</p>
          <p className="text-blue-200 text-sm font-medium">Unsynced Items</p>
          <p className="text-blue-400 text-xs mt-0.5 mb-4">Waiting to sync to server</p>

          <button
            type="button"
            onClick={syncNow}
            disabled={syncing}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: syncing ? 'rgba(147,197,253,0.2)' : 'rgba(147,197,253,0.25)',
              color: syncing ? 'rgba(147,197,253,0.6)' : '#93c5fd',
              border: '1px solid rgba(147,197,253,0.3)',
            }}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync Now'}
          </button>
        </div>

        {/* Auto-Sync Settings */}
        <section>
          <h2 className={sectionLabel}>Auto-Sync Settings</h2>
          <div className="rounded-2xl overflow-hidden" style={glass}>
            {/* Auto-sync toggle */}
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-white text-sm">Auto-sync</span>
              <button
                type="button"
                role="switch"
                aria-checked={autoSync}
                onClick={() => setAutoSync(v => !v)}
                className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                style={{ background: autoSync ? '#3b82f6' : 'rgba(255,255,255,0.15)' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  style={{ transform: autoSync ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>

            {/* WiFi only toggle */}
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-white text-sm">Sync photos only on WiFi</span>
              <button
                type="button"
                role="switch"
                aria-checked={wifiOnly}
                onClick={() => setWifiOnly(v => !v)}
                className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none"
                style={{ background: wifiOnly ? '#3b82f6' : 'rgba(255,255,255,0.15)' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  style={{ transform: wifiOnly ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h2 className={sectionLabel}>Account Settings</h2>
          <div className="rounded-2xl overflow-hidden space-y-2" style={{ gap: 0 }}>

            <button
              type="button"
              onClick={() => navigate('/fo/account-info')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-medium transition-colors"
              style={glass}
            >
              <User className="w-4 h-4 text-blue-300" />
              View account information
            </button>

            <button
              type="button"
              onClick={() => navigate('/fo/change-password')}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-medium transition-colors mt-2"
              style={glass}
            >
              <Lock className="w-4 h-4 text-blue-300" />
              Change password
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-medium transition-colors mt-2"
              style={{ ...glass, color: '#f87171' }}
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>

          </div>
        </section>

      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-6 py-3"
        style={{
          background: 'rgba(13, 27, 56, 0.95)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/fo')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/schedule')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Schedule"
        >
          <CalendarDays className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/settings')}
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}