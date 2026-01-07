import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Zap,
  Loader2,
  Pill,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useScanStore } from '@/store/scanStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { chatWithGroq } from '@/services/groqService';
import { AnalysisResult } from '@/types';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { endpoints } from '@/lib/api';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManualEntryModal = ({ isOpen, onClose }: ManualEntryModalProps) => {
  const [drugs, setDrugs] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCaregiverMode, setIsCaregiverMode] = useState(false);
  const { setResult } = useScanStore();
  const navigate = useNavigate();

  const handleAddDrug = () => {
    if (inputValue.trim() && !drugs.includes(inputValue.trim())) {
      setDrugs([...drugs, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveDrug = (index: number) => {
    setDrugs(drugs.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (drugs.length === 0) {
      toast.error("Please add at least one medication");
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. Notify backend to save history and get basic ML analysis
      try {
        const userId = localStorage.getItem('zovida_user_id') || '1';
        await fetch(endpoints.prescriptions.manual, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: parseInt(userId), drugs }),
        });
      } catch (backendError) {
        console.warn("Backend notification failed, proceeding with AI analysis", backendError);
      }

      // 2. Get detailed AI analysis for the UI
      const apiResponse = await fetch(endpoints.ml.analyze, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          drugs, 
          is_caregiver_mode: isCaregiverMode 
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to analyze medications via backend');
      }

      const result: AnalysisResult = await apiResponse.json();
      setResult(result);
      toast.success("Analysis complete!");
      onClose();
      navigate('/results');
    } catch (error) {
      console.error("Manual analysis error:", error);
      toast.error("Failed to analyze medications. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          className="bg-background w-full max-w-md rounded-t-[2.5rem] md:rounded-3xl shadow-2xl overflow-hidden border border-border mt-auto md:mt-0 max-h-[90vh] flex flex-col"
        >
          <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Add Medications</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">Manual safety check</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-10 w-10">
              <X size={20} />
            </Button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto pb-8 md:pb-5">
            {/* Caregiver Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-background rounded-xl shadow-sm">
                  <Users size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Caregiver Mode</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Checking for someone else?</p>
                </div>
              </div>
              <Switch 
                checked={isCaregiverMode}
                onCheckedChange={setIsCaregiverMode}
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                <Search size={12} />
                Search Medication Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDrug()}
                  placeholder="e.g., Dolo 650, Aspirin..."
                  className="rounded-xl h-12 text-sm md:text-base px-4 bg-secondary/20 border-none focus-visible:ring-primary/20"
                />
                <Button onClick={handleAddDrug} className="rounded-xl h-12 px-6 text-sm font-bold shadow-lg shadow-primary/10">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                  <Pill size={14} className="text-primary" />
                  Your List ({drugs.length})
                </h3>
                {drugs.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDrugs([])}
                    className="text-[10px] font-black h-7 text-destructive hover:text-destructive hover:bg-destructive/10 uppercase tracking-tighter"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[180px] md:h-[160px] pr-2">
                <div className="space-y-2.5 pb-2">
                  <AnimatePresence mode="popLayout">
                    {drugs.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50"
                      >
                        <Pill size={32} className="mx-auto text-slate-300 mb-2 opacity-50" />
                        <p className="text-xs font-bold text-slate-400">No medications added yet.</p>
                      </motion.div>
                    ) : (
                      drugs.map((drug, index) => (
                        <motion.div
                          key={drug}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10">
                              <span className="text-[11px] font-black text-primary">{index + 1}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground">{drug}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDrug(index)}
                            className="text-destructive h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 flex gap-3 border border-primary/10">
              <Zap className="text-primary shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] md:text-xs text-muted-foreground font-medium leading-relaxed">
                Zovida AI will automatically break down brand names (like Dolo 650) into their active ingredients and check for dangerous combinations.
              </p>
            </div>
          </div>

          <div className="p-5 pt-0 shrink-0 pb-8 md:pb-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]">
            <Button
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={drugs.length === 0 || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Analyzing Safety...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2" size={20} />
                  Analyze Interactions
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManualEntryModal;
