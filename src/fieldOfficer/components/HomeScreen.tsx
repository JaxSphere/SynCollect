import { useNavigate } from 'react-router';
import { Calendar, MapPin, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/auth';
import { useAccounts } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  visited: { label: 'Visited', color: 'bg-gray-100 text-gray-800' },
  ptp: { label: 'PTP', color: 'bg-green-100 text-green-800' },
  unlocated: { label: 'Unlocated', color: 'bg-red-100 text-red-800' },
  refused: { label: 'Refused', color: 'bg-orange-100 text-orange-800' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-800' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  legal: { label: 'Legal', color: 'bg-red-100 text-red-800' },
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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const pendingCount = accounts.filter((acc) => acc.status === 'pending').length;

  if (loading) {
    return <div className="p-4 text-gray-600">Loading accounts…</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBanner />

      <div className="bg-blue-600 text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Daily Itinerary</h1>
            <p className="text-blue-100 text-sm flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Log out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">Total Accounts</p>
            <p className="text-2xl font-bold">{accounts.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">Pending Visits</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {accounts.map((account) => {
          const status = getStatusStyle(account.status);
          return (
            <div
              key={account.id}
              onClick={() => navigate(`/fo/account/${account.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 active:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{account.debtorName}</h3>
                  <p className="text-sm text-gray-600">{account.id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 line-clamp-1">{account.debtorAddress ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-red-600">
                    ?{account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
