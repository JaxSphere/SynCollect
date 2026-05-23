import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAccount } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';

export function AccountDetailScreen() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { account, loading, error } = useAccount(accountId);

  if (loading) {
    return <div className="p-4 text-gray-600">Loading account…</div>;
  }

  if (error || !account) {
    return <div className="p-4 text-red-600">{error ?? 'Account not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBanner />

      <div className="bg-blue-600 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/fo')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Account Details</h1>
            <p className="text-blue-100 text-sm">{account.id}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{account.debtorName}</h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">{account.debtorPhone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-900">{account.debtorAddress}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Outstanding Balance</p>
                <p className="text-2xl font-bold text-red-600">
                  ₱{account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">Last Payment Date</p>
                <p className="font-medium text-gray-900">
                  {account.lastPayment
                    ? new Date(account.lastPayment).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Visit History</h3>
          </div>

          <div className="space-y-3">
            {account.history.map((entry, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900">{entry.action}</p>
                  {entry.amount && (
                    <span className="font-semibold text-green-600">
                      ₱{entry.amount.toLocaleString('en-PH')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                {entry.notes && (
                  <p className="text-sm text-gray-700 mt-1 italic">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate(`/fo/visit/${account.id}`)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Start Visit
        </button>
      </div>
    </div>
  );
}
