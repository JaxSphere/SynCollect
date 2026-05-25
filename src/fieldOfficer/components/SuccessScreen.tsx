import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { CheckCircle2, Home } from 'lucide-react';

export function SuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { remarkType, ptpAmount, ptpDate } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/fo');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const getMessage = () => {
    switch (remarkType) {
      case 'willing':
        return 'Promise to Pay recorded successfully!';
      case 'responsed':
        return 'Promise to Pay recorded successfully!';
      case 'unlocated':
        return 'Visit marked as Unlocated';
      case 'moved_out':
      case 'transfer_residence':
        return 'Visit marked as Transfer Residence';
      case 'full_paid':
        return 'Visit marked as Full Paid';
      case 'refuse_to_receive_and_sign':
        return 'Visit marked as Refuse to Receive and Sign';
      case 'for_follow_up':
        return 'Visit marked for follow up';
      case 'dont_have_capacity_to_pay':
        return 'Visit marked as Don’t Have Capacity to Pay';
      case 'onhold_account':
        return 'Visit marked as Onhold Account';
      case 'difficult_to_reach_out':
        return 'Visit marked as Difficult to Reach Out';
      case 'refused':
        return 'Visit marked as Refused to Pay';
      default:
        return 'Visit recorded successfully!';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Success!</h1>
          <p className="text-xl text-gray-700 mb-6">{getMessage()}</p>

          {(remarkType === 'willing' || remarkType === 'responsed') && ptpAmount && ptpDate && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">₱{parseFloat(ptpAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(ptpDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Your visit report has been saved and will sync when online.
            </p>
            <p className="text-xs text-gray-500">
              Redirecting to home in 5 seconds...
            </p>
          </div>

          <button
            onClick={() => navigate('/fo')}
            className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
