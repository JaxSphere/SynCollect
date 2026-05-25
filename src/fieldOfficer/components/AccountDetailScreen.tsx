import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Phone, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAccount } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';

export function AccountDetailScreen() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { account, loading, error } = useAccount(accountId);

  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';

  const formatCurrency = (value: number | null | undefined) =>
    value != null ? `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—';

  const getVisitActionLabel = (action: string) => {
    const normalized = action.replace(/^visit\s*-\s*/i, '').replace(/_/g, ' ').trim();
    if (!normalized) {
      return action;
    }

    const titleCased = normalized
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    if (titleCased.toLowerCase() === 'willing' || normalized.toUpperCase() === 'PTP') {
      return 'Promise to Pay';
    }

    return titleCased;
  };

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
            <p className="text-blue-100 text-sm">Account #{account.accountNumber}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          This account is assigned to you. Review the details below before starting the visit.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Debtor Information</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Client Name</p>
                <p className="font-medium text-gray-900">{account.debtorName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{account.debtorPhone || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Address</p>
                <p className="font-medium text-gray-900">{account.debtorAddress || '—'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Summary</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Account Number</p>
                <p className="font-medium text-gray-900">{account.accountNumber}</p>
              </div>
              {account.creditor && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Creditor</p>
                  <p className="font-medium text-gray-900">{account.creditor}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Year Account</p>
                <p className="font-medium text-gray-900">{account.yearAccount ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(account.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Bill Amount</p>
                <p className="font-medium text-gray-900">{formatCurrency(account.bill)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Outstanding Balance</p>
                <p className="font-medium text-red-600">{formatCurrency(account.balance)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Last Payment</p>
                <p className="font-medium text-gray-900">{formatDate(account.lastPayment)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guarantor Details</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-700">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{account.guarantorName || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Relationship</p>
              <p className="font-medium text-gray-900">{account.relationship || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Contacts</p>
              <p className="font-medium text-gray-900">{account.guarantorContacts || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{account.guarantorAddress || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <p className="text-sm text-gray-700">{account.remarks || 'No remarks for this account.'}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Visit History</h3>
          </div>

          <div className="space-y-3">
            {account.history.length === 0 ? (
              <p className="text-sm text-gray-600">No visit history has been recorded for this account yet.</p>
            ) : (
              account.history.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900">{getVisitActionLabel(entry.action)}</p>
                    {entry.amount != null && (
                      <span className="font-semibold text-green-600">
                        {formatCurrency(entry.amount)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-700 mt-1 italic">{entry.notes}</p>
                  )}
                </div>
              ))
            )}
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
