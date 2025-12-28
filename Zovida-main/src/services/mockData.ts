import { AnalysisResult, Doctor, RiskLevel } from '@/types';

// Simulated Azure AI response for prescription analysis
export const mockAnalysisResults: Record<RiskLevel, AnalysisResult> = {
  danger: {
    id: 'analysis-001',
    timestamp: new Date(),
    medicines: [
      { id: '1', name: 'Warfarin', dosage: '5mg', frequency: 'Once daily' },
      { id: '2', name: 'Aspirin', dosage: '325mg', frequency: 'Twice daily' },
      { id: '3', name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed' },
    ],
    overallRisk: 'danger',
    interactions: [
      {
        drug1: 'Warfarin',
        drug2: 'Aspirin',
        severity: 'danger',
        description: 'Taking Warfarin with Aspirin significantly increases your risk of bleeding. Both medicines thin your blood, and together they can cause dangerous internal bleeding.',
        recommendation: 'Contact your doctor immediately. Do not take these together without medical supervision.',
      },
      {
        drug1: 'Warfarin',
        drug2: 'Ibuprofen',
        severity: 'danger',
        description: 'Ibuprofen can increase the blood-thinning effect of Warfarin and may cause stomach bleeding.',
        recommendation: 'Avoid ibuprofen. Ask your doctor about safer pain relief options like acetaminophen.',
      },
    ],
    aiExplanation: 'This combination of blood thinners and pain relievers is potentially dangerous. Warfarin already thins your blood to prevent clots. Adding Aspirin doubles this effect, and Ibuprofen can damage your stomach lining while your blood is thin. This is like having two fire hoses when one is already too strong – the combined effect can cause internal bleeding that\'s hard to stop.',
    simpleExplanation: 'You are taking too many blood thinners. This makes you bleed very easily, even inside your body where you can\'t see it. It is like having a leaky pipe that won\'t stop dripping. You must talk to a doctor right away before taking more.',
    doctorRating: {
      totalReviews: 234,
      averageScore: 1.8,
      safeRatings: 12,
      cautionRatings: 45,
      dangerRatings: 177,
    },
    recommendations: [
      'Stop taking Aspirin and Ibuprofen until you speak with your doctor',
      'Call your prescribing physician today',
      'Watch for signs of bleeding: unusual bruising, blood in urine or stool',
      'Consider a medication review appointment',
    ],
    ocrConfidence: 'Medium',
    ocrConfidenceReason: 'Unclear handwriting on the prescription label for Warfarin.',
    safetyTimeline: {
      urgency: 'Immediate',
      message: 'May require prompt medical review. Contact your doctor or visit urgent care today.'
    },
    sideEffects: ['Increased bruising', 'Nosebleeds', 'Gum bleeding'],
    emergencySigns: ['Blood in stool or urine', 'Severe headache', 'Dizziness or fainting'],
    clinicalStance: {
      interpretation: 'Caution',
      stance: 'Clinicians usually view this interaction with high concern. The risk of bleeding is significantly elevated, often requiring immediate adjustment of therapy or switch to alternative non-NSAID analgesics.',
      insiderProcess: 'In our medical review process, we cross-reference these medications against the Beers Criteria and STOPP/START guidelines. Doctors typically run a PT/INR test immediately to assess clotting time when such interactions are suspected.'
    }
  },
  caution: {
    id: 'analysis-002',
    timestamp: new Date(),
    medicines: [
      { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { id: '2', name: 'Potassium Supplement', dosage: '20mEq', frequency: 'Once daily' },
    ],
    overallRisk: 'caution',
    interactions: [
      {
        drug1: 'Lisinopril',
        drug2: 'Potassium Supplement',
        severity: 'caution',
        description: 'Lisinopril can increase potassium levels in your blood. Taking extra potassium supplements may raise levels too high.',
        recommendation: 'Have your potassium levels monitored regularly. Watch for muscle weakness or irregular heartbeat.',
      },
    ],
    aiExplanation: 'Your blood pressure medicine (Lisinopril) naturally keeps more potassium in your body. Adding a potassium supplement on top might push your levels too high. Think of it like filling a glass that\'s already half full – you need to be careful not to overflow. High potassium can affect your heart rhythm, so regular blood tests are important.',
    simpleExplanation: 'One medicine keeps salt in your body, and the other adds more salt. Too much of this salt (potassium) can be bad for your heart. It\'s like adding too much sugar to your tea. You should have a blood test soon to make sure everything is okay.',
    doctorRating: {
      totalReviews: 156,
      averageScore: 3.2,
      safeRatings: 48,
      cautionRatings: 89,
      dangerRatings: 19,
    },
    recommendations: [
      'Get a blood test to check your potassium levels',
      'Discuss with your doctor if you really need the supplement',
      'Avoid high-potassium foods like bananas and oranges in excess',
      'Report any muscle cramps or heart palpitations immediately',
    ],
    ocrConfidence: 'High',
    ocrConfidenceReason: 'Clear printed labels detected.',
    safetyTimeline: {
      urgency: 'Soon',
      message: 'Schedule a follow-up appointment within the next week to monitor potassium levels.'
    },
    sideEffects: ['Dizziness', 'Dry cough', 'Fatigue'],
    emergencySigns: ['Irregular heartbeat', 'Severe muscle weakness', 'Chest pain'],
    clinicalStance: {
      interpretation: 'Monitor',
      stance: 'Clinicians typically manage this by monitoring serum potassium levels. It is not always necessary to stop the supplement, but dosage adjustments are common.',
      insiderProcess: 'Clinicians use the "Watch and Wait" approach here. We check Basic Metabolic Panels (BMP) every 2-4 weeks until levels stabilize, ensuring the kidneys are handling the potassium load effectively.'
    }
  },
  safe: {
    id: 'analysis-003',
    timestamp: new Date(),
    medicines: [
      { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { id: '2', name: 'Vitamin D3', dosage: '2000IU', frequency: 'Once daily' },
      { id: '3', name: 'Omega-3 Fish Oil', dosage: '1000mg', frequency: 'Once daily' },
    ],
    overallRisk: 'safe',
    interactions: [],
    aiExplanation: 'Great news! These medicines work well together with no known harmful interactions. Metformin helps control your blood sugar, Vitamin D supports your bones and immune system, and Omega-3 is good for your heart. They\'re like a well-coordinated team – each doing their job without getting in each other\'s way.',
    simpleExplanation: 'Your medicines are safe to take together. They are like friends who help each other out. One helps your sugar, one helps your bones, and one helps your heart. Keep taking them as your doctor told you.',
    doctorRating: {
      totalReviews: 312,
      averageScore: 4.8,
      safeRatings: 289,
      cautionRatings: 20,
      dangerRatings: 3,
    },
    recommendations: [
      'Continue taking as prescribed',
      'Take Metformin with food to reduce stomach upset',
      'Vitamin D is best absorbed with a fatty meal',
      'Keep up with regular check-ups',
    ],
    ocrConfidence: 'High',
    ocrConfidenceReason: 'Digital prescription record used.',
    safetyTimeline: {
      urgency: 'Routine',
      message: 'No immediate action needed. Discuss at your next scheduled consultation.'
    },
    sideEffects: ['Nausea (with Metformin)', 'Metallic taste'],
    emergencySigns: ['Severe allergic reaction', 'Persistent vomiting'],
    clinicalStance: {
      interpretation: 'Review',
      stance: 'This is considered a low-risk combination. Clinicians focus on adherence rather than interaction risks.',
      insiderProcess: 'Our internal protocol for safe combinations involves verifying that none of the supplements (like Vitamin D) interfere with the absorption of the primary medication (Metformin) through shared metabolic pathways like CYP450.'
    }
  },
};

export const mockDoctors: Doctor[] = [
  {
    id: 'doc-001',
    name: 'Dr. Sarah Chen',
    specialty: 'Clinical Pharmacologist',
    rating: 4.9,
    reviewCount: 428,
    available: true,
    consultationFee: 50,
    hospital: 'St. Mary Medical Center',
  },
  {
    id: 'doc-002',
    name: 'Dr. Michael Okonkwo',
    specialty: 'Internal Medicine',
    rating: 4.7,
    reviewCount: 312,
    available: true,
    consultationFee: 45,
    hospital: 'City General Hospital',
  },
  {
    id: 'doc-003',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Geriatric Medicine',
    rating: 4.8,
    reviewCount: 256,
    available: false,
    consultationFee: 55,
    hospital: 'Presbyterian Health',
  },
  {
    id: 'doc-004',
    name: 'Dr. James Liu',
    specialty: 'Family Medicine',
    rating: 4.6,
    reviewCount: 189,
    available: true,
    consultationFee: 40,
    hospital: 'Community Health Clinic',
  },
];

// Simulate API call delay
export const simulateAnalysis = (riskLevel: RiskLevel = 'safe'): Promise<AnalysisResult> => {
  return new Promise((resolve) => {
    // Simulate Azure AI processing time
    setTimeout(() => {
      resolve(mockAnalysisResults[riskLevel]);
    }, 3000);
  });
};

export const fetchDoctors = (): Promise<Doctor[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockDoctors);
    }, 500);
  });
};
