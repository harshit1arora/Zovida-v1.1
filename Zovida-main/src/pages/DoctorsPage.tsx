import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DoctorListItem from '@/components/DoctorListItem';
import DoctorConsultation from '@/components/DoctorConsultation';
import { fetchDoctors } from '@/services/mockData';
import { Doctor } from '@/types';
import { Search, Plus, Shield, Lock as LockIcon } from 'lucide-react';
import ManualEntryModal from '@/components/ManualEntryModal';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isConsulting, setIsConsulting] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDoctors = async () => {
      const data = await fetchDoctors();
      setDoctors(data);
      setLoading(false);
    };
    loadDoctors();

    const handleOpenManual = () => setIsManualModalOpen(true);
    window.addEventListener('open-manual-entry', handleOpenManual);
    return () => window.removeEventListener('open-manual-entry', handleOpenManual);
  }, []);

  const handleConsult = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsConsulting(true);
  };

  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doctor.hospital && doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <AnimatePresence>
        {isConsulting && selectedDoctor && (
          <DoctorConsultation 
            doctor={selectedDoctor} 
            onClose={() => setIsConsulting(false)} 
          />
        )}
      </AnimatePresence>

      <Header showBack title="Find Doctors" onManualEntry={() => setIsManualModalOpen(true)} />

      <main className="container max-w-2xl px-4 py-8 space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 px-1">
            <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.15em] text-primary">
              AI-Verified Specialists
            </div>
          </div>
          <div className="px-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Consult a <span className="text-primary">Specialist</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-md leading-relaxed">
              Get professional verification for your prescriptions from our network of clinical pharmacologists and specialists.
            </p>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder="Search by specialty, name or hospital..." 
              className="pl-11 h-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-slate-200/50 dark:border-slate-800/50 focus-visible:ring-primary/30 shadow-sm rounded-2xl text-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Available Now Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
              Available Experts
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredDoctors.filter(d => d.available).length} Online
            </span>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white/40 dark:bg-slate-900/40 rounded-3xl border-slate-100/50 dark:border-slate-800/50 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-1/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredDoctors
                .filter((d) => d.available)
                .map((doctor, index) => (
                  <DoctorListItem
                    key={doctor.id}
                    doctor={doctor}
                    index={index}
                    onConsult={handleConsult}
                  />
                ))
            )}
          </div>
        </motion.div>

        {/* Unavailable Section */}
        {!loading && filteredDoctors.filter((d) => !d.available).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-4 pt-2"
          >
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
              Currently Unavailable
            </h2>
            
            <div className="grid gap-4 opacity-60 grayscale-[0.5]">
              {filteredDoctors
                .filter((d) => !d.available)
                .map((doctor, index) => (
                  <DoctorListItem
                    key={doctor.id}
                    doctor={doctor}
                    index={index}
                    onConsult={handleConsult}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Professional Assurance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Card className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] overflow-hidden border-none shadow-2xl shadow-slate-200/50 dark:shadow-none relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield size={120} />
            </div>
            <CardContent className="p-8 relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-slate-900/10 border border-white/20 dark:border-slate-900/20 text-[10px] font-bold uppercase tracking-widest">
                <LockIcon size={12} />
                Secure Consultation
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl tracking-tight">Clinical Verification</h3>
                <p className="text-sm text-slate-300 dark:text-slate-600 font-medium leading-relaxed max-w-xs">
                  Your safety reports are encrypted and only accessible by your chosen specialist during verification.
                </p>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="flex flex-col">
                  <span className="text-xl font-black">100%</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Private</span>
                </div>
                <div className="w-px h-8 bg-white/20 dark:bg-slate-900/20" />
                <div className="flex flex-col">
                  <span className="text-xl font-black">HIPAA</span>
                  <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tighter">Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <ManualEntryModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
      <BottomNav />

      {/* Floating Manual Entry for Mobile */}
      <motion.div 
        className="fixed bottom-28 right-6 z-50 md:hidden"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <Button 
          onClick={() => setIsManualModalOpen(true)}
          className="w-14 h-14 rounded-2xl shadow-2xl bg-primary text-white p-0 flex items-center justify-center border-4 border-white dark:border-slate-950 transition-all active:scale-90"
        >
          <Plus size={28} />
        </Button>
      </motion.div>
    </div>
  );

};

export default DoctorsPage;
