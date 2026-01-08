import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  ArrowLeft,
  Activity,
  Download,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { endpoints } from '@/lib/api';
import { AnalysisResult } from '@/types';
import { format } from 'date-fns';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf 
} from '@react-pdf/renderer';

// PDF Styles (Reusing from MedicationSafetyPassport)
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottom: 1, borderBottomColor: '#eeeeee', paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 4, textTransform: 'uppercase' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  riskBanner: { padding: 15, borderRadius: 8, marginBottom: 20 },
  riskLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: '#64748b' },
  riskValue: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  medicineItem: { padding: 10, backgroundColor: '#f8fafc', borderRadius: 6, marginBottom: 8, borderLeft: 4, borderLeftColor: '#3b82f6' },
  medicineName: { fontSize: 12, fontWeight: 'bold' },
  components: { fontSize: 10, color: '#64748b', marginTop: 4 },
  summary: { padding: 15, backgroundColor: '#eff6ff', borderRadius: 8, fontSize: 12, lineHeight: 1.5, color: '#1e40af' },
  footer: { marginTop: 'auto', borderTop: 1, borderTopColor: '#eeeeee', paddingTop: 10 },
  disclaimer: { fontSize: 8, color: '#94a3b8', lineHeight: 1.4 },
  timestamp: { fontSize: 8, color: '#94a3b8', textAlign: 'right', marginTop: 10 }
});

const PassportPDF = ({ result }: { result: AnalysisResult }) => {
  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'danger': return 'High Risk / Immediate Review';
      case 'caution': return 'Moderate Risk / Needs Review';
      default: return 'Low Risk / Routine Monitoring';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'danger': return '#fef2f2';
      case 'caution': return '#fffbeb';
      default: return '#f0fdf4';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'danger': return '#dc2626';
      case 'caution': return '#d97706';
      default: return '#16a34a';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Medication Safety Passport™</Text>
          <Text style={styles.subtitle}>Global Medication Summary • Zovida AI Health Guardian</Text>
        </View>

        <View style={[styles.riskBanner, { backgroundColor: getRiskColor(result.overallRisk) }]}>
          <Text style={styles.riskLabel}>Current Interaction Risk Level</Text>
          <Text style={[styles.riskValue, { color: getRiskTextColor(result.overallRisk) }]}>
            {getRiskLabel(result.overallRisk)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication Components (Generic)</Text>
          {result.medicines.map((med, i) => (
            <View key={i} style={styles.medicineItem}>
              <Text style={styles.medicineName}>{med.name}</Text>
              <Text style={styles.components}>
                Components: {med.components?.join(', ') || 'None identified'}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Summary</Text>
          <View style={styles.summary}>
            <Text>{result.simpleExplanation || result.aiExplanation}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            DISCLAIMER: This Medication Safety Passport is for decision support only. It is not a medical record, medical advice, or a substitute for professional clinical judgment. Always consult with a qualified healthcare provider before making any medication changes.
          </Text>
          <Text style={styles.timestamp}>
            Generated on: {format(new Date(result.timestamp), 'MMM dd, yyyy HH:mm')} • ID: {result.id}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const PassportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPassport = async () => {
      if (!id) return;
      try {
        const response = await fetch(endpoints.passport.get(id));
        if (!response.ok) throw new Error('Passport not found');
        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load passport');
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!result) return;
    try {
      const blob = await pdf(<PassportPDF result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Zovida-Safety-Passport-${result.id.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'danger': return 'High Risk / Immediate Review';
      case 'caution': return 'Moderate Risk / Needs Review';
      default: return 'Low Risk / Routine Monitoring';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'danger': return 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      case 'caution': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      default: return 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Verifying Passport...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
        <Card className="max-w-md w-full border-destructive/20 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto shadow-lg shadow-destructive/20">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-black tracking-tight">Passport Not Found</h1>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                This medication safety passport may have expired or the link is invalid. Please contact the patient for a new scan.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')}
              className="w-full h-11 rounded-xl font-bold"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-12">
      {/* Top Banner */}
      <div className="bg-primary text-white py-2.5 px-6 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <Globe size={10} />
          Verified Medication Safety Passport™
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-5">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-slate-800">
            <CardContent className="p-0">
              <div className="p-5 border-b border-border flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight">Safety Passport™</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clinician Verification View</p>
                  </div>
                </div>
                <Button 
                  onClick={handleDownloadPDF}
                  variant="outline" 
                  size="icon" 
                  className="rounded-full h-12 w-12 border-2"
                >
                  <Download size={20} />
                </Button>
              </div>

              <div className="p-5 space-y-6">
                {/* ID & Timestamp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Generated: {format(new Date(result.timestamp), 'MMM dd, yyyy • HH:mm')}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2.5 py-0.5 rounded-full border border-border">
                    ID: {result.id.slice(0, 8).toUpperCase()}
                  </div>
                </div>

                {/* Risk Banner */}
                <div className={`p-4 rounded-2xl border-2 flex items-start gap-4 ${getRiskColor(result.overallRisk)}`}>
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5 opacity-70">Interaction Risk Level</p>
                    <p className="text-lg font-black leading-tight">{getRiskLabel(result.overallRisk)}</p>
                  </div>
                </div>

                {/* Generic Medicine List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black flex items-center gap-2 px-1">
                    <ShieldCheck size={16} className="text-primary" />
                    Generic Components Listing
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {result.medicines.map((med, idx) => (
                      <div key={idx} className="p-4 bg-secondary/30 rounded-xl border border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border-2 border-border text-xs font-black text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-black">{med.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {med.components?.map((comp, ci) => (
                                <span key={ci} className="text-[9px] font-black px-1.5 py-0.5 bg-primary/10 text-primary rounded-md uppercase border border-primary/20">
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safety Summary */}
                <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-5 opacity-10">
                    <Globe size={64} className="text-primary" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                      <FileText size={12} />
                      Interaction Summary
                    </h3>
                    <p className="text-sm font-bold leading-relaxed text-foreground/80 italic">
                      "{result.simpleExplanation || result.aiExplanation}"
                    </p>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                    <span className="font-bold text-foreground">Clinician Disclaimer:</span> This Medication Safety Passport is for decision support only. It is not a medical record, medical advice, or a substitute for professional clinical judgment. Always cross-reference this data with your clinical systems.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Branding Footer */}
        <div className="text-center space-y-2 py-8">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Activity size={20} className="animate-pulse" />
            <span className="text-xl font-black tracking-tighter">Zovida AI</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Health Guardian • 2025</p>
        </div>
      </div>
    </div>
  );
};

export default PassportPage;
