import { useNavigate } from 'react-router';
import { Calendar, MapPin, PhilippinePeso, Home, CalendarDays, Settings } from 'lucide-react';
import { useAuth } from '../../auth/auth';
import { useAccounts } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30' },
  visited: { label: 'Visited', color: 'bg-white/10 text-white/70 border border-white/20' },
  ptp: { label: 'PTP', color: 'bg-green-400/20 text-green-300 border border-green-400/30' },
  unlocated: { label: 'Unlocated', color: 'bg-red-400/20 text-red-300 border border-red-400/30' },
  refused: { label: 'Refused', color: 'bg-orange-400/20 text-orange-300 border border-orange-400/30' },
  active: { label: 'Active', color: 'bg-blue-400/20 text-blue-300 border border-blue-400/30' },
  closed: { label: 'Closed', color: 'bg-white/10 text-white/60 border border-white/20' },
  legal: { label: 'Legal', color: 'bg-red-400/20 text-red-300 border border-red-400/30' },
};

function getStatusStyle(status: string) {
  return statusConfig[status] ?? statusConfig.pending;
}

export function HomeScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { accounts, loading, error } = useAccounts();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const assignedCount = accounts.length;
  const pendingCount = accounts.filter((acc) => acc.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1f3d' }}>
        <p className="text-blue-200 text-sm tracking-wide animate-pulse">Loading accounts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f1f3d' }}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0d1b38 0%, #112044 50%, #0d1b38 100%)' }}
    >
      <OfflineBanner />

      {/* Header */}
      <div className="px-5 pt-8 pb-5">
        <h1 className="text-white text-2xl font-bold tracking-tight">Daily Itinerary</h1>
        <p className="text-blue-300 text-sm mt-0.5">{today}</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Total Accounts</p>
            <p className="text-white text-3xl font-bold">{assignedCount}</p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Pending Visits</p>
            <p className="text-white text-3xl font-bold">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="flex-1 px-4 pb-24 space-y-3 overflow-y-auto">
        {accounts.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center mt-2"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {/* Clipboard icon */}
            <div className="flex justify-center mb-4">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="8" width="24" height="32" rx="3" stroke="rgba(147,197,253,0.5)" strokeWidth="2" fill="none"/>
                <rect x="18" y="4" width="12" height="8" rx="2" stroke="rgba(147,197,253,0.5)" strokeWidth="2" fill="none"/>
                <line x1="18" y1="20" x2="30" y2="20" stroke="rgba(147,197,253,0.4)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="26" x2="30" y2="26" stroke="rgba(147,197,253,0.4)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18" y1="32" x2="24" y2="32" stroke="rgba(147,197,253,0.4)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-white font-semibold text-base mb-1">No accounts assigned yet</p>
            <p className="text-blue-300 text-sm leading-relaxed">
              Your manager has not assigned any collection accounts. Check back later.
            </p>
          </div>
        ) : (
          accounts.map((account) => {
            const status = getStatusStyle(account.status);
            return (
              <div
                key={account.id}
                onClick={() => navigate(`/fo/account/${account.id}`)}
                className="rounded-2xl p-4 cursor-pointer active:scale-[0.99] transition-transform"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.11)',
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-white text-base leading-tight">{account.debtorName}</h3>
                    <p className="text-blue-300 text-xs mt-0.5">{account.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="line-clamp-1">{account.debtorAddress ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PhilippinePeso className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-red-300">
                      ₱{account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
          className="flex flex-col items-center gap-1 text-white"
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium"></span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/schedule')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Schedule"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-medium"></span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/fo/settings')}
          className="flex flex-col items-center gap-1 text-blue-400 opacity-60"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium"></span>
        </button>
      </div>
    </div>
  );
}