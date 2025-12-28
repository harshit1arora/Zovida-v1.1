
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      // Simulate sync
      setTimeout(() => setIsSyncing(false), 2000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !isSyncing) return null;

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300",
      !isOnline ? "bg-destructive text-destructive-foreground" : "bg-green-600 text-white"
    )}>
      {!isOnline ? (
        <>
          <WifiOff size={16} />
          <span className="text-sm font-medium">{t('network.offline')}</span>
        </>
      ) : (
        <>
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm font-medium">{t('network.syncing')}</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
