import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Camera, Upload, CheckCircle2 } from 'lucide-react';
import { useAccount } from '../hooks/useAccounts';
import { OfflineBanner } from './OfflineBanner';
import { createVisit } from '../../shared/api/visits';

type RemarkType =
  | 'unlocated'
  | 'moved_out'
  | 'refused'
  | 'willing'
  | 'responsed'
  | 'full_paid'
  | 'refuse_to_receive_and_sign'
  | 'for_follow_up'
  | 'dont_have_capacity_to_pay'
  | 'onhold_account'
  | 'difficult_to_reach_out'
  | '';

export function VisitScreen() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { account, loading, error } = useAccount(accountId);

  const [gpsVerified, setGpsVerified] = useState(false);
  const [housePhoto, setHousePhoto] = useState<string | null>(null);
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [remarkType, setRemarkType] = useState<RemarkType>('');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const houseInputRef = useRef<HTMLInputElement>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FORMATS = ['image/jpeg', 'image/png'];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return { valid: false, error: 'Invalid file format. Please upload a JPEG or PNG file.' };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds the 5 MB limit. Please compress or upload a smaller file.' };
    }
    return { valid: true };
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setSubmitError(validation.error || 'Invalid file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        setSubmitError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const validation = validateFile(file);
        if (!validation.valid) {
          setSubmitError(validation.error || 'Invalid file');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalPhotos(prev => [...prev, reader.result as string]);
          setSubmitError(null);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleVerifyGPS = () => {
    setGpsVerified(true);
  };

  const followUpRemarks: RemarkType[] = [
    'unlocated',
    'refuse_to_receive_and_sign',
    'for_follow_up',
    'dont_have_capacity_to_pay',
    'difficult_to_reach_out',
  ];

  const isFollowUpRemark = followUpRemarks.includes(remarkType);

  const handleSubmit = async () => {
    if (!housePhoto || !clientPhoto) {
      setSubmitError('At least one photo is required to complete this visit. Please take a photo and try again.');
      return;
    }

    if (!remarkType) {
      setSubmitError('Please select a visit remark to continue.');
      return;
    }

    if (isFollowUpRemark && !scheduledDate) {
      setShowScheduleModal(true);
      return;
    }

    if (!accountId) {
      setSubmitError('Account ID not found');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (remarkType === 'willing' || remarkType === 'responsed') {
        // For payment responses, pass data to PTP screen without submitting yet
        navigate(`/fo/ptp/${accountId}`, {
          state: {
            visitData: {
              accountId,
              remarkType,
              housePhoto,
              clientPhoto,
              additionalPhotos,
              notes: notes || undefined,
              gpsVerified,
            }
          }
        });
      } else {
        // For other remarks, submit immediately
        await createVisit({
          accountId,
          remarkType,
          housePhoto,
          clientPhoto,
          additionalPhotos,
          scheduledDate: isFollowUpRemark ? scheduledDate : undefined,
          notes: notes || undefined,
          gpsVerified,
        });
        navigate('/fo/success', { state: { remarkType } });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save visit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleConfirm = async () => {
    if (!scheduledDate) {
      setSubmitError('Please select a reschedule date before continuing.');
      return;
    }
    setShowScheduleModal(false);
    await handleSubmit();
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading…</div>;
  }

  if (error || !account) {
    return <div className="p-4 text-red-600">{error ?? 'Account not found'}</div>;
  }

  const isFormValid = remarkType && housePhoto && clientPhoto;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <OfflineBanner />

      <div className="bg-blue-600 text-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/fo/account/${accountId}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Field Visit</h1>
            <p className="text-blue-100 text-sm">{account.debtorName}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">GPS Verification</h3>
            </div>
            {gpsVerified && (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Verify your location at the debtor's address
          </p>
          <button
            onClick={handleVerifyGPS}
            disabled={gpsVerified}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              gpsVerified
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {gpsVerified ? 'Location Verified' : 'Verify GPS Location'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Photo Documentation *</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House Photo *
              </label>
              <input
                ref={houseInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileChange(e, setHousePhoto)}
                className="hidden"
              />
              {housePhoto ? (
                <div className="relative">
                  <img src={housePhoto} alt="House" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => houseInputRef.current?.click()}
                    className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => houseInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-2 hover:border-blue-500 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Capture House Photo</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client/Selfie Photo *
              </label>
              <input
                ref={clientInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileChange(e, setClientPhoto)}
                className="hidden"
              />
              {clientPhoto ? (
                <div className="relative">
                  <img src={clientPhoto} alt="Client" className="w-full h-48 object-cover rounded-lg" />
                  <button
                    onClick={() => clientInputRef.current?.click()}
                    className="absolute top-2 right-2 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => clientInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center gap-2 hover:border-blue-500 transition-colors"
                >
                  <Camera className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">Capture Client Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Visit Remarks *</h3>

          <div className="space-y-3 mb-4">
            {[
              { value: 'unlocated', label: 'Unlocated', color: 'border-red-500 bg-red-50' },
              { value: 'transfer_residence', label: 'Transfer Residence', color: 'border-orange-500 bg-orange-50' },
              { value: 'responsed', label: 'Responsed', color: 'border-green-500 bg-green-50' },
              { value: 'full_paid', label: 'Full Paid', color: 'border-slate-500 bg-slate-50' },
              { value: 'refuse_to_receive_and_sign', label: 'Refuse to Receive and Sign', color: 'border-yellow-500 bg-yellow-50' },
              { value: 'for_follow_up', label: 'For Follow Up', color: 'border-blue-500 bg-blue-50' },
              { value: 'dont_have_capacity_to_pay', label: 'Don’t Have Capacity to Pay', color: 'border-orange-500 bg-orange-50' },
              { value: 'onhold_account', label: 'Onhold Account', color: 'border-slate-500 bg-slate-50' },
              { value: 'difficult_to_reach_out', label: 'Difficult to Reach Out', color: 'border-red-500 bg-red-50' },
            ].map((option) => (
              <label
                key={option.value}
                className={`block border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  remarkType === option.value
                    ? option.color
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="remark"
                  value={option.value}
                  checked={remarkType === option.value}
                  onChange={(e) => setRemarkType(e.target.value as RemarkType)}
                  className="mr-3"
                />
                <span className="font-medium text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional observations or comments..."
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (Optional)
            </label>
            <input
              ref={additionalInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdditionalPhotos}
              className="hidden"
            />
            <button
              onClick={() => additionalInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Upload Additional Images</span>
            </button>
            {additionalPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {additionalPhotos.map((img, idx) => (
                  <img key={idx} src={img} alt={`Additional ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </div>
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
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitting ? 'Submitting...' : (remarkType === 'willing' ? 'Continue to PTP Entry' : 'Submit Visit Report')}
        </button>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reschedule Follow-up</h2>
            <p className="text-sm text-gray-600 mb-4">
              This remark requires a follow-up date. Please choose a reschedule date that will appear on your schedule.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="reschedule-date">
              Reschedule Date
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleConfirm}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Confirm Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
