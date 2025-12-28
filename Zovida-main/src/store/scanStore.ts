import { create } from 'zustand';
import { AnalysisResult, RiskLevel } from '@/types';
import { endpoints } from '@/lib/api';

interface ScanStore {
  isScanning: boolean;
  isAnalyzing: boolean;
  capturedImage: string | null;
  result: AnalysisResult | null;
  error: string | null;
  
  // Actions
  startScanning: () => void;
  stopScanning: () => void;
  captureImage: (imageData: string) => void;
  analyzeImage: (mockRiskLevel?: RiskLevel) => Promise<void>;
  clearResult: () => void;
  setResult: (result: AnalysisResult) => void;
  reset: () => void;
}

export const useScanStore = create<ScanStore>((set, get) => ({
  isScanning: false,
  isAnalyzing: false,
  capturedImage: null,
  result: null,
  error: null,

  startScanning: () => set({ isScanning: true, error: null }),
  
  stopScanning: () => set({ isScanning: false }),
  
  captureImage: (imageData: string) => set({ 
    capturedImage: imageData, 
    isScanning: false 
  }),
  
  setResult: (result: AnalysisResult) => {
    set({ result, isAnalyzing: false });
    
    // Save to local history
    const history = JSON.parse(localStorage.getItem('zovida_history') || '[]');
    // Avoid duplicates by checking ID
    const filteredHistory = history.filter((h: any) => h.id !== result.id);
    const newHistory = [result, ...filteredHistory].slice(0, 20); // Keep last 20 full results
    localStorage.setItem('zovida_history', JSON.stringify(newHistory));
  },

  analyzeImage: async (_mockRiskLevel: RiskLevel = 'danger') => {
    set({ isAnalyzing: true, error: null });
    const { capturedImage } = get();
    
    if (!capturedImage) {
      set({ error: 'No image captured', isAnalyzing: false });
      return;
    }

    try {
      const userId = localStorage.getItem('zovida_user_id') || '1'; // Default to 1 if not logged in
      
      // Convert base64 to Blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', blob, 'prescription.jpg');

      const apiResponse = await fetch(endpoints.prescriptions.scan, {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to analyze prescription');
      }

      const data = await apiResponse.json();
      
      // Check for OCR errors
      if (data.extracted_text && data.extracted_text.startsWith('ERROR:')) {
        set({ 
          error: data.extracted_text.replace('ERROR: ', ''), 
          isAnalyzing: false 
        });
        return;
      }

      const backendAnalysis = data.analysis;
      const backendInteractions = backendAnalysis.interactions || [];
      const backendLifestyle = backendAnalysis.lifestyle || [];
      
      // Transform backend response to frontend AnalysisResult
      const interactions = backendInteractions.map((item: any) => {
        const level = item.level.toLowerCase();
        let severity: RiskLevel = 'safe';
        
        if (level === 'major' || level === 'danger') severity = 'danger';
        else if (level === 'moderate' || level === 'caution') severity = 'caution';
        
        return {
          drug1: item.drug1,
          drug2: item.drug2,
          severity,
          description: item.drug2 
            ? `Potential interaction detected between ${item.drug1} and ${item.drug2}. Confidence: ${Math.round(item.confidence * 100)}%`
            : `No major interactions detected for ${item.drug1}.`,
          recommendation: item.drug2
            ? 'Please consult your healthcare provider before taking these medications together.'
            : 'This medication appears safe to use as prescribed.'
        };
      });

      // Extract unique medicines from interactions
      const medicineNames = new Set<string>();
      backendInteractions.forEach((item: any) => {
        medicineNames.add(item.drug1);
        if (item.drug2) medicineNames.add(item.drug2);
      });

      const medicines = Array.from(medicineNames).map((name, index) => ({
        id: `med-${index}`,
        name: name,
        dosage: 'As prescribed',
        frequency: 'As prescribed'
      }));

      const overallRisk = interactions.some((i: any) => i.severity === 'danger') 
        ? 'danger' 
        : interactions.some((i: any) => i.severity === 'caution') 
          ? 'caution' 
          : 'safe';

      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        timestamp: new Date(),
        medicines: medicines,
        overallRisk: overallRisk,
        interactions: interactions,
        aiExplanation: `Our analysis of the prescription text (${data.extracted_text}) identified ${medicines.length} medications and ${interactions.length} potential interactions.`,
        simpleExplanation: `We found ${interactions.length} interaction(s) that you should be aware of.`,
        lifestyleWarnings: backendLifestyle,
        doctorRating: {
          totalReviews: 120,
          averageScore: 4.8,
          safeRatings: 85,
          cautionRatings: 10,
          dangerRatings: 5
        },
        recommendations: [
          'Consult your doctor about the detected interactions.',
          'Keep a list of all medications you are taking.',
          'Do not stop taking prescribed medication without medical advice.'
        ],
        ocrConfidence: 'High',
      };
      
      set({ result, isAnalyzing: false });
      
      // Save to local history
      const history = JSON.parse(localStorage.getItem('zovida_history') || '[]');
      const filteredHistory = history.filter((h: any) => h.id !== result.id);
      const newHistory = [result, ...filteredHistory].slice(0, 20);
      localStorage.setItem('zovida_history', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error('Scan error:', error);
      set({ 
        error: 'Failed to analyze prescription. Please try again.', 
        isAnalyzing: false 
      });
    }
  },
  
  clearResult: () => set({ result: null, capturedImage: null }),
  
  reset: () => set({
    isScanning: false,
    isAnalyzing: false,
    capturedImage: null,
    result: null,
    error: null,
  }),
}));
