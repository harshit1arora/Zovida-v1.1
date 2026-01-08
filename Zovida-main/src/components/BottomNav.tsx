import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Home, 
  Scan, 
  Users, 
  Heart,
  History
} from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Scan, label: 'Scan', path: '/scan', isPrimary: true },
    { icon: Heart, label: 'Family', path: '/family' },
    { icon: Users, label: 'Doctors', path: '/doctors' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-4 pb-[env(safe-area-inset-bottom,16px)]">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-6 py-2 flex items-center justify-between relative">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.isPrimary) {
            return (
              <div key={item.label} className="relative -mt-10">
                <Button
                  variant="scan"
                  size="icon"
                  className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-950 bg-primary hover:bg-primary/90 transition-all active:scale-90 shadow-[0_8px_24px_rgba(59,130,246,0.4)]"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon size={28} className="text-white" />
                </Button>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                   <span className={cn(
                     "text-[9px] font-black uppercase tracking-tighter",
                     isActive ? "text-primary" : "text-muted-foreground"
                   )}>
                    {item.label}
                  </span>
                  {isActive && <div className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.label}
              className={cn(
                "flex flex-col items-center gap-1 transition-all relative py-1",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
              )}
              onClick={() => navigate(item.path)}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive && "bg-primary/10"
              )}>
                <item.icon size={20} className={cn(isActive && "animate-pulse")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-tighter",
                isActive ? "opacity-100" : "opacity-60"
              )}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
