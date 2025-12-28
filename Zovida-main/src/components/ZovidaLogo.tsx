import { motion } from 'framer-motion';

interface ZovidaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const ZovidaLogo = ({ size = 'md', showText = true, className = "" }: ZovidaLogoProps) => {
  const sizes = {
    sm: { icon: 20, text: 'text-xl', sub: 'text-[8px]' },
    md: { icon: 32, text: 'text-3xl', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-5xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-7xl', sub: 'text-sm' },
  };

  return (
    <motion.div 
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="relative group">
        {/* Futuristic Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-safe/40 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
        
        {/* Main Logo Container */}
        <motion.div 
          className="relative bg-white dark:bg-slate-900 rounded-[1.25rem] p-2.5 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
          whileHover={{ y: -5, rotate: [0, -5, 5, 0] }}
          transition={{ 
            y: { type: "spring", stiffness: 300, damping: 20 },
            rotate: { duration: 0.4, ease: "easeInOut" }
          }}
        >
          {/* Animated Gradient Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-safe opacity-90"
            animate={{ 
              background: [
                "linear-gradient(to bottom right, #3b82f6, #2563eb, #10b981)",
                "linear-gradient(to bottom right, #10b981, #3b82f6, #2563eb)",
                "linear-gradient(to bottom right, #2563eb, #10b981, #3b82f6)"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />

          {/* New Modern Icon Design (Custom SVG) */}
          <svg 
            width={sizes[size].icon} 
            height={sizes[size].icon} 
            viewBox="0 0 40 40" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow-md"
          >
            {/* Shield Outline */}
            <path 
              d="M20 4L32 9V19C32 26.38 26.88 33.25 20 36C13.12 33.25 8 26.38 8 19V9L20 4Z" 
              stroke="white" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Abstract 'Z' Sparkle */}
            <motion.path 
              d="M15 15L25 15L15 25L25 25" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            {/* Safety Dot */}
            <motion.circle 
              cx="20" cy="20" r="3" 
              fill="white" 
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </motion.div>

        {/* Floating AI Orbs */}
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-safe rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-900 shadow-lg"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span className={`font-black ${sizes[size].text} tracking-tighter text-foreground leading-none`}>
              Zovida
            </span>
            <motion.span 
              className={`font-black ${sizes[size].text} text-primary leading-none`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              .
            </motion.span>
          </div>
          <motion.div 
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="h-[1px] w-4 bg-gradient-to-r from-primary to-transparent" />
            <span className={`font-bold uppercase tracking-[0.2em] text-muted-foreground/60 ${sizes[size].sub}`}>
              Imagine Cup <span className="text-primary/40">2025</span>
            </span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ZovidaLogo;
