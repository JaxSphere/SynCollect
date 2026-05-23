import { WifiOff, RefreshCw } from 'lucide-react';
import { useOffline } from '../context/OfflineContext';

export function OfflineBanner() {
  const { isOnline, pendingSyncs, syncData } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <WifiOff className="w-5 h-5" />
        <div>
          <p className="font-semibold">Offline Mode</p>
          <p className="text-sm text-amber-100">
            {pendingSyncs > 0 ? `${pendingSyncs} items pending sync` : 'Data will sync when online'}
          </p>
        </div>
      </div>
      <button
        onClick={syncData}
        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
    </div>
  );
}
