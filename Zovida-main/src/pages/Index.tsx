import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ZovidaLogo from '@/components/ZovidaLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import MedicineReminders from '@/components/MedicineReminders';
import DoctorAppointments from '@/components/DoctorAppointments';
import ManualEntryModal from '@/components/ManualEntryModal';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import LandingHome from '@/components/LandingHome';
import UserDashboard from '@/components/UserDashboard';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { endpoints } from '@/lib/api';
import { 
  Scan, 
  Shield, 
  Users, 
  Plus,
  Sparkles, 
  ChevronRight,
  Pill,
  Heart,
  CheckCircle,
  History,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Phone,
  UserPlus,
  Zap,
  ShieldCheck,
  Activity,
  Calendar,
  Share2,
  Stethoscope,
  Globe,
  Info
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      <Header onManualEntry={handleManualEntry} />

      {isAuthenticated ? (
        <UserDashboard 
          safeScore={safeScore} 
          onManualEntry={handleManualEntry} 
        />
      ) : (
        <LandingHome 
          onManualEntry={handleManualEntry} 
        />
      )}

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
      <BottomNav />
    </div>
  );
};

export default Index;
