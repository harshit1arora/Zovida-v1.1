import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ZovidaLogo from '@/components/ZovidaLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Scan, 
  History, 
  Plus, 
  Users, 
  Phone,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Globe,
  Settings
} from 'lucide-react';
import { endpoints } from '@/lib/api';

interface HeaderProps {
  showBack?: boolean;
  title?: string;
  onManualEntry?: () => void;
  rightContent?: React.ReactNode;
}

const Header = ({ showBack, title, onManualEntry, rightContent }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('zovida_user_id');
      if (userId) {
        try {
          const response = await fetch(endpoints.users.profile(userId));
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('zovida_user_id');
    setUser(null);
    navigate('/auth');
  };

  const handleManualEntry = () => {
    if (onManualEntry) {
      onManualEntry();
    } else {
      window.dispatchEvent(new CustomEvent('open-manual-entry'));
    }
  };

  const navItems = [
    { label: 'Scan', path: '/scan', icon: Scan },
    { label: 'History', path: '/history', icon: History },
    { label: 'Manual Entry', onClick: handleManualEntry, icon: Plus },
    { label: 'Doctors', path: '/doctors', icon: Users },
    { label: 'Community', path: '/community', icon: Globe },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-2 shadow-lg shadow-slate-200/20 dark:shadow-black/20" 
          : "bg-transparent border-b border-transparent py-4"
      )}
    >
      {/* Decorative top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-blue-500 to-safe opacity-80" />
      
      {/* Subtle background mesh pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} 
      />
      
      <div className="container flex items-center justify-between px-4 md:px-6 relative z-10">
        <div className="flex items-center gap-2 md:gap-8">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors h-9 w-9">
              <ArrowLeft size={20} />
            </Button>
          )}
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-1.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-primary/10">
                <ZovidaLogo size="sm" showText={false} />
              </div>
            </div>
            {!showBack && (
              <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground group-hover:tracking-tight transition-all duration-300">
                Zovida<span className="text-primary animate-pulse">.</span>
              </span>
            )}
            {title && <h1 className="text-lg font-black md:hidden truncate max-w-[100px] sm:max-w-[150px] tracking-tight">{title}</h1>}
          </div>

          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
            {navItems.map((item) => {
              const isActive = item.path && location.pathname === item.path;
              return (
                <Button 
                  key={item.label}
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "text-[11px] font-bold rounded-xl px-4 h-9 transition-all duration-300 relative group/nav",
                    isActive 
                      ? "bg-white dark:bg-slate-800 text-primary shadow-md shadow-primary/5 ring-1 ring-slate-200/50 dark:ring-slate-700/50" 
                      : "text-muted-foreground hover:text-primary hover:bg-white/60 dark:hover:bg-slate-800/60"
                  )}
                  onClick={() => item.path ? navigate(item.path) : item.onClick?.()}
                >
                  <item.icon size={14} className={cn("mr-2 transition-transform duration-300 group-hover/nav:-translate-y-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    />
                  )}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {rightContent}
          <div className="hidden sm:flex items-center gap-3 mr-1">
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-9 px-5 rounded-xl font-black tracking-wide shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all active:scale-95 flex items-center gap-2 text-xs relative overflow-hidden group/sos"
              onClick={() => navigate('/sos')}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/sos:translate-y-0 transition-transform duration-300" />
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="relative z-10">SOS</span>
            </Button>
            <div className="w-px h-6 bg-slate-200/50 dark:bg-slate-800/50 mx-0.5" />
          </div>
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="sm:hidden rounded-xl h-9 w-9 shadow-lg shadow-red-500/20 active:scale-90 transition-transform"
            onClick={() => navigate('/sos')}
          >
            <Phone size={18} />
          </Button>

          <div className="flex items-center gap-1.5 bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-md p-1 rounded-2xl border border-white/20 dark:border-white/5 shadow-inner">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 pl-1.5 pr-0.5 cursor-pointer outline-none">
                    <div className="flex flex-col items-end hidden md:flex group/profile">
                      <span className="text-[11px] font-black text-foreground leading-none group-hover:text-primary transition-colors">
                        {user.name || 'User'}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1 h-1 rounded-full bg-safe animate-pulse" />
                        <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                          Free Tier
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative group/avatar">
                      <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-blue-400 rounded-xl blur opacity-20 group-hover/avatar:opacity-40 transition-opacity" />
                      <div className="relative h-8 w-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20 border border-white/20">
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/30">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/auth')} 
                className="hidden sm:flex rounded-xl h-8 px-5 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-[11px] bg-gradient-to-r from-primary to-blue-600 border-none"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
