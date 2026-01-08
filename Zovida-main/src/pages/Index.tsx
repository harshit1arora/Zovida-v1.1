import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import LandingHome from '@/components/LandingHome';
import UserDashboard from '@/components/UserDashboard';
import ManualEntryModal from '@/components/ManualEntryModal';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [history, setHistory] = useState<any[]>([]);
  const [safeScore, setSafeScore] = useState(85);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('zovida_user_id');
    setIsAuthenticated(!!userId);
  }, [location.pathname]);

  const handleManualEntry = () => {
    setIsManualModalOpen(true);
  };

  const handleStartScan = () => {
    navigate('/scan');
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header onManualEntry={handleManualEntry} />

      {isAuthenticated ? (
        <UserDashboard 
          history={history}
          safeScore={safeScore}
          onManualEntry={handleManualEntry}
        />
      ) : (
        <LandingHome 
          onStartScan={handleStartScan}
          onManualEntry={handleManualEntry}
        />
      )}

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
