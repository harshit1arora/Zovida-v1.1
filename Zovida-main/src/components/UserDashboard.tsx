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
  Share2,
  Stethoscope,
  Globe,
  AlertTriangle,
  Info,
  Sparkles,
  Scan,
  Activity
} from 'lucide-react';

interface UserDashboardProps {
  history: any[];
  safeScore: number;
  onManualEntry: () => void;
}

const UserDashboard = ({ history, safeScore, onManualEntry }: UserDashboardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onStartScan = () => navigate('/scan');

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: 'var(--grid-pattern)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 -z-20">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-safe/10 rounded-full blur-[90px] md:blur-[130px] animate-pulse delay-700" />
        </div>

        <div className="container relative px-4">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6 md:mb-8 backdrop-blur-sm"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{t('hero.badge')}</span>
            </motion.div>

            <motion.h1 
              className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 md:mb-6 leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {t('hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-safe">{t('hero.title2')}</span>
            </motion.h1>

            <motion.p 
              className="text-sm md:text-base text-muted-foreground mb-8 md:mb-10 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('hero.desc_new')}
            </motion.p>

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
                onClick={onStartScan}
              >
                <Scan size={22} className="mr-3" />
                {t('hero.scan_btn')}
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="w-full sm:flex-1 h-14 text-base rounded-2xl border-2 hover:bg-primary/5 hover:!text-primary transition-all active:scale-95 bg-white dark:bg-slate-950"
                onClick={onManualEntry}
              >
                <Plus size={22} className="mr-2" />
                {t('hero.manual_btn')}
              </Button>
            </motion.div>

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

      {/* Dashboard Highlight Grid */}
      <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: 'var(--grid-pattern)', backgroundSize: '40px 40px', opacity: 0.3 }} />
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
                  Zovida was shaped with early clinical feedback from practicing doctors at leading tertiary care medical institutions in India, including <strong>AIIMS New Delhi</strong>.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This feedback informed our focus on high-risk interaction flagging, conservative explanations, and clinician support workflows.
                </p>
                <p className="text-muted-foreground leading-relaxed italic">
                  This feedback directly shaped Zovida's red flag only approach, clinician escalation flows, and refusal to provide medical advice.
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
