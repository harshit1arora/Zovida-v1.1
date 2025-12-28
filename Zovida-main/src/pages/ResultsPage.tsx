import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ZovidaLogo from '@/components/ZovidaLogo';
import RiskIndicator from '@/components/RiskIndicator';
import MedicineCard from '@/components/MedicineCard';
import InteractionCard from '@/components/InteractionCard';
import DoctorRatingCard from '@/components/DoctorRatingCard';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useScanStore } from '@/store/scanStore';
import { useReminderStore } from '@/store/reminderStore';
import { 
  ArrowLeft, 
  RotateCcw, 
  Lightbulb, 
  Pill,
  AlertTriangle,
  Share2,
  Volume2,
  VolumeX,
  FileText,
  MessageCircle,
  Download,
  Calendar,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Bell,
  Activity,
  Zap,
  Info,
  Users,
  Scan,
  Clock,
  ShieldAlert,
  HelpCircle,
  Flame,
  Globe,
  Stethoscope,
  UtensilsCrossed,
  Beer,
  ChevronDown, 
  ChevronUp, 
  History, 
  AlertCircle,
  XCircle,
  Briefcase,
  HeartHandshake,
  Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ManualEntryModal from '@/components/ManualEntryModal';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MedicationSafetyPassport from '@/components/MedicationSafetyPassport';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { result, capturedImage, reset, clearResult } = useScanStore();
  const { addReminder } = useReminderStore();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSimpleLanguage, setIsSimpleLanguage] = useState(false);
  const [isTrustOpen, setIsTrustOpen] = useState(false);
  const [showClinicalStance, setShowClinicalStance] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

  useEffect(() => {
    if (!result) {
      navigate('/');
    }
    
    const handleOpenManual = () => setIsManualModalOpen(true);
    window.addEventListener('open-manual-entry', handleOpenManual);

    return () => {
      window.speechSynthesis.cancel();
      window.removeEventListener('open-manual-entry', handleOpenManual);
    };
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const handleAddAllToReminders = () => {
    result.medicines.forEach(med => {
      addReminder({
        medicineName: med.name,
        dosage: med.dosage,
        time: "08:00 AM", // Default time
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      });
    });
    toast.success("All medications added to your schedule!");
  };

  const handleAddSingleReminder = (med: any) => {
    addReminder({
      medicineName: med.name,
      dosage: med.dosage,
      time: "08:00 AM",
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    });
    toast.success(`${med.name} added to schedule`);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `
      Analysis Result. Risk Level: ${result.overallRisk}. 
      ${result.aiExplanation}
      ${result.interactions.length > 0 ? `Found ${result.interactions.length} interactions.` : ''}
    `;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleNewScan = () => {
    clearResult();
    navigate('/scan');
  };

  const handleGoHome = () => {
    reset();
    navigate('/');
  };

  const handleConsultDoctor = () => {
    navigate('/doctors');
  };

  const handleSeeAllDoctors = () => {
    navigate('/doctors');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(12, 61, 110);
    doc.text("Zovida Medical Assistant", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Analysis Report", 20, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 42);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Overall Risk Assessment:", 20, 55);
    
    const riskColor = result.overallRisk === 'danger' ? [220, 38, 38] : result.overallRisk === 'caution' ? [217, 119, 6] : [22, 163, 74];
    doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.text(result.overallRisk.toUpperCase(), 80, 55);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("AI Explanation:", 20, 65);
    const splitText = doc.splitTextToSize(result.aiExplanation, 170);
    doc.text(splitText, 20, 75);
    
    doc.save("zovida-medical-report.pdf");
    toast.success("Medical Report Downloaded");
  };

  const handleWhatsAppShare = () => {
    const text = `*Zovida Medical Analysis Report*%0A%0ADate: ${new Date().toLocaleDateString()}%0ARisk Level: ${result.overallRisk.toUpperCase()}%0A%0A*Analysis:*%0A${result.aiExplanation}%0A%0A_Powered by Zovida AI Assistant_`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-40 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] animate-pulse delay-1000" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-safe/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <Header 
        showBack 
        title={t('results.title')} 
        onManualEntry={() => setIsManualModalOpen(true)}
        rightContent={
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSpeak}
              className={cn(
                "rounded-2xl h-10 w-10 transition-all", 
                isSpeaking ? "text-primary animate-pulse bg-primary/10" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleExportPDF} 
                title={t('results.export.pdf')} 
                className="rounded-2xl h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FileText size={18} className="text-slate-600 dark:text-slate-400" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleWhatsAppShare} 
                title={t('results.share.whatsapp')} 
                className="rounded-2xl h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MessageCircle size={18} className="text-green-600" />
              </Button>
            </div>
          </div>
        }
      />

      <MedicationSafetyPassport 
        isOpen={isPassportOpen} 
        onClose={() => setIsPassportOpen(false)} 
        result={result} 
      />

      <main className="container max-w-4xl px-4 py-6 space-y-8">
        {/* Interaction Summary & Urgency Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <Card 
            className={cn(
              "overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl",
              result.overallRisk === 'safe' ? "bg-white/80 dark:bg-slate-900/80" :
              result.overallRisk === 'caution' ? "bg-white/80 dark:bg-slate-900/80" :
              "bg-white/80 dark:bg-slate-900/80"
            )}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className={cn(
                  "p-5 flex-1 flex flex-col sm:flex-row items-center gap-5",
                  result.overallRisk === 'safe' ? "bg-green-500/5" :
                  result.overallRisk === 'caution' ? "bg-amber-500/5" :
                  "bg-red-500/5"
                )}>
                  <div className="relative">
                    <div className={cn(
                      "absolute inset-0 rounded-full blur-xl opacity-30",
                      result.overallRisk === 'safe' ? "bg-green-500" :
                      result.overallRisk === 'caution' ? "bg-amber-500" :
                      "bg-red-500"
                    )} />
                    <RiskIndicator level={result.overallRisk} size="sm" showLabel={false} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-0.5 tracking-tight">
                      {result.overallRisk === 'safe' && 'All Clear!'}
                      {result.overallRisk === 'caution' && 'Use Caution'}
                      {result.overallRisk === 'danger' && 'Danger Detected'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">
                      {result.overallRisk === 'safe' && 'No harmful interactions found'}
                      {result.overallRisk === 'caution' && 'Potential interaction needs monitoring'}
                      {result.overallRisk === 'danger' && 'Dangerous interaction detected'}
                    </p>
                  </div>
                </div>
                
                {result.safetyTimeline && (
                  <div className={cn(
                    "p-5 md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800",
                    result.safetyTimeline.urgency === 'Immediate' ? "bg-red-500/10" : 
                    result.safetyTimeline.urgency === 'Soon' ? "bg-amber-500/10" : "bg-green-500/10"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        "p-1.5 rounded-lg bg-white/50 dark:bg-slate-900/50",
                        result.safetyTimeline.urgency === 'Immediate' ? "text-red-600" : 
                        result.safetyTimeline.urgency === 'Soon' ? "text-amber-600" : "text-green-600"
                      )}>
                        <Clock size={14} className="animate-pulse" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Safety Timeline</span>
                    </div>
                    <p className="text-xs font-black leading-tight mb-3 text-slate-900 dark:text-white">
                      {result.safetyTimeline.message}
                    </p>
                    <Badge variant="outline" className={cn(
                      "w-fit border-none px-2.5 py-1 font-black text-[8px] uppercase tracking-widest rounded-full",
                      result.safetyTimeline.urgency === 'Immediate' ? "bg-red-500 text-white" : 
                      result.safetyTimeline.urgency === 'Soon' ? "bg-amber-500 text-white" : "bg-green-500 text-white"
                    )}>
                      {result.safetyTimeline.urgency === 'Immediate' ? 'Urgent Action' : 
                       result.safetyTimeline.urgency === 'Soon' ? 'Action Required' : 'Routine Monitoring'}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={() => setIsPassportOpen(true)}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-none"
          >
            <Globe className="animate-pulse" size={18} />
            Create Medication Safety Passport™
            <div className="ml-auto bg-white/20 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest">Global</div>
          </Button>
        </motion.div>

        {/* Visual Proof Slider */}
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary rotate-3 shadow-lg shadow-primary/5">
                  <Scan size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Visual Verification</h3>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Raw capture vs. AI interpretation</p>
                </div>
              </div>
              <Badge className="bg-primary text-white border-none font-black text-[8px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                Interactive
              </Badge>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-900">
              <BeforeAfterSlider 
                beforeImage={capturedImage} 
                detectedMedicines={result?.medicines.map(m => m.name)}
                overallRisk={result?.overallRisk}
              />
            </div>
            
            <div className="flex justify-center">
              <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full flex items-center gap-2">
                <Info size={12} className="text-primary" />
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Slide to reveal AI detection layers
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Explanation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] bg-white/95 dark:bg-slate-900/95 rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 rotate-6 shadow-lg shadow-amber-500/5">
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      {isSimpleLanguage ? 'Simplified Summary' : 'AI Safety Analysis'}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Deep-learning clinical insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
                    {isSimpleLanguage ? 'Simple' : 'Expert'}
                  </span>
                  <Switch 
                    checked={isSimpleLanguage} 
                    onCheckedChange={setIsSimpleLanguage}
                    className="data-[state=checked]:bg-primary scale-[0.65]"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <div className="relative p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="absolute -left-1 top-4 bottom-4 w-1 bg-primary rounded-full" />
                <p className="text-sm font-bold leading-relaxed italic text-slate-800 dark:text-slate-200 pl-3">
                  "{isSimpleLanguage 
                    ? (result.simpleExplanation || result.aiExplanation) 
                    : result.aiExplanation
                  }"
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Common Side Effects */}
                {result.sideEffects && result.sideEffects.length > 0 && (
                  <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <div className="p-1.5 bg-orange-500/10 rounded-md"><Flame size={12} /></div>
                      Side Effects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.sideEffects.map((effect, i) => (
                        <Badge key={i} variant="secondary" className="bg-white dark:bg-slate-800 text-[9px] font-bold border border-orange-500/10 px-2 py-0.5 rounded-md shadow-sm">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emergency Signs */}
                {result.emergencySigns && result.emergencySigns.length > 0 && (
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.15em] flex items-center gap-2 text-red-600 dark:text-red-400">
                      <div className="p-1.5 bg-red-500/10 rounded-md"><ShieldAlert size={12} /></div>
                      Warning Signs
                    </h4>
                    <ul className="space-y-1.5">
                      {result.emergencySigns.map((sign, i) => (
                        <li key={i} className="text-[10px] flex items-center gap-2 font-bold text-red-700 dark:text-red-400/90">
                          <div className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lifestyle Interactions (What to Eat/Avoid) */}
        {result.lifestyleWarnings && result.lifestyleWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 px-1">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 -rotate-3 shadow-lg shadow-indigo-500/5">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">Lifestyle & Food Insights</h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Personalized dietary & supplement guidance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* What to Eat / Beneficial */}
              <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white/95 dark:bg-slate-900/95 rounded-2xl overflow-hidden border-t-4 border-green-500">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl text-green-600">
                      <UtensilsCrossed size={16} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black tracking-tight text-slate-900 dark:text-white">What to Eat</CardTitle>
                      <p className="text-[9px] font-bold text-slate-500">Beneficial food & habits</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {result.lifestyleWarnings.filter(w => w.action === 'eat' || w.action === 'monitor').map((warning, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-500/5 border border-green-100/50 dark:border-green-500/10">
                      <div className="shrink-0 mt-0.5">
                        <CheckCircle2 size={14} className="text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{warning.warning}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{warning.impact}</p>
                      </div>
                    </div>
                  ))}
                  {result.lifestyleWarnings.filter(w => w.action === 'eat' || w.action === 'monitor').length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-[10px] text-slate-400 font-bold italic">No specific dietary recommendations found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* What to Avoid */}
              <Card className="border-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white/95 dark:bg-slate-900/95 rounded-2xl overflow-hidden border-t-4 border-red-500">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl text-red-600">
                      <AlertCircle size={16} />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-black tracking-tight text-slate-900 dark:text-white">What to Avoid</CardTitle>
                      <p className="text-[9px] font-bold text-slate-500">Interactions to prevent</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {result.lifestyleWarnings.filter(w => w.action === 'avoid').map((warning, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-50/50 dark:bg-red-500/5 border border-red-100/50 dark:border-red-500/10">
                      <div className="shrink-0 mt-0.5">
                        <XCircle size={14} className="text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{warning.warning}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{warning.impact}</p>
                      </div>
                    </div>
                  ))}
                  {result.lifestyleWarnings.filter(w => w.action === 'avoid').length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-[10px] text-slate-400 font-bold italic">No specific avoidance warnings found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Bio-Timeline Visualizer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-gradient-to-br from-indigo-500/5 via-white/80 to-purple-500/5 dark:from-indigo-500/10 dark:via-slate-900/80 dark:to-purple-500/10 rounded-2xl overflow-hidden border border-white/20">
            <CardHeader className="p-5 pb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500 rotate-6 shadow-lg shadow-indigo-500/5">
                    <Activity size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-black tracking-tight text-slate-900 dark:text-white">Bio-Timeline™</CardTitle>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Metabolic activity window (24H)</p>
                  </div>
                </div>
                <Badge className="bg-indigo-500 text-white border-none font-black text-[8px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">
                  AI Model
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-1">
              <div className="space-y-5 mt-3">
                {result.medicines.map((med, idx) => (
                  <div key={med.id} className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{med.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                        <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Window</span>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      <motion.div
                        initial={{ width: 0, x: idx * 20 + "%" }}
                        animate={{ width: "60%", x: idx * 10 + "%" }}
                        transition={{ duration: 2.5, delay: 0.8 + idx * 0.2, type: "spring", damping: 20 }}
                        className={cn(
                          "h-full rounded-full absolute shadow-lg",
                          idx === 0 ? "bg-gradient-to-r from-primary/60 to-primary" : "bg-gradient-to-r from-indigo-400 to-indigo-600"
                        )}
                      />
                      {idx === 0 && (
                        <div className="absolute left-[35%] top-0 bottom-0 w-1 bg-red-500/30 flex items-center justify-center">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="relative"
                          >
                            <div className="absolute inset-0 blur-md bg-red-500 rounded-full" />
                            <Zap size={10} className="text-white relative z-10" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between pt-3 px-1 text-[9px] font-black text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800">
                  <span>08:00 AM</span>
                  <span>12:00 PM</span>
                  <span>04:00 PM</span>
                  <span>08:00 PM</span>
                  <span>12:00 AM</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-3">
                <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg text-indigo-500 shadow-sm"><Info size={14} /></div>
                <p className="text-[10px] font-bold leading-relaxed text-indigo-900/70 dark:text-indigo-300/70">
                  The <span className="text-red-500 font-black px-1 py-0.5 bg-red-50 dark:bg-red-950/40 rounded-md text-[9px]">Zap</span> icon marks high-risk overlaps.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Medicines Found */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 px-6">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary -rotate-3 shadow-lg shadow-primary/5">
              <Pill size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Medications Detected ({result.medicines.length})</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Verified from your prescription</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {result.medicines.map((medicine, index) => (
              <motion.div 
                key={medicine.id} 
                className="space-y-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.15 }}
              >
                <div className="relative group">
                   <MedicineCard medicine={medicine} index={index} />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] h-11 gap-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 font-black uppercase tracking-widest transition-all border border-transparent hover:border-primary/20"
                  onClick={() => handleAddSingleReminder(medicine)}
                >
                  <Plus size={16} />
                  Schedule reminder for {medicine.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactions */}
        {result.interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 px-6">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-600 rotate-3 shadow-lg shadow-red-500/5">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Critical Interactions ({result.interactions.length})</h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">AI-detected pharmacological conflicts</p>
              </div>
            </div>
            
            <div className="space-y-5">
              {result.interactions.map((interaction, index) => (
                <motion.div
                  key={`${interaction.drug1}-${interaction.drug2}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.15 }}
                >
                  <InteractionCard 
                    interaction={interaction} 
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Doctor Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-6"
        >
          <DoctorRatingCard 
            rating={result.doctorRating} 
            onConsultClick={handleConsultDoctor}
          />
          <Button 
            variant="outline" 
            className="w-full h-12 gap-3 border-slate-200 dark:border-slate-800 rounded-2xl text-muted-foreground hover:text-primary hover:border-primary/50 font-black uppercase tracking-widest text-[10px] transition-all"
            onClick={handleSeeAllDoctors}
          >
            <Users size={16} />
            Who typically reviews such risks?
          </Button>
        </motion.div>
      </main>

      {/* Modern Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-800 z-[110] md:pb-6">
        <div className="container max-w-4xl flex gap-3">
          <Button
            className="flex-1 h-12 bg-primary hover:bg-primary/90 rounded-xl text-sm font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            onClick={handleNewScan}
          >
            <RotateCcw size={18} />
            <span>New Scan</span>
          </Button>
          <Button
            variant="outline"
            className="w-12 h-12 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-center p-0"
            onClick={() => navigate('/')}
          >
            <Home size={18} />
          </Button>
        </div>
      </div>

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
      <BottomNav />
    </div>
  );
};

export default ResultsPage;
