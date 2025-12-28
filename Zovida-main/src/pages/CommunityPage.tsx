import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Shield, Activity, Share2, TrendingUp, AlertTriangle, Newspaper, Globe, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { endpoints } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommunityPost {
  id: number;
  user_name: string;
  medication_profile: string[];
  experience: string;
  side_effects: string;
  is_doctor_reviewed: boolean;
  timestamp: string;
}

interface HealthAlert {
  id: number;
  type: 'outbreak' | 'statistic' | 'event';
  title: string;
  description: string;
  region: string;
  cases_reported: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const CommunityPage = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [matchingCount, setMatchingCount] = useState<number>(0);
  const [newPost, setNewPost] = useState({ experience: '', sideEffects: '', meds: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [searchMeds, setSearchMeds] = useState('Paracetamol');
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

  useEffect(() => {
    fetchData();
    fetchAiSummary(searchMeds);
  }, []);

  // Bulletin slider effect
  useEffect(() => {
    if (alerts.length > 0) {
      const timer = setInterval(() => {
        setCurrentAlertIndex((prev) => (prev + 1) % alerts.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [alerts]);

  const fetchAiSummary = async (meds: string) => {
    try {
      const res = await fetch(endpoints.community.aiSummary(meds));
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary);
      }
    } catch (error) {
      console.error('AI Summary error:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [postsRes, alertsRes] = await Promise.all([
        fetch(endpoints.community.posts),
        fetch(endpoints.alerts.get)
      ]);
      
      if (postsRes.ok) setPosts(await postsRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      
      // Get matching stats for a common drug for demo
      const statsRes = await fetch(endpoints.community.matchingStats('Paracetamol'));
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setMatchingCount(stats.count);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    const userId = localStorage.getItem('zovida_user_id');
    if (!userId) return;

    try {
      const res = await fetch(endpoints.community.posts, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          medication_profile: newPost.meds.split(',').map(m => m.trim()),
          experience: newPost.experience,
          side_effects: newPost.sideEffects
        })
      });

      if (res.ok) {
        toast.success('Experience shared with the community!');
        const meds = newPost.meds;
        setNewPost({ experience: '', sideEffects: '', meds: '' });
        fetchData();
        fetchAiSummary(meds.split(',')[0].trim());
      }
    } catch (error) {
      toast.error('Failed to share experience');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="Patient Community" />
      
      {/* Bulletin Banner */}
      {alerts.length > 0 && (
        <div className="bg-danger/10 border-b border-danger/20 py-2 overflow-hidden">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="animate-pulse flex-shrink-0">
                LIVE BULLETIN
              </Badge>
              <div className="relative flex-1 h-6 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentAlertIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-medium text-danger truncate"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-bold">[{alerts[currentAlertIndex].region}]</span>
                    {alerts[currentAlertIndex].title}: {alerts[currentAlertIndex].description}
                    {alerts[currentAlertIndex].cases_reported > 0 && (
                      <span className="ml-2 bg-danger/20 px-2 py-0.5 rounded text-xs">
                        {alerts[currentAlertIndex].cases_reported} cases reported
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex gap-1">
                {alerts.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentAlertIndex ? "bg-danger w-3" : "bg-danger/30"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Matching Profiles</p>
                  <h3 className="text-2xl font-bold">{matchingCount}+ Patients</h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Found {matchingCount} people with similar medication profiles sharing experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-indigo-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">AI Trend Analysis</p>
                  <h3 className="text-xl font-bold">Community Insights: {searchMeds}</h3>
                </div>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 p-4 rounded-lg border border-indigo-500/10">
                {aiSummary || "Select a medication to see community trends and side-effect analysis..."}
              </div>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="community" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Community
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="w-4 h-4" /> Health Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-6">
            {/* Create Post */}
            <Card className="border-dashed border-2 bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">Share Your Experience</CardTitle>
                <CardDescription>Help others by sharing your journey with specific medications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Medications (e.g., Aspirin, Metformin)" 
                  value={newPost.meds}
                  onChange={e => setNewPost({...newPost, meds: e.target.value})}
                />
                <Textarea 
                  placeholder="How was your experience?" 
                  value={newPost.experience}
                  onChange={e => setNewPost({...newPost, experience: e.target.value})}
                />
                <Textarea 
                  placeholder="Any side effects noticed?" 
                  value={newPost.sideEffects}
                  onChange={e => setNewPost({...newPost, sideEffects: e.target.value})}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreatePost} className="w-full gap-2">
                  <Share2 className="w-4 h-4" /> Share Experience
                </Button>
              </CardFooter>
            </Card>

            {/* Posts Feed */}
            <div className="grid grid-cols-1 gap-6">
              {posts.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{post.user_name}</CardTitle>
                          {post.is_doctor_reviewed && (
                            <Badge variant="secondary" className="bg-safe/10 text-safe border-safe/20 gap-1">
                              <Shield className="w-3 h-3" /> Doctor Reviewed
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {post.medication_profile.map((med, i) => (
                            <Badge key={i} variant="outline">{med}</Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-1">Experience</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{post.experience}</p>
                      </div>
                      {post.side_effects && (
                        <div>
                          <p className="text-sm font-semibold mb-1 text-danger">Side Effects</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{post.side_effects}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t py-3">
                      <div className="flex gap-4">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
                          <Activity className="w-4 h-4" /> Medication Buddy
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="relative group">
              <AnimatePresence mode="wait">
                {alerts.length > 0 && (
                  <motion.div
                    key={alerts[currentAlertIndex].id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className={cn(
                      "border-l-8 min-h-[300px] flex flex-col justify-center relative overflow-hidden",
                      alerts[currentAlertIndex].severity === 'high' ? "border-l-danger bg-danger/5" : 
                      alerts[currentAlertIndex].severity === 'medium' ? "border-l-caution bg-caution/5" : "border-l-safe bg-safe/5"
                    )}>
                      {/* Decorative Background Icon */}
                      <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12">
                        {alerts[currentAlertIndex].type === 'outbreak' ? (
                          <Activity className="w-64 h-64" />
                        ) : alerts[currentAlertIndex].type === 'statistic' ? (
                          <TrendingUp className="w-64 h-64" />
                        ) : (
                          <Newspaper className="w-64 h-64" />
                        )}
                      </div>

                      <CardHeader className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-2">
                            <Badge variant={alerts[currentAlertIndex].type === 'outbreak' ? 'destructive' : 'secondary'} className="px-4 py-1 text-sm font-bold">
                              {alerts[currentAlertIndex].type.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-white/50 dark:bg-slate-900/50">
                              {alerts[currentAlertIndex].severity.toUpperCase()} SEVERITY
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                            <MapPin className="w-4 h-4" /> {alerts[currentAlertIndex].region}
                          </div>
                        </div>
                        <CardTitle className="text-3xl font-black mb-2 leading-tight">
                          {alerts[currentAlertIndex].title}
                        </CardTitle>
                        <CardDescription className="text-lg font-medium text-slate-600 dark:text-slate-400 max-w-2xl">
                          {alerts[currentAlertIndex].description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10">
                        <div className="flex flex-wrap gap-8 mt-4">
                          {alerts[currentAlertIndex].cases_reported > 0 && (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Impact</span>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-danger/20 rounded-lg">
                                  <Activity className="w-5 h-5 text-danger" />
                                </div>
                                <span className="text-3xl font-black text-danger">{alerts[currentAlertIndex].cases_reported.toLocaleString()}</span>
                                <span className="text-sm font-bold text-danger/70">Cases</span>
                              </div>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Updated</span>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                                <Globe className="w-5 h-5 text-slate-500" />
                              </div>
                              <span className="text-lg font-bold">
                                {new Date(alerts[currentAlertIndex].timestamp).toLocaleDateString(undefined, { 
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="relative z-10 border-t bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary">
                          <Shield className="w-4 h-4" /> Official Public Health Notice
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Slider Navigation */}
              <div className="flex justify-center gap-2 mt-6">
                {alerts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentAlertIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === currentAlertIndex ? "w-12 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400"
                    )}
                    aria-label={`Go to alert ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Global Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Incidents</p>
                    <h4 className="text-4xl font-black text-primary">
                      {alerts.length}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 mt-2 flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Active Alerts
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-danger/5 border-danger/20">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Impact</p>
                    <h4 className="text-4xl font-black text-danger">
                      {alerts.reduce((acc, curr) => acc + curr.cases_reported, 0).toLocaleString()}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 mt-2">Cases Reported Today</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-safe/5 border-safe/20 md:col-span-1">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">System Status</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-safe rounded-full animate-pulse" />
                      <h4 className="text-xl font-black text-safe uppercase">Live Monitoring</h4>
                    </div>
                    <p className="text-xs font-medium text-slate-400 mt-2">Data synced with Govt APIs</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CommunityPage;
