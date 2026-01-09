export type RiskLevel = 'safe' | 'caution' | 'danger';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  components?: string[];
}

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: RiskLevel;
  description: string;
  recommendation: string;
}

export interface InteractionExplanation {
  drug1: string;
  drug2: string;
  explanation: string;
  risks: string;
  recommendation: string;
}

export interface DoctorRating {
  totalReviews: number;
  averageScore: number;
  safeRatings: number;
  cautionRatings: number;
  dangerRatings: number;
}

export interface AnalysisResult {
  id: string;
  timestamp: Date;
  medicines: Medicine[];
  overallRisk: RiskLevel;
  interactions: DrugInteraction[];
  extractedText?: string;
  interactionExplanations?: InteractionExplanation[];
  aiExplanation: string;
  simpleExplanation?: string;
  doctorRating: DoctorRating;
  recommendations: string[];
  ocrConfidence?: 'High' | 'Medium' | 'Low';
  ocrConfidenceReason?: string;
  safetyTimeline?: {
    urgency: 'Immediate' | 'Soon' | 'Routine';
    message: string;
  };
  sideEffects?: string[];
  emergencySigns?: string[];
  crossPrescription?: {
    detected: boolean;
    sourceCount: number;
    message: string;
  };
  isCaregiverMode?: boolean;
  clinicalStance?: {
    interpretation: 'Review' | 'Monitor' | 'Caution';
    stance: string;
    insiderProcess: string;
  };
  lifestyleWarnings?: {
    type: 'alcohol' | 'food' | 'sun' | 'exercise' | 'supplement';
    warning: string;
    impact: string;
    action?: 'avoid' | 'eat' | 'monitor';
  }[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  available: boolean;
  avatarUrl?: string;
  consultationFee: number;
  hospital?: string;
}

export interface ScanState {
  isScanning: boolean;
  isAnalyzing: boolean;
  capturedImage: string | null;
  result: AnalysisResult | null;
}
