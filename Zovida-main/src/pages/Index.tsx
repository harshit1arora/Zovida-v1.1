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

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      
      // Get local history
      const savedHistory = JSON.parse(localStorage.getItem('zovida_history') || '[]');
      const validLocal = savedHistory.filter((item: any) => item && (item.timestamp || item.date));

      if (userId) {
        try {
          const response = await fetch(endpoints.history(userId));
          if (response.ok) {
            const data = await response.json();
            
            // Map backend data to local format for consistency
            const transformedBackend = data.map((item: any) => ({
              id: `be-${item.id}`,
              timestamp: item.timestamp || new Date().toISOString(),
              overallRisk: (item.level?.toLowerCase() || 'safe'),
              medicines: [
                { name: item.drug1 },
                ...(item.drug2 ? [{ name: item.drug2 }] : [])
              ]
            }));

            // Merge and deduplicate
            const historyMap = new Map();
            validLocal.forEach((item: any) => {
              const key = `${item.medicines?.map((m: any) => m.name).sort().join('|')}-${new Date(item.timestamp).getTime()}`;
              historyMap.set(key, item);
            });
            transformedBackend.forEach((item: any) => {
              const key = `${item.medicines?.map((m: any) => m.name).sort().join('|')}-${new Date(item.timestamp).getTime()}`;
              historyMap.set(key, item);
            });

            const merged = Array.from(historyMap.values())
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            setHistory(merged.slice(0, 3));
            return;
          }
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      }
      
      setHistory(validLocal.slice(0, 3));
    };

    fetchHistory();

    const handleOpenManual = () => setIsManualModalOpen(true);
    window.addEventListener('open-manual-entry', handleOpenManual);
    return () => window.removeEventListener('open-manual-entry', handleOpenManual);
  }, []);

  const handleStartScan = () => {
    navigate('/scan');
  };

  const handleSeeDoctors = () => {
    navigate('/doctors');
  };

  const handleManualEntry = () => {
    setIsManualModalOpen(true);
  };

  const features = [
    {
      icon: Scan,
      title: 'Instant Scan',
      description: 'Capture any prescription with your camera',
      onClick: handleStartScan,
    },
    {
      icon: Shield,
      title: 'AI Analysis',
      description: 'Detect dangerous drug interactions',
      onClick: handleStartScan,
    },
    {
      icon: Users,
      title: 'Doctor Verified',
      description: 'See what real doctors think',
      onClick: handleSeeDoctors,
    },
    {
      icon: Plus,
      title: 'Manual Entry',
      description: 'Add drugs by name for quick safety check',
      onClick: () => setIsManualModalOpen(true),
    },
  ];

  const stats = [
    { value: '1.3M', label: t('stats.lives_at_risk'), desc: t('stats.lives_desc') },
    { value: '99.2%', label: t('stats.accuracy'), desc: t('stats.accuracy_desc') },
    { value: '500+', label: t('stats.doctors'), desc: t('stats.doctors_desc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onManualEntry={handleManualEntry} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-safe/20 rounded-full blur-[130px] animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,white_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]" />
        </div>

        <div className="container relative px-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-sm"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">{t('hero.badge')}</span>
            </motion.div>

            <motion.h1 
              className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {t('hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-safe">{t('hero.title2')}</span>
            </motion.h1>

            <motion.p 
              className="text-base text-muted-foreground mb-10 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('hero.desc_new')}
            </motion.p>

            {/* Main Action Group */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="scan"
                size="xl"
                className="w-full sm:flex-1 h-14 text-base rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95"
                onClick={handleStartScan}
              >
                <Scan size={22} className="mr-3" />
                {t('hero.scan_btn')}
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto h-14 px-8 text-base rounded-2xl border-2 hover:bg-primary/5 transition-all active:scale-95"
                onClick={handleManualEntry}
              >
                <Plus size={22} className="mr-2" />
                {t('hero.manual_btn')}
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { icon: ShieldCheck, label: t('hero.hipaa') },
                { icon: Zap, label: t('hero.instant') },
                { icon: Activity, label: t('hero.monitoring') }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground/80">
                  <item.icon size={18} className="text-primary" />
                  {item.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section className="py-12 relative">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary/30 transition-all hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    {index === 0 && <Heart className="text-primary" size={20} />}
                    {index === 1 && <ShieldCheck className="text-safe" size={20} />}
                    {index === 2 && <Users className="text-accent" size={20} />}
                  </div>
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{stat.label}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Highlight Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-black mb-3">{t('dashboard.title')}</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {t('dashboard.desc')}
              </p>
            </div>
            <Button variant="outline" className="rounded-full px-5 h-10 text-sm" onClick={() => navigate('/history')}>
              {t('dashboard.view_analytics')} <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SafeScore Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-1"
            >
              <Card className="h-full rounded-[2rem] border-none shadow-2xl shadow-primary/5 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                      <ShieldCheck size={18} />
                    </div>
                    {t('dashboard.safescore')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10" />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * safeScore) / 100}
                        className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-primary group-hover:scale-110 transition-transform">{safeScore}</span>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Excellent</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center space-y-1.5">
                    <p className="text-xs font-semibold">Your safety is our priority</p>
                    <p className="text-[10px] text-muted-foreground px-6 leading-relaxed">
                      Updated 2 hours ago based on your latest prescription analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Family SafeCircle Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1"
            >
              <Card className="h-full rounded-[2rem] border-none shadow-2xl shadow-accent/5 bg-gradient-to-br from-white to-accent/5 dark:from-slate-900 dark:to-accent/10 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
                      <Users size={18} />
                    </div>
                    SafeCircle™
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="bg-white/50 dark:bg-white/5 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold mb-3">Family Members Online</p>
                    <div className="flex -space-x-3 mb-4">
                      {['Sarah', 'John', 'Emma', 'David'].map((name, i) => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-tr from-accent/20 to-accent/40 flex items-center justify-center text-xs font-bold text-accent shadow-sm">
                          {name[0]}
                        </div>
                      ))}
                      <button className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent transition-colors">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[11px] font-semibold">Mom's BP Monitor</span>
                        </div>
                        <span className="text-[9px] font-bold text-green-500 uppercase">Normal</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[11px] font-semibold">Dad's Insulin Adherence</span>
                        </div>
                        <span className="text-[9px] font-bold text-blue-500 uppercase">98%</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-11 rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 text-sm" onClick={() => navigate('/family')}>
                    <Share2 size={14} className="mr-2" />
                    Connect Your Circle
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smart Inventory Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1"
            >
              <Card className="h-full rounded-[2rem] border-none shadow-2xl shadow-safe/5 bg-gradient-to-br from-white to-safe/5 dark:from-slate-900 dark:to-safe/10 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-safe text-white shadow-lg shadow-safe/20">
                      <Pill size={18} />
                    </div>
                    MedInventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                  <div className="bg-white/50 dark:bg-white/5 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold mb-3">Refill Alerts</p>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-black text-red-600 dark:text-red-400">CRITICAL LOW</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full">2 Days Left</span>
                        </div>
                        <p className="text-xs font-bold">Metformin 500mg</p>
                        <Button variant="ghost" className="w-full mt-2 h-7 text-[10px] font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20">Refill Now</Button>
                      </div>
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold">Lisinopril</p>
                          <span className="text-[10px] font-bold text-muted-foreground">15 Tabs</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-safe h-full w-[60%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <Zap size={20} className="text-primary animate-bounce" />
                    <p className="text-xs font-semibold leading-relaxed">
                      AI Insight: Taking meds with food improved your SafeScore by 12% last month.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Feature Dashboard - Split View */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">Adherence Tracking</h2>
                <Button variant="ghost" className="text-primary font-bold">Today's Schedule <ChevronRight size={18} /></Button>
              </div>
              <MedicineReminders />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black">Medical Help</h2>
              </div>
              <DoctorAppointments />
              
              {/* Quick Contact Card */}
              <Card className="rounded-[2rem] border-none bg-slate-900 text-white p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Phone size={120} />
                </div>
                <h3 className="text-xl font-bold mb-4 relative z-10">Need Urgent Help?</h3>
                <p className="text-slate-400 text-sm mb-6 relative z-10">Connect with an emergency physician in under 60 seconds.</p>
                <Button className="w-full h-14 bg-red-600 hover:bg-red-700 rounded-2xl text-lg font-black shadow-xl shadow-red-600/30 relative z-10" onClick={() => navigate('/sos')}>
                  <Phone size={20} className="mr-2" />
                  EMERGENCY SOS
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Modern Steps */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Simple. Fast. Secure.</h2>
            <p className="text-muted-foreground text-lg">Your health journey with Zovida in three easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { 
                icon: Scan, 
                title: 'Scan', 
                desc: 'Upload or snap a photo of any prescription using our AI Vision.',
                color: 'primary'
              }, 
              { 
                icon: Zap, 
                title: 'Analyze', 
                desc: 'Our AI instantly detects interactions, side effects, and dosage errors.',
                color: 'safe'
              }, 
              { 
                icon: ShieldCheck, 
                title: 'Stay Safe', 
                desc: 'Get a comprehensive safety report and doctor-verified insights.',
                color: 'accent'
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group text-center"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/4 left-full w-full h-px border-t-2 border-dashed border-slate-200 dark:border-slate-800 -translate-x-1/2 -z-10" />
                )}
                <div className={cn(
                  "w-20 h-20 rounded-[2rem] mx-auto mb-6 flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6",
                  step.color === 'primary' ? "bg-primary text-white shadow-primary/20" :
                  step.color === 'safe' ? "bg-safe text-white shadow-safe/20" :
                  "bg-accent text-white shadow-accent/20"
                )}>
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed px-4">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                About <span className="text-primary">Zovida</span>
              </h2>
              <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  <Stethoscope size={16} />
                  Clinician Review & Early Validation
                </div>
                <h3 className="text-2xl font-black leading-tight">
                  Shaped by practicing doctors at leading institutions.
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Zovida was shaped with early clinical feedback from practicing doctors at leading Indian medical institutions including <strong>AIIMS New Delhi</strong>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This feedback informed our focus on high-risk interaction flagging, conservative explanations, and clinician support workflows.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-safe text-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Medication Safety Passport</h4>
                      <p className="text-sm text-muted-foreground">Carry your safety record across doctors and hospitals globally.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center shrink-0">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Universal Accessibility</h4>
                      <p className="text-sm text-muted-foreground">Explaining interaction risks in simple language for everyone.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                <AlertTriangle size={160} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                  <Info size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                    Medical Disclaimer
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Zovida does not provide medical advice or treatment recommendations. Its design emphasizes clinician support, responsible AI use, & patient safety.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="container relative px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
              <Sparkles className="text-primary animate-pulse" size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to Secure Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-safe">Family's Health?</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
              Join thousands of users who trust Zovida for their daily medication safety. No hidden fees, no complex setups.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30"
                onClick={() => navigate('/scan')}
              >
                Start Free Scan
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Create Account
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3 group">
              <div className="p-1.5 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                <ZovidaLogo size="sm" showText={false} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-foreground">
                Zovida<span className="text-primary">.</span>
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Security</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              © 2026 Zovida Healthcare AI
            </p>
          </div>
        </div>
      </footer>

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
      <BottomNav />
      
      {/* Floating Manual Entry for Mobile */}
      <motion.div 
        className="fixed bottom-24 right-4 z-50 md:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button 
          onClick={handleManualEntry}
          className="w-12 h-12 rounded-full shadow-lg bg-primary text-white p-0 flex items-center justify-center border-2 border-white"
        >
          <Plus size={24} />
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;
