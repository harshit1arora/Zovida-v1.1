import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ZovidaLogo from '@/components/ZovidaLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Scan, 
  History, 
  Plus, 
  Users, 
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Globe,
  Settings,
  Shield,
  Phone
} from 'lucide-react';
import { endpoints } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

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
        "sticky top-0 z-50 transition-all duration-300 ease-in-out pt-[env(safe-area-inset-top,0px)]",
        isScrolled 
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-2" 
          : "bg-transparent border-b border-transparent py-4 md:py-6"
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
      
      <div className="container flex items-center justify-between px-3 md:px-6 relative z-10">
        <div className="flex items-center gap-2 md:gap-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
              <SheetHeader className="p-6 text-left border-b">
                <SheetTitle className="flex items-center gap-2">
                  <ZovidaLogo size="sm" showText={false} />
                  <span>Zovida Menu</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col py-4">
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className="justify-start px-6 py-6 h-auto text-sm font-semibold gap-3"
                    onClick={() => {
                      item.path ? navigate(item.path) : item.onClick?.();
                    }}
                  >
                    <item.icon size={18} className="text-primary" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-11 w-11">
              <ArrowLeft size={22} />
            </Button>
          )}
          
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <ZovidaLogo size="sm" showText={false} className="w-7 h-7 md:w-8 md:h-8" />
            {!showBack && (
              <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground group-hover:tracking-tight transition-all duration-300">
                Zovida<span className="text-primary animate-pulse">.</span>
              </span>
            )}
            {title && <h1 className="text-lg font-black md:hidden truncate max-w-[100px] sm:max-w-[150px] tracking-tight ml-1">{title}</h1>}
          </div>

          <nav className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            {navItems.map((item) => {
              const isActive = item.path && location.pathname === item.path;
              return (
                <Button 
                  key={item.label}
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "text-[10px] md:text-xs font-medium rounded-lg px-2 md:px-4 h-8 md:h-9 transition-colors",
                    isActive 
                      ? "bg-slate-100 dark:bg-slate-800 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-900"
                  )}
                  onClick={() => item.path ? navigate(item.path) : item.onClick?.()}
                >
                  <item.icon size={14} className="mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => navigate('/sos')}
            className="rounded-full px-3 md:px-4 h-8 text-[10px] font-bold shadow-lg shadow-red-500/20 flex items-center gap-1.5 animate-in fade-in zoom-in duration-500"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            SOS
          </Button>

          {rightContent}
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 pl-2 pr-1 cursor-pointer outline-none group/avatar">
                      <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-[11px] font-bold text-foreground leading-none group-hover/avatar:text-primary transition-colors">
                          {user.name || 'User'}
                        </span>
                        <span className="text-[8px] font-medium text-muted-foreground uppercase mt-1">
                          Free Tier
                        </span>
                      </div>
                      
                      <Avatar className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-white font-bold text-sm rounded-xl">
                          {(user.name || 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1">
                    <DropdownMenuLabel className="px-3 py-2">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold">{user.name || 'User'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="rounded-lg px-3 py-2 text-xs font-medium gap-3 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-primary dark:focus:text-primary cursor-pointer"
                    >
                      <UserIcon size={14} />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/family')}
                      className="rounded-lg px-3 py-2 text-xs font-medium gap-3 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-primary dark:focus:text-primary cursor-pointer"
                    >
                      <Shield size={14} />
                      SafeCircle
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/history')}
                      className="rounded-lg px-3 py-2 text-xs font-medium gap-3 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-primary dark:focus:text-primary cursor-pointer"
                    >
                      <History size={14} />
                      Checkup History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="rounded-lg px-3 py-2 text-xs font-medium gap-3 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-500 text-red-500 cursor-pointer"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                <LanguageSwitcher />
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate('/auth')} 
                  className="hidden sm:flex rounded-full h-8 px-5 font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
