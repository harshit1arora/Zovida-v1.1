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
      const prompt = `Analyze these medications for components, interactions, and safety: ${drugs.join(', ')}. 
      Return ONLY a JSON object following this interface:
      {
        "id": "manual-${Date.now()}",
        "timestamp": "${new Date().toISOString()}",
        "medicines": [
          { "id": "1", "name": "Drug Name", "dosage": "Standard Dosage", "frequency": "Standard Frequency", "components": ["Component 1", "Component 2"] }
        ],
        "overallRisk": "safe" | "caution" | "danger",
        "interactions": [
          { "drug1": "Drug A", "drug2": "Drug B", "severity": "danger", "description": "Interaction detail", "recommendation": "What to do" }
        ],
        "aiExplanation": "Brief overall summary (medical terminology)",
        "simpleExplanation": "ELI12 version - extremely simple language, no jargon",
        "doctorRating": { "totalReviews": 100, "averageScore": 4.5, "safeRatings": 80, "cautionRatings": 15, "dangerRatings": 5 },
        "recommendations": ["Recommendation 1", "Recommendation 2"],
        "ocrConfidence": "High",
        "ocrConfidenceReason": "Manually entered by user, high clarity",
        "safetyTimeline": {
          "urgency": "Immediate" | "Soon" | "Routine",
          "message": "When should the user act on this analysis?"
        },
        "sideEffects": ["Common side effect 1", "Common side effect 2"],
        "emergencySigns": ["Sign 1 - seek immediate help if this happens"],
        "crossPrescription": {
          "detected": true,
          "sourceCount": 2,
          "message": "Found medications likely from different doctors or prescriptions."
        },
        "isCaregiverMode": ${isCaregiverMode},
        "clinicalStance": {
          "interpretation": "Review" | "Monitor" | "Caution",
          "stance": "How clinicians usually interpret this type of interaction",
          "insiderProcess": "Brief detail about clinical process/guidelines used for this stance"
        },
        "lifestyleWarnings": [
          { 
            "type": "alcohol" | "food" | "supplement" | "lifestyle", 
            "warning": "Specific substance/activity", 
            "impact": "What happens if combined",
            "action": "avoid" | "eat" | "monitor"
          }
        ]
      }
      
      For 'lifestyleWarnings', make sure to include an 'action' field for each item:
      - 'avoid' for things to completely avoid (like alcohol or grapefruit with certain drugs)
      - 'eat' for beneficial things (like taking with food or specific vitamins)
      - 'monitor' for things that need careful observation.
      
      If multiple drugs are provided, analyze if they seem to come from different therapeutic contexts (e.g., a heart medicine and a separate dental prescription) and flag it in crossPrescription.
      Make sure to identify if a drug like 'Dolo 650' contains Paracetamol/Acetaminophen and list it in components.
      If common brand names are used, expand them to their active ingredients.
      For 'safetyTimeline', use 'Immediate' for severe interactions, 'Soon' for caution, and 'Routine' for safe.`;

      const response = await chatWithGroq(prompt);
      
      // Extract JSON from response if it contains markdown
      const jsonStr = response.includes('```json') 
        ? response.split('```json')[1].split('```')[0].trim()
        : response.includes('{') 
          ? response.substring(response.indexOf('{'), response.lastIndexOf('}') + 1)
          : response;

      const result: AnalysisResult = JSON.parse(jsonStr);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border"
        >
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plus className="text-primary" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Add Medications</h2>
                <p className="text-xs text-muted-foreground">Manual safety check</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X size={18} />
            </Button>
          </div>

          <div className="p-4 space-y-4">
            {/* Caregiver Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg shadow-sm">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold">Caregiver Mode</p>
                  <p className="text-[9px] text-muted-foreground">Checking for someone else?</p>
                </div>
              </div>
              <Switch 
                checked={isCaregiverMode}
                onCheckedChange={setIsCaregiverMode}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Search size={12} />
                Search or Type Medication Name
              </label>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDrug()}
                  placeholder="e.g., Dolo 650, Aspirin..."
                  className="rounded-lg h-10 text-sm"
                />
                <Button onClick={handleAddDrug} className="rounded-lg h-10 px-4 text-sm">
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold flex items-center gap-2">
                  <Pill size={14} className="text-primary" />
                  Your List ({drugs.length})
                </h3>
                {drugs.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setDrugs([])}
                    className="text-[10px] h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[160px] pr-4">
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {drugs.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 border-2 border-dashed border-border rounded-2xl"
                      >
                        <p className="text-xs text-muted-foreground">No medications added yet.</p>
                      </motion.div>
                    ) : (
                      drugs.map((drug, index) => (
                        <motion.div
                          key={drug}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-md bg-background flex items-center justify-center border border-border">
                              <span className="text-[10px] font-bold text-primary">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium">{drug}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDrug(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive h-8 w-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </div>

            <div className="bg-primary/5 rounded-xl p-3 flex gap-3 border border-primary/10">
              <Zap className="text-primary shrink-0" size={16} />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Zovida AI will automatically break down brand names (like Dolo 650) into their active ingredients and check for dangerous combinations.
              </p>
            </div>
          </div>

          <div className="p-4 pt-0">
            <Button
              className="w-full h-11 rounded-xl text-base font-bold shadow-lg shadow-primary/20"
              disabled={drugs.length === 0 || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Analyzing Safety...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2" size={18} />
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
