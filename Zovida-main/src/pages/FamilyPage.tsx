import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Bell, 
  MapPin, 
  Trash2, 
  Heart, 
  ArrowLeft,
  CheckCircle2,
  Phone,
  Plus,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import ManualEntryModal from '@/components/ManualEntryModal';
import { useTranslation } from 'react-i18next';
import { endpoints } from '@/lib/api';
import { cn } from '@/lib/utils';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifications: boolean;
  locationAccess: boolean;
}

const FamilyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    phone: ''
  });

  useEffect(() => {
    const fetchFamily = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      if (userId) {
        try {
          const response = await fetch(endpoints.family.get(userId));
          if (response.ok) {
            const data = await response.json();
            setMembers(data);
            return;
          }
        } catch (error) {
          console.error('Error fetching family:', error);
        }
      }
      
      const saved = localStorage.getItem('zovida_family');
      if (saved) {
        setMembers(JSON.parse(saved));
      } else {
        // Default mock data
        const mock = [
          { id: '1', name: 'Mom', relation: 'Mother', phone: '+1234567890', notifications: true, locationAccess: true },
          { id: '2', name: 'Dad', relation: 'Father', phone: '+1987654321', notifications: true, locationAccess: false }
        ];
        setMembers(mock);
        localStorage.setItem('zovida_family', JSON.stringify(mock));
      }
    };

    fetchFamily();
  }, []);

  const handleAdd = async () => {
    if (!newMember.name || !newMember.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    const userId = localStorage.getItem('zovida_user_id');
    if (userId) {
      try {
        const response = await fetch(endpoints.family.add, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newMember, user_id: parseInt(userId) }),
        });
        if (response.ok) {
          const data = await response.json();
          const member: FamilyMember = {
            id: data.id,
            ...newMember,
            notifications: true,
            locationAccess: false
          };
          setMembers([...members, member]);
          setIsAdding(false);
          setNewMember({ name: '', relation: '', phone: '' });
          toast.success("Family member added to your SafeCircle!");
          return;
        }
      } catch (error) {
        console.error('Error adding family member:', error);
      }
    }

    // Fallback to local storage
    const member: FamilyMember = {
      id: Date.now().toString(),
      ...newMember,
      notifications: true,
      locationAccess: false
    };
    const updated = [...members, member];
    setMembers(updated);
    localStorage.setItem('zovida_family', JSON.stringify(updated));
    setIsAdding(false);
    setNewMember({ name: '', relation: '', phone: '' });
    toast.success("Family member added to your SafeCircle!");
  };

  const removeMember = async (id: string) => {
    const userId = localStorage.getItem('zovida_user_id');
    if (userId && !isNaN(parseInt(id))) {
      try {
        await fetch(endpoints.family.delete(id), { method: 'DELETE' });
      } catch (error) {
        console.error('Error deleting family member:', error);
      }
    }

    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    localStorage.setItem('zovida_family', JSON.stringify(updated));
    toast.info("Member removed from circle");
  };

  const toggleSetting = async (id: string, setting: 'notifications' | 'locationAccess') => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const newValue = !member[setting];
    const userId = localStorage.getItem('zovida_user_id');
    
    if (userId && !isNaN(parseInt(id))) {
      try {
        const backendKey = setting === 'notifications' ? 'notifications' : 'location_access';
        await fetch(endpoints.family.update(id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [backendKey]: newValue }),
        });
      } catch (error) {
        console.error('Error updating family member:', error);
      }
    }

    const updated = members.map(m => 
      m.id === id ? { ...m, [setting]: newValue } : m
    );
    setMembers(updated);
    localStorage.setItem('zovida_family', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] md:pb-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 p-4 sticky top-0 z-50">
        <div className="container max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="h-12 w-12 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={22} />
            </Button>
            <h1 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
              <Users className="text-accent animate-pulse" />
              SafeCircle<span className="text-accent">™</span>
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "h-12 w-12 rounded-xl transition-all",
              isAdding ? "bg-accent/10 text-accent rotate-45" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Plus size={22} />
          </Button>
        </div>
      </header>

      <main className="container p-4 max-w-2xl mx-auto space-y-8 mt-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 to-primary/50 rounded-[2.1rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-gradient-to-br from-accent/20 to-accent/5 p-6 rounded-[2rem] border border-accent/20 flex items-center gap-5 shadow-xl shadow-accent/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={100} />
            </div>
            <div className="w-16 h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-accent shadow-inner shrink-0 group-hover:rotate-12 transition-transform">
              <ShieldCheck size={32} />
            </div>
            <div className="relative z-10">
              <h2 className="font-black text-accent uppercase tracking-tighter text-sm flex items-center gap-2">
                <Zap size={14} className="fill-accent" />
                Family Safety First
              </h2>
              <p className="text-sm text-accent/80 leading-snug mt-1 font-medium">
                Your SafeCircle™ members will be notified if you trigger an SOS or miss critical medications.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Circle Members
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {members.length} active protectors
            </p>
          </div>
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => setIsAdding(true)} 
            className="rounded-full border-accent/20 text-accent hover:bg-accent hover:text-white font-bold h-11 px-6 transition-all shadow-lg shadow-accent/5 active:scale-95"
          >
            <UserPlus size={16} className="mr-2" />
            Add Member
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="overflow-hidden mb-6"
            >
              <Card className="border-accent/30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-accent/10 border-2 overflow-hidden">
                <CardHeader className="pb-4 bg-accent/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                      <UserPlus size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-slate-900 dark:text-white">New Contact</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest text-accent/60">Secure circle addition</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <div className="relative group">
                      <Input 
                        placeholder="Full Name" 
                        className="h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-accent pl-10 transition-all group-focus-within:border-accent/50"
                        value={newMember.name} 
                        onChange={e => setNewMember({...newMember, name: e.target.value})}
                      />
                      <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    </div>
                    <div className="relative group">
                      <Input 
                        placeholder="Relation (e.g. Brother, Mother)" 
                        className="h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-accent pl-10 transition-all group-focus-within:border-accent/50"
                        value={newMember.relation} 
                        onChange={e => setNewMember({...newMember, relation: e.target.value})}
                      />
                      <Heart size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    </div>
                    <div className="relative group">
                      <Input 
                        placeholder="Emergency Phone Number" 
                        className="h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-accent pl-10 transition-all group-focus-within:border-accent/50"
                        value={newMember.phone} 
                        onChange={e => setNewMember({...newMember, phone: e.target.value})}
                      />
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1 bg-accent hover:bg-accent/90 rounded-xl h-12 font-black shadow-lg shadow-accent/20 transition-all active:scale-95 text-xs uppercase tracking-widest" onClick={handleAdd}>
                      Add to Circle
                    </Button>
                    <Button variant="ghost" className="rounded-xl h-12 px-6 font-black text-xs uppercase tracking-widest" onClick={() => setIsAdding(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-5">
          {members.length > 0 ? (
            members.map((member, index) => (
              <motion.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/20 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all group overflow-hidden border-2 hover:border-accent/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-[1.5rem] flex items-center justify-center font-black text-slate-400 text-2xl shadow-inner group-hover:scale-110 transition-transform relative z-10 border-2 border-white/50 dark:border-slate-800/50">
                            {member.name[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight leading-none flex items-center gap-2">
                            {member.name}
                            {member.notifications && <div className="w-2 h-2 bg-safe rounded-full animate-pulse" />}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/10">
                              {member.relation}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                              <Phone size={10} />
                              {member.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-11 h-11 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all active:scale-90" 
                          onClick={() => removeMember(member.id)}
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button 
                          variant={member.notifications ? "default" : "outline"} 
                          className={cn(
                            "w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all gap-2 border-2",
                            member.notifications 
                              ? "bg-primary shadow-lg shadow-primary/20 border-primary" 
                              : "border-slate-100 dark:border-slate-800 hover:border-primary/30"
                          )}
                          onClick={() => toggleSetting(member.id, 'notifications')}
                        >
                          <Bell size={16} className={cn(member.notifications && "animate-bounce")} />
                          SOS: {member.notifications ? 'ON' : 'OFF'}
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button 
                          variant={member.locationAccess ? "default" : "outline"} 
                          className={cn(
                            "w-full h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all gap-2 border-2",
                            member.locationAccess 
                              ? "bg-accent shadow-lg shadow-accent/20 border-accent" 
                              : "border-slate-100 dark:border-slate-800 hover:border-accent/30"
                          )}
                          onClick={() => toggleSetting(member.id, 'locationAccess')}
                        >
                          <MapPin size={16} className={cn(member.locationAccess && "animate-pulse")} />
                          Track: {member.locationAccess ? 'ON' : 'OFF'}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-accent/10 space-y-6"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                <UserPlus size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl text-slate-900 dark:text-white">Your Circle is Empty</h3>
                <p className="text-sm text-muted-foreground max-w-[220px] mx-auto font-medium">
                  Add trusted family members to ensure your safety during emergencies.
                </p>
              </div>
              <Button onClick={() => setIsAdding(true)} className="bg-accent hover:bg-accent/90 rounded-xl h-12 px-8 font-bold shadow-lg shadow-accent/20">
                Create Your Circle
              </Button>
            </motion.div>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-6"
        >
          <Card className="bg-gradient-to-br from-safe/10 to-transparent border-dashed border-2 border-safe/20 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-safe shadow-xl shadow-safe/10">
                <Heart size={40} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-lg text-slate-900 dark:text-white">Privacy Protected</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Your medical data is encrypted and only shared with verified circle members during emergencies.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-safe uppercase bg-safe/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={12} />
                  HIPAA Standard
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-safe uppercase bg-safe/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={12} />
                  E2E Encrypted
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

      {/* Floating Action for Mobile */}
      {!isAdding && (
        <motion.div 
          className="fixed bottom-28 right-6 z-50 md:hidden"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsAdding(true)}
            className="w-14 h-14 rounded-2xl shadow-2xl bg-accent text-white p-0 flex items-center justify-center border-4 border-white dark:border-slate-950"
          >
            <UserPlus size={24} />
          </Button>
        </motion.div>
      )}
    </div>
  );

};

export default FamilyPage;