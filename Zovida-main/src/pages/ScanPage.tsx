import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CameraCapture from '@/components/CameraCapture';
import AnalysisLoader from '@/components/AnalysisLoader';
import { useScanStore } from '@/store/scanStore';
import { RiskLevel } from '@/types';
import { ArrowLeft, Check, Shield, AlertCircle, Info, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import ZovidaLogo from '@/components/ZovidaLogo';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const ScanPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showCamera, setShowCamera] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const { 
    isAnalyzing, 
    capturedImage, 
    result, 
    error,
    captureImage, 
    analyzeImage,
    reset 
  } = useScanStore();

  useEffect(() => {
    if (error) {
      toast.error(error);
      reset();
      setShowCamera(true);
    }
  }, [error, reset]);

  // Demo: Cycle through risk levels for demo purposes
  const demoRiskLevels: RiskLevel[] = ['danger', 'caution', 'safe'];
  const [demoIndex, setDemoIndex] = useState(0);

  const handleConsent = () => {
    setHasConsented(true);
    setShowCamera(true);
  };

  const handleCapture = async (imageData: string) => {
    captureImage(imageData);
    setShowCamera(false);
    
    // Analyze with demo risk level (rotates through each)
    await analyzeImage(demoRiskLevels[demoIndex]);
    setDemoIndex((prev) => (prev + 1) % demoRiskLevels.length);
  };

  useEffect(() => {
    if (result) {
      navigate('/results');
    }
  }, [result, navigate]);

  const handleClose = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <AnimatePresence mode="wait">
        {!hasConsented && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-950/40 backdrop-blur-xl"
          >
             <motion.div
               initial={{ y: "100%", opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: "100%", opacity: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="w-full max-w-md mt-auto md:mt-0"
             >
               <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)] bg-white/95 dark:bg-slate-900/95 rounded-t-[2.5rem] md:rounded-3xl overflow-hidden">
                 <CardHeader className="text-center pb-1 pt-8 px-6">
                   <div className="mx-auto bg-gradient-to-br from-primary to-primary/60 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-primary/30 rotate-3">
                     <Shield className="w-8 h-8 text-white" />
                   </div>
                   <CardTitle className="text-2xl font-black tracking-tight mb-1">{t('scan.consent.title')}</CardTitle>
                   <CardDescription className="text-sm font-medium px-2 text-slate-500 dark:text-slate-400">
                     {t('scan.consent.desc')}
                   </CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3 px-8 py-6">
                   {[
                     { icon: Lock, color: "text-blue-500", bg: "bg-blue-500/10", text: t('scan.consent.point1') },
                     { icon: Info, color: "text-amber-500", bg: "bg-amber-500/10", text: t('scan.consent.point2') },
                     { icon: Check, color: "text-green-500", bg: "bg-green-500/10", text: t('scan.consent.point3') }
                   ].map((item, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.1 + i * 0.1 }}
                       className="flex gap-4 items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.01]"
                     >
                       <div className={`shrink-0 ${item.bg} rounded-xl p-2`}>
                         <item.icon className={`w-4 h-4 ${item.color}`} />
                       </div>
                       <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{item.text}</p>
                     </motion.div>
                   ))}
                 </CardContent>
                 <CardFooter className="flex flex-col gap-3 p-8 pt-1 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] md:pb-8">
                   <Button 
                     className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl text-lg font-black shadow-2xl shadow-primary/25 transition-all active:scale-95 group" 
                     size="lg" 
                     onClick={handleConsent}
                   >
                     <span>{t('scan.agree')}</span>
                     <ArrowLeft className="w-5 h-5 ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                   </Button>
                   <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                 </CardFooter>
               </Card>
             </motion.div>
          </motion.div>
        )}

        {hasConsented && showCamera && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black"
          >
            <CameraCapture
              onCapture={handleCapture}
              onClose={handleClose}
            />
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col bg-white dark:bg-slate-950"
          >
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-900 pt-[env(safe-area-inset-top,0px)]">
              <div className="container flex items-center justify-between h-14 px-4 max-w-4xl mx-auto">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose}
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 h-12 w-12"
                >
                  <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1 rounded-lg">
                    <ZovidaLogo size="sm" showText={false} />
                  </div>
                  <h1 className="font-black tracking-tighter text-lg bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                    Analyzing<span className="text-primary animate-pulse">...</span>
                  </h1>
                </div>
                <div className="w-9" />
              </div>
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
              <AnalysisLoader />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="mt-6 w-full"
              >
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-100 dark:bg-amber-500/10 p-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-black text-sm">Pro Tip</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                    Our AI is cross-referencing your prescription with thousands of known drug interactions and safety guidelines.
                  </p>
                  
                  <div className="mt-6 flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 1,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanPage;
