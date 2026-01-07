import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ZovidaLogo from '@/components/ZovidaLogo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MedicineReminders from '@/components/MedicineReminders';
import DoctorAppointments from '@/components/DoctorAppointments';
import { 
  ShieldCheck, 
  Users, 
  Plus,
  ChevronRight,
  Pill,
  Zap,
  Phone,
  Share2
} from 'lucide-react';

interface UserDashboardProps {
  safeScore: number;
  onManualEntry: () => void;
}

const UserDashboard = ({ safeScore, onManualEntry }: UserDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="space-y-0">
      {/* Dashboard Highlight Grid */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-10 gap-4 md:gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl md:text-3xl font-black mb-2 md:mb-3">{t('dashboard.title')}</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {t('dashboard.desc')}
              </p>
            </div>
            <Button variant="outline" className="rounded-full px-4 md:px-5 h-9 md:h-10 text-xs md:text-sm w-full md:w-auto" onClick={() => navigate('/history')}>
              {t('dashboard.view_analytics')} <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* SafeScore Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-1"
            >
              <Card className="h-full rounded-2xl md:rounded-[2rem] border-none shadow-xl md:shadow-2xl shadow-primary/5 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 overflow-hidden group">
                <CardHeader className="pb-2 p-5 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                      <ShieldCheck size={16} className="md:size-[18px]" />
                    </div>
                    {t('dashboard.safescore')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4 md:py-6 p-5 md:p-6">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="7" fill="transparent" className="text-primary/10 md:hidden" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-primary/10 hidden md:block" />
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="currentColor"
                        strokeWidth="7"
                        fill="transparent"
                        strokeDasharray={314.15}
                        strokeDashoffset={314.15 - (314.15 * safeScore) / 100}
                        className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] md:hidden"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * safeScore) / 100}
                        className="text-primary transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] hidden md:block"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl md:text-3xl font-black text-primary group-hover:scale-110 transition-transform">{safeScore}</span>
                      <span className="text-[8px] md:text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Excellent</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-6 text-center space-y-1 md:space-y-1.5">
                    <p className="text-[11px] md:text-xs font-semibold">Your safety is our priority</p>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground px-4 md:px-6 leading-relaxed">
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
              <Card className="h-full rounded-2xl md:rounded-[2rem] border-none shadow-xl md:shadow-2xl shadow-accent/5 bg-gradient-to-br from-white to-accent/5 dark:from-slate-900 dark:to-accent/10 overflow-hidden">
                <CardHeader className="pb-2 p-5 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
                      <Users size={16} className="md:size-[18px]" />
                    </div>
                    SafeCircle™
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 p-5 md:p-6">
                  <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl md:rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] md:text-xs font-bold mb-3">Family Members Online</p>
                    <div className="flex -space-x-2 md:-space-x-3 mb-4">
                      {['Sarah', 'John', 'Emma', 'David'].map((name, i) => (
                        <div key={i} className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-tr from-accent/20 to-accent/40 flex items-center justify-center text-[10px] md:text-xs font-bold text-accent shadow-sm">
                          {name[0]}
                        </div>
                      ))}
                      <button className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent transition-colors">
                        <Plus size={14} className="md:size-[16px]" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 md:p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] md:text-[11px] font-semibold">Mom's BP Monitor</span>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-bold text-green-500 uppercase">Normal</span>
                      </div>
                      <div className="flex items-center justify-between p-2 md:p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="text-[10px] md:text-[11px] font-semibold">Dad's Insulin Adherence</span>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-bold text-blue-500 uppercase">98%</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full h-10 md:h-11 rounded-xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 text-xs md:text-sm" onClick={() => navigate('/family')}>
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
              <Card className="h-full rounded-2xl md:rounded-[2rem] border-none shadow-xl md:shadow-2xl shadow-safe/5 bg-gradient-to-br from-white to-safe/5 dark:from-slate-900 dark:to-safe/10 overflow-hidden">
                <CardHeader className="pb-2 p-5 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-safe text-white shadow-lg shadow-safe/20">
                      <Pill size={16} className="md:size-[18px]" />
                    </div>
                    MedInventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-2 p-5 md:p-6">
                  <div className="bg-white/50 dark:bg-white/5 p-4 rounded-2xl md:rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] md:text-xs font-bold mb-3">Refill Alerts</p>
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[8px] md:text-[9px] font-black text-red-600 dark:text-red-400">CRITICAL LOW</span>
                          <span className="text-[8px] md:text-[9px] font-bold px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full">2 Days Left</span>
                        </div>
                        <p className="text-xs font-bold">Metformin 500mg</p>
                        <Button variant="ghost" className="w-full mt-2 h-7 text-[9px] md:text-[10px] font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20">Refill Now</Button>
                      </div>
                      <div className="p-3 md:p-4 bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs md:text-sm font-bold">Lisinopril</p>
                          <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground">15 Tabs</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 md:h-1.5 rounded-full overflow-hidden">
                          <div className="bg-safe h-full w-[60%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start md:items-center gap-3 p-3 md:p-4 bg-primary/5 rounded-xl md:rounded-2xl border border-primary/10">
                    <Zap size={18} className="text-primary animate-bounce mt-0.5 md:mt-0" />
                    <p className="text-[10px] md:text-xs font-semibold leading-relaxed">
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
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-8 space-y-6 md:space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-black tracking-tight">Adherence Tracking</h2>
                <Button variant="ghost" className="text-primary font-bold text-xs md:text-base p-0 h-auto hover:bg-transparent">Today's Schedule <ChevronRight size={16} className="md:size-[18px]" /></Button>
              </div>
              <MedicineReminders />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 space-y-6 md:space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-3xl font-black tracking-tight">Medical Help</h2>
              </div>
              <DoctorAppointments />
              
              {/* Quick Contact Card */}
              <Card className="rounded-2xl md:rounded-[2rem] border-none bg-slate-900 text-white p-6 md:p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Phone size={100} className="md:size-[120px]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 relative z-10">Need Urgent Help?</h3>
                <p className="text-slate-400 text-xs md:text-sm mb-5 md:mb-6 relative z-10">Connect with an emergency physician in under 60 seconds.</p>
                <Button className="w-full h-12 md:h-14 bg-red-600 hover:bg-red-700 rounded-xl md:rounded-2xl text-base md:text-lg font-black shadow-xl shadow-red-600/30 relative z-10" onClick={() => navigate('/sos')}>
                  <Phone size={18} className="md:size-[20px] mr-2" />
                  EMERGENCY SOS
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 md:py-16 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-16">
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
    </div>
  );
};

export default UserDashboard;
