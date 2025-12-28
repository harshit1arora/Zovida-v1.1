import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  QrCode, 
  ShieldCheck, 
  Globe, 
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';
import { AnalysisResult } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { endpoints } from '@/lib/api';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf, 
  Image 
} from '@react-pdf/renderer';

interface MedicationSafetyPassportProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
}

// PDF Styles
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

const MedicationSafetyPassport = ({ isOpen, onClose, result }: MedicationSafetyPassportProps) => {
  const [copied, setCopied] = React.useState(false);
  const passportUrl = `${window.location.origin}/passport/${result.id}`;

  React.useEffect(() => {
    if (isOpen && result) {
      const savePassportToBackend = async () => {
        try {
          await fetch(endpoints.passport.save, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: result.id,
              data: result
            })
          });
        } catch (error) {
          console.error('Failed to save passport to backend:', error);
        }
      };
      savePassportToBackend();
    }
  }, [isOpen, result]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    toast.success("Passport link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info("Generating PDF Passport...");
      const blob = await pdf(<PassportPDF result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Zovida-Safety-Passport-${result.id.slice(0, 8)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Passport PDF downloaded");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Safety Passport™</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Medication Summary</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X size={18} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Passport ID & Time */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={12} />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Generated: {format(new Date(result.timestamp), 'MMM dd, yyyy • HH:mm')}
                </span>
              </div>
              <div className="text-[9px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                ID: {result.id.slice(0, 8).toUpperCase()}
              </div>
            </div>

            {/* Risk Banner */}
            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${getRiskColor(result.overallRisk)}`}>
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Current Interaction Risk</p>
                <p className="text-base font-black leading-tight">{getRiskLabel(result.overallRisk)}</p>
              </div>
            </div>

            {/* Generic Medicine List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black flex items-center gap-2 px-1">
                <ShieldCheck size={14} className="text-primary" />
                Generic Components
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {result.medicines.map((med, idx) => (
                  <div key={idx} className="p-2.5 bg-secondary/30 rounded-xl border border-border/50 flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center border border-border text-[10px] font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black">{med.name}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {med.components?.map((comp, ci) => (
                            <span key={ci} className="text-[8px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-md uppercase">
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

            {/* Simple Explanation */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Globe size={48} className="text-primary" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Safety Summary (Patient-Friendly)</h3>
                <p className="text-xs font-bold leading-relaxed text-foreground/80">
                  {result.simpleExplanation || result.aiExplanation}
                </p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-2 space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/5 border border-border/50">
                <QRCodeSVG value={passportUrl} size={140} level="H" includeMargin={true} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scan for Digital Verification</p>
                <p className="text-[9px] font-medium text-muted-foreground/60 mt-1">Direct clinician access to interaction reports</p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleCopyLink}
                variant="outline" 
                className="h-10 rounded-xl gap-2 font-bold text-xs border-2"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Link Copied" : "Copy Link"}
              </Button>
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Medication Safety Passport',
                      text: 'My medication safety summary via Zovida AI',
                      url: passportUrl,
                    }).catch(console.error);
                  } else {
                    handleCopyLink();
                  }
                }}
                variant="outline" 
                className="h-10 rounded-xl gap-2 font-bold text-xs border-2"
              >
                <Share2 size={14} />
                Share Passport
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                className="col-span-2 h-10 rounded-xl gap-2 font-bold text-xs shadow-lg shadow-primary/20"
              >
                <Download size={14} />
                Download PDF Document
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-muted/50 rounded-xl border border-border/50">
              <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">Disclaimer:</span> This Medication Safety Passport is for decision support only. It is not a medical record, medical advice, or a substitute for professional clinical judgment. Always consult with a qualified healthcare provider before making any medication changes.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MedicationSafetyPassport;
