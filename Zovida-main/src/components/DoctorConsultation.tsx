import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Send,
  MoreVertical,
  User,
  Shield,
  Lock as LockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Doctor } from '@/types';
import { toast } from 'sonner';

interface DoctorConsultationProps {
  doctor: Doctor;
  onClose: () => void;
}

const DoctorConsultation = ({ doctor, onClose }: DoctorConsultationProps) => {
  const [activeTab, setActiveTab] = useState<'video' | 'chat'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'doctor', text: `Hello! I'm ${doctor.name}. I've reviewed your Zovida scan results. How can I help you today?`, time: '10:00 AM' }
  ]);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { role: 'user', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');

    // Mock doctor reply
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'doctor',
        text: "I understand. Based on the scan, I recommend following the prescribed dosage strictly and monitoring for any dizziness.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Shield size={24} />
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Establishing Secure Link</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[200px] mx-auto">
            Connecting to {doctor.name} via encrypted clinical channel...
          </p>
        </div>
        <div className="absolute bottom-12 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
          <LockIcon size={12} className="text-safe" />
          HIPAA Compliant Session
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-xl relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-white/20">
              <AvatarFallback className="bg-primary/20 text-primary font-black text-xs">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-safe border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="font-black text-xs text-white leading-none tracking-tight">{doctor.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinical Specialist</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            <span className="text-[10px] font-black text-white tracking-widest uppercase">Live</span>
            <span className="text-[10px] font-bold text-slate-400 ml-1">05:24</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveTab(activeTab === 'video' ? 'chat' : 'video')}
            className="text-white hover:bg-white/10 rounded-xl"
          >
            <MessageSquare size={18} className={activeTab === 'chat' ? 'text-primary' : ''} />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Video Area */}
        <div className={`flex-1 relative bg-slate-950 flex items-center justify-center transition-all duration-500 ${activeTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          {/* Main Video (Doctor) */}
          <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
            {isVideoOff ? (
              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mx-auto shadow-2xl">
                  <User size={32} className="text-slate-700" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Feed Paused</p>
                  <p className="text-slate-600 text-[10px] font-medium">Doctor is reviewing your report</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full relative">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover grayscale-[0.2] brightness-90"
                >
                  <source 
                    src="https://assets.mixkit.co/videos/preview/mixkit-doctor-talking-to-the-camera-40453-large.mp4" 
                    type="video/mp4" 
                  />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                <div className="absolute inset-0 bg-primary/5 pointer-events-none mix-blend-overlay" />
                
                {/* Subtle Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                
                {/* Connection Status Overlay */}
                <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-xl">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-safe' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Stable</span>
                </div>
              </div>
            )}
            
            {/* Self Video (Small) */}
            <div className="absolute top-6 right-6 w-28 h-40 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden hidden sm:block group transition-all hover:scale-105">
               <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User size={24} className="text-slate-600" />
               </div>
               <div className="absolute bottom-3 left-3 px-2 py-1 bg-slate-950/60 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-wider border border-white/5">
                 You
               </div>
            </div>

            {/* AI Insight Overlay */}
            <div className="absolute top-6 left-6 p-4 rounded-2xl bg-slate-950/40 backdrop-blur-md border border-white/10 space-y-2 max-w-[200px] hidden lg:block">
              <div className="flex items-center gap-2 text-primary">
                <Shield size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Safety Shield</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                Our AI has flagged 2 potential interactions for the doctor to review.
              </p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5 z-20">
              <Button 
                variant={isMuted ? 'destructive' : 'secondary'} 
                size="icon" 
                className={`h-12 w-12 rounded-2xl shadow-2xl transition-all duration-300 ${!isMuted ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-14 w-14 rounded-[1.5rem] shadow-2xl shadow-danger/20 hover:scale-110 active:scale-95 transition-all duration-300"
                onClick={onClose}
              >
                <PhoneOff size={24} />
              </Button>
              <Button 
                variant={isVideoOff ? 'destructive' : 'secondary'} 
                size="icon" 
                className={`h-12 w-12 rounded-2xl shadow-2xl transition-all duration-300 ${!isVideoOff ? 'bg-white/10 hover:bg-white/20 text-white border-white/10' : ''}`}
                onClick={() => setIsVideoOff(!isVideoOff)}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`w-full md:w-80 lg:w-96 border-l border-white/10 bg-slate-950 flex flex-col transition-all duration-500 ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Consultation Chat</h4>
            <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
          </div>
          
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-6">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-[1.25rem] text-[13px] leading-relaxed font-medium shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-2 px-1 uppercase tracking-tighter">{msg.time}</span>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-5 border-t border-white/5 bg-slate-900/30">
            <form onSubmit={handleSendMessage} className="relative">
              <Input 
                placeholder="Message doctor..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-900 border-white/5 focus-visible:ring-primary/30 h-12 pl-4 pr-12 rounded-xl text-sm text-white placeholder:text-slate-600"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!message.trim()}
                className="absolute right-1 top-1 h-10 w-10 bg-primary hover:bg-primary/90 rounded-lg shadow-lg"
              >
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorConsultation;
