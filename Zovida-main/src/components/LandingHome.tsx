import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ZovidaLogo from '@/components/ZovidaLogo';
import { 
  Scan, 
  ShieldCheck, 
  Users, 
  Plus,
  Sparkles, 
  Heart,
  Zap,
  Activity,
  Stethoscope,
  Globe,
  Info,
  AlertTriangle
} from 'lucide-react';

interface LandingHomeProps {
  onStartScan: () => void;
  onManualEntry: () => void;
}

const LandingHome = ({ onStartScan, onManualEntry }: LandingHomeProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stats = [
    { value: '1.3M', label: t('stats.lives_at_risk'), desc: t('stats.lives_desc') },
    { value: '99.2%', label: t('stats.accuracy'), desc: t('stats.accuracy_desc') },
    { value: '500+', label: t('stats.doctors'), desc: t('stats.doctors_desc') },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-28 md:pb-32">
        <div className="absolute inset-0 -z-10" style={{ backgroundImage: 'var(--grid-pattern)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 -z-20">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-safe/20 rounded-full blur-[90px] md:blur-[130px] animate-pulse delay-700" />
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
                className="w-full sm:flex-1 h-14 text-base rounded-2xl border-2 hover:bg-primary/5 hover:!text-primary transition-all active:scale-95"
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

      {/* Modern Stats Section */}
      <section className="py-8 md:py-12 relative">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="group p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg md:shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary/30 transition-all hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="p-2 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    {index === 0 && <Heart className="text-primary" size={18} />}
                    {index === 1 && <ShieldCheck className="text-safe" size={18} />}
                    {index === 2 && <Users className="text-accent" size={18} />}
                  </div>
                  <span className="text-2xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors">
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200">{stat.label}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="container px-4">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-black mb-3 md:mb-4 tracking-tight">Simple. Fast. Secure.</h2>
            <p className="text-muted-foreground text-base md:text-lg">Your health journey with Zovida in three easy steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
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
                  "w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] mx-auto mb-4 md:mb-6 flex items-center justify-center shadow-xl transition-all group-hover:scale-110 group-hover:rotate-6",
                  step.color === 'primary' ? "bg-primary text-white shadow-primary/20" :
                  step.color === 'safe' ? "bg-safe text-white shadow-safe/20" :
                  "bg-accent text-white shadow-accent/20"
                )}>
                  <step.icon size={24} className="md:size-[32px]" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{step.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed px-2 md:px-4">{step.desc}</p>
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
    </>
  );
};

export default LandingHome;
