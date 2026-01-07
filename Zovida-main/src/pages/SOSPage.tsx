import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Phone, 
  MapPin, 
  Users, 
  AlertTriangle, 
  ArrowLeft, 
  MessageSquare, 
  Heart,
  Navigation,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Ambulance,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import ZovidaLogo from '@/components/ZovidaLogo';
import BottomNav from '@/components/BottomNav';
import { endpoints } from '@/lib/api';

interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  status: 'notified' | 'pending';
}

const SOSPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(5);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'shared' | 'error'>('requesting');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: "Local Emergency Services", phone: "911", relation: "Service", status: "pending" }
  ]);

  useEffect(() => {
    const fetchFamily = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      if (userId) {
        try {
          const response = await fetch(endpoints.family.get(userId));
          if (response.ok) {
            const data = await response.json();
            const contacts: EmergencyContact[] = [
              { name: "Local Emergency Services", phone: "911", relation: "Service", status: 'pending' },
              ...data.map((m: any) => ({
                name: m.name,
                phone: m.phone,
                relation: m.relation,
                status: 'pending'
              }))
            ];
            setEmergencyContacts(contacts);
          }
        } catch (error) {
          console.error('Error fetching family for SOS:', error);
        }
      }
    };
    fetchFamily();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && !isAlertActive) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !isAlertActive) {
      handleTriggerAlert();
    }
    return () => clearTimeout(timer);
  }, [countdown, isAlertActive]);

  const handleTriggerAlert = () => {
    setIsAlertActive(true);
    setLocationStatus('shared');
    setEmergencyContacts(prev => prev.map(c => ({ ...c, status: 'notified' })));
    toast.error("Emergency Alert Sent!", {
      description: "Emergency services and your primary contacts have been notified of your location.",
      duration: 10000,
    });
  };

  const handleCancel = () => {
    if (isAlertActive) {
      setIsAlertActive(false);
      setCountdown(5);
      setEmergencyContacts(prev => prev.map(c => ({ ...c, status: 'pending' })));
      toast.success("Emergency Alert Cancelled");
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-[calc(8rem+env(safe-area-inset-bottom,0px))] md:pb-24">
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 text-white hover:bg-white/10 rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={22} />
          </Button>
          <ZovidaLogo size="sm" />
        </div>
        <div className="flex items-center gap-2 text-red-500 font-bold">
          <ShieldAlert className="animate-pulse" />
          EMERGENCY MODE
        </div>
      </header>

      <main className="flex-1 container max-w-2xl px-4 py-8 space-y-8">
        {!isAlertActive ? (
          <div className="text-center space-y-6 py-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative inline-block"
            >
              <div className="absolute inset-0 bg-red-600 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative w-48 h-48 rounded-full border-4 border-red-500/30 flex items-center justify-center bg-red-950/20 backdrop-blur-sm">
                <span className="text-8xl font-black text-red-500">{countdown}</span>
              </div>
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Triggering SOS...</h1>
              <p className="text-slate-400">Your emergency contacts will be notified in {countdown} seconds if you don't cancel.</p>
            </div>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full h-16 text-xl rounded-2xl border-white/20 hover:bg-white/10"
              onClick={handleCancel}
            >
              <X className="mr-2" /> Cancel SOS
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-red-950/20 border-red-500/50 backdrop-blur-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="text-white" size={32} />
                </div>
                <CardTitle className="text-2xl text-red-500">SOS ACTIVE</CardTitle>
                <CardDescription className="text-red-200/70">
                  Emergency alert broadcasted at {currentTime.toLocaleTimeString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-red-500" />
                    <div>
                      <p className="font-medium">Live Location Shared</p>
                      <p className="text-xs text-slate-400">40.7128° N, 74.0060° W</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle2 size={16} />
                    Active
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Users className="text-red-500" />
                    <div>
                      <p className="font-medium">Emergency Contacts</p>
                      <p className="text-xs text-slate-400">3 people notified via SMS/Call</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-500 text-sm">
                    <CheckCircle2 size={16} />
                    Sent
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ambulance size={20} className="text-red-500" />
                Emergency Actions
              </h2>
              
              <Button 
                className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-bold shadow-lg shadow-red-900/40"
                onClick={() => window.open('tel:911')}
              >
                <Phone className="mr-2" /> Call 911 Now
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 border-none"
                  onClick={() => toast.info("Opening Chat with Emergency Services")}
                >
                  <MessageSquare className="mr-2" size={18} /> Chat 911
                </Button>
                <Button 
                  variant="secondary" 
                  className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 border-none"
                  onClick={() => toast.info("Opening navigation to nearest hospital")}
                >
                  <Navigation className="mr-2" size={18} /> Nearby ER
                </Button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users size={20} className="text-red-500" />
                Notified Contacts
              </h2>
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      {contact.name[0]}
                    </div>
                    <div>
                      <p className="font-bold">{contact.name}</p>
                      <p className="text-xs text-slate-400">{contact.relation} • {contact.phone}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/10" onClick={() => window.open(`tel:${contact.phone}`)}>
                    <Phone size={20} />
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              variant="ghost" 
              className="w-full text-red-500 hover:bg-red-500/10 h-12 mt-8"
              onClick={handleCancel}
            >
              Stop SOS Broadcast
            </Button>
          </motion.div>
        )}
      </main>

      <BottomNav />

      {/* Footer info */}
      <footer className="p-6 text-center text-slate-500 text-xs">
        <p>Your biometric data and health records have been shared with emergency responders.</p>
        <p className="mt-1">Stay calm. Help is on the way.</p>
      </footer>
    </div>
  );
};

export default SOSPage;
