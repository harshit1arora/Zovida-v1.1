import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Trash2, 
  ChevronRight, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Info,
  Plus,
  ShieldCheck,
  Activity,
  Clock,
  Pill,
  Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/Header';
import ManualEntryModal from '@/components/ManualEntryModal';
import { useScanStore } from '@/store/scanStore';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnalysisResult } from '@/types';
import { endpoints } from '@/lib/api';
import { toast } from 'sonner';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { setResult } = useScanStore();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'danger' | 'safe'>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem('zovida_user_id') || '1';
        let combinedHistory: AnalysisResult[] = [];
        
        // 1. Get local history first
        const localSaved = JSON.parse(localStorage.getItem('zovida_history') || '[]');
        const validLocal = localSaved.filter((item: any) => item && (item.id || item.timestamp));
        
        try {
          // 2. Try to get backend history
          const response = await fetch(endpoints.history(userId));
          
          if (response.ok) {
            const data = await response.json();
            const transformedBackend: AnalysisResult[] = data.map((item: any) => ({
              id: `be-${item.id}`,
              timestamp: item.timestamp || new Date().toISOString(),
              overallRisk: (item.level?.toLowerCase() || 'safe') as any,
              medicines: [
                { name: item.drug1, dosage: '', instructions: '' },
                ...(item.drug2 ? [{ name: item.drug2, dosage: '', instructions: '' }] : [])
              ],
              interactions: item.drug2 ? [
                {
                  severity: (item.level?.toLowerCase() || 'safe') as any,
                  description: `Interaction between ${item.drug1} and ${item.drug2}`,
                  recommendation: 'Consult your doctor before taking these together.'
                }
              ] : [],
              summary: item.drug2 
                ? `Interaction analysis for ${item.drug1} and ${item.drug2}`
                : `Analysis for ${item.drug1}`
            }));

            // Merge and deduplicate
            // Use a Map to deduplicate based on a combination of drugs and timestamp
            const historyMap = new Map();
            
            // Add local ones first
            validLocal.forEach((item: any) => {
              const key = `${item.medicines?.map((m: any) => m.name).sort().join('|')}-${new Date(item.timestamp).getTime()}`;
              historyMap.set(key, item);
            });
            
            // Add backend ones (overwriting if same key)
            transformedBackend.forEach((item: any) => {
              const key = `${item.medicines?.map((m: any) => m.name).sort().join('|')}-${new Date(item.timestamp).getTime()}`;
              historyMap.set(key, item);
            });
            
            combinedHistory = Array.from(historyMap.values());
          } else {
            combinedHistory = validLocal;
          }
        } catch (error) {
          console.error('Backend fetch error:', error);
          combinedHistory = validLocal;
        }

        // Sort by timestamp descending
        setHistory(combinedHistory.sort((a: any, b: any) => {
          const dateA = new Date(a.timestamp || a.date).getTime();
          const dateB = new Date(b.timestamp || b.date).getTime();
          return dateB - dateA;
        }));
        
      } catch (error) {
        console.error('Fetch history error:', error);
        toast.error('Could not fetch history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const stats = {
    total: history.length,
    danger: history.filter(h => h.overallRisk === 'danger').length,
    safe: history.filter(h => h.overallRisk === 'safe').length,
    safetyScore: history.length > 0 
      ? Math.round((history.filter(h => h.overallRisk === 'safe').length / history.length) * 100) 
      : 100
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your entire history?')) {
      localStorage.removeItem('zovida_history');
      setHistory([]);
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('zovida_history', JSON.stringify(updated));
  };

  const viewResult = (result: AnalysisResult) => {
    // Ensure we have a valid result object before navigating
    if (result && result.medicines) {
      setResult(result);
      navigate('/results');
    }
  };

  const filteredHistory = history.filter(item => {
    const medicines = item.medicines || [];
    const matchesSearch = medicines.some(med => med.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (item.overallRisk && item.overallRisk.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'danger' && item.overallRisk === 'danger') ||
                         (activeFilter === 'safe' && item.overallRisk === 'safe');
    return matchesSearch && matchesFilter;
  });

  const groupHistoryByDate = (items: AnalysisResult[]) => {
    const groups: { [key: string]: AnalysisResult[] } = {};
    items.forEach(item => {
      const date = new Date(item.timestamp || (item as any).date);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      let groupKey = format(date, 'MMMM d, yyyy');
      if (isToday(date)) groupKey = 'Today';
      else if (isYesterday(date)) groupKey = 'Yesterday';
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  };

  const groupedHistory = groupHistoryByDate(filteredHistory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-[calc(8rem+env(safe-area-inset-bottom,0px))] md:pb-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <Header 
        showBack 
        title="Scan History" 
        onManualEntry={() => setIsManualModalOpen(true)} 
      />

      <main className="container max-w-2xl px-4 py-8 space-y-8 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Retrieving History</p>
              <p className="text-sm text-muted-foreground animate-pulse">Syncing with Zovida Cloud...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {history.length > 0 && !searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Health Intelligence</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-9 px-4 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full font-bold" 
                    onClick={handleClearHistory}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Reset Data
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Activity size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Total Scans</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{stats.total}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20 shadow-xl shadow-accent/5 rounded-3xl overflow-hidden">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                        stats.safetyScore > 70 ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
                      )}>
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Safety Score</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{stats.safetyScore}%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Search & Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-focus-within:bg-primary/30 transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <Input 
                    placeholder="Search medicines or risk levels..." 
                    className="pl-12 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-primary/10 focus-visible:ring-primary shadow-xl rounded-2xl text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                <Button 
                  variant={activeFilter === 'all' ? 'default' : 'outline'} 
                  size="sm" 
                  className={cn(
                    "rounded-full px-6 h-10 text-xs font-bold transition-all shrink-0",
                    activeFilter === 'all' ? "shadow-lg shadow-primary/25" : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  )}
                  onClick={() => setActiveFilter('all')}
                >
                  All Activity
                </Button>
                <Button 
                  variant={activeFilter === 'danger' ? 'default' : 'outline'} 
                  size="sm" 
                  className={cn(
                    "rounded-full px-6 h-10 text-xs font-bold transition-all shrink-0",
                    activeFilter === 'danger' 
                      ? "bg-danger hover:bg-danger/90 border-danger shadow-lg shadow-danger/25" 
                      : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  )}
                  onClick={() => setActiveFilter('danger')}
                >
                  <AlertTriangle size={14} className="mr-2" />
                  Critical Only
                </Button>
                <Button 
                  variant={activeFilter === 'safe' ? 'default' : 'outline'} 
                  size="sm" 
                  className={cn(
                    "rounded-full px-6 h-10 text-xs font-bold transition-all shrink-0",
                    activeFilter === 'safe' 
                      ? "bg-safe hover:bg-safe/90 border-safe shadow-lg shadow-safe/25" 
                      : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                  )}
                  onClick={() => setActiveFilter('safe')}
                >
                  <CheckCircle2 size={14} className="mr-2" />
                  Safe Results
                </Button>
              </div>
            </motion.div>

            {/* History List */}
            <div className="space-y-10">
              {Object.keys(groupedHistory).length > 0 ? (
                Object.entries(groupedHistory).map(([date, items], groupIndex) => (
                  <motion.div 
                    key={date} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.1 }}
                    className="space-y-4"
                  >
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 px-1">
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
                      <Calendar size={14} />
                      {date}
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
                    </h3>
                    <div className="grid gap-4">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="overflow-hidden border-white/20 hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-primary/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl"
                            onClick={() => viewResult(item)}
                          >
                            <CardContent className="p-5 flex items-center justify-between">
                              <div className="flex items-center gap-5 min-w-0">
                                <div className={cn(
                                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                  item.overallRisk === 'danger' ? "bg-danger/10 text-danger" :
                                  item.overallRisk === 'caution' ? "bg-caution/10 text-caution" :
                                  "bg-safe/10 text-safe"
                                )}>
                                  {item.overallRisk === 'danger' ? <AlertTriangle size={28} /> :
                                   item.overallRisk === 'caution' ? <Info size={28} /> :
                                   <CheckCircle2 size={28} />}
                                </div>
                                <div className="min-w-0 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate max-w-[180px] sm:max-w-none leading-none">
                                      {(item.medicines || []).map(m => m.name).join(' + ') || 'Medication Scan'}
                                    </h3>
                                    <Badge variant="outline" className={cn(
                                      "text-[9px] py-0 px-2 h-5 font-black shrink-0 rounded-full border-2 uppercase tracking-tighter",
                                      item.overallRisk === 'danger' ? "border-danger/20 text-danger bg-danger/5" :
                                      item.overallRisk === 'caution' ? "border-caution/20 text-caution bg-caution/5" :
                                      "border-safe/20 text-safe bg-safe/5"
                                    )}>
                                      {item.overallRisk || 'unknown'}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                      <Clock size={12} className="text-primary/70" />
                                      {format(new Date(item.timestamp || (item as any).date), 'h:mm a')}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Pill size={12} className="text-accent/70" />
                                      {(item.medicines || []).length} Medicine{(item.medicines || []).length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-9 w-9 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-xl md:opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={(e) => deleteItem(item.id, e)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                  <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-24 px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-primary/10 space-y-8 shadow-inner"
                >
                  <div className="relative mx-auto w-28 h-28">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
                    <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 w-28 h-28 rounded-full flex items-center justify-center text-primary shadow-xl">
                      <History size={56} className="animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight">
                      {searchQuery ? "No results found" : "Your History is Empty"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-[280px] mx-auto leading-relaxed">
                      {searchQuery 
                        ? `We couldn't find any scans matching "${searchQuery}". Try searching for something else.` 
                        : "Every time you scan a prescription or check a medication, Zovida will intelligently track it here."}
                    </p>
                  </div>
                  {!searchQuery && (
                    <div className="flex flex-col gap-3 pt-4">
                      <Button onClick={() => navigate('/scan')} className="bg-primary hover:bg-primary/90 h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 font-bold text-base transition-all active:scale-95">
                        <Scan size={20} className="mr-3" />
                        Start First Scan
                      </Button>
                      <Button variant="ghost" onClick={() => setIsManualModalOpen(true)} className="text-primary hover:bg-primary/5 hover:!text-primary font-bold h-12 rounded-2xl">
                        <Plus size={18} className="mr-2" />
                        Manual Check
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </>
        )}
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

export default HistoryPage;