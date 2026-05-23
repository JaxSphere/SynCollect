import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAccount } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';
import { createVisit } from '../../shared/api/visits';

export function PTPEntryScreen() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { account, loading, error } = useAccount(accountId);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const visitData = (location.state as any)?.visitData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) {
      setSubmitError('Please fill in both amount and payment date');
      return;
    }

    if (!accountId) {
      setSubmitError('Account ID not found');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createVisit({
        accountId,
        remarkType: 'willing',
        ptpAmount: parseFloat(amount),
        ptpDate: date,
        notes: visitData?.notes || notes || undefined,
        gpsVerified: visitData?.gpsVerified || false,
      });

      navigate('/fo/success', { state: { remarkType: 'willing', ptpAmount: amount, ptpDate: date } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save PTP');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading…</div>;
  }

  if (error || !account) {
    return <div className="p-4 text-red-600">{error ?? 'Account not found'}</div>;
  }

  const minDate = new Date().toISOString().split('T')[0];
  const isFormValid = amount && date;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <OfflineBanner />

      <div className="bg-green-600 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/fo/visit/${accountId}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Promise to Pay Entry</h1>
            <p className="text-green-100 text-sm">{account.debtorName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Outstanding Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ₱{account.balance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promised Amount *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="0.01"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount (₱)"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Debtor has agreed to pay this amount
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Expected date of payment
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Payment method, conditions, or other relevant information..."
              />
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {submitError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || submitting}
          className={`w-full py-4 rounded-xl font-semibold transition-colors ${
            isFormValid && !submitting
              ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit PTP'}
        </button>
      </div>
    </div>
  );
}
