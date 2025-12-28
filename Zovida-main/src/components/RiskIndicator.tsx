import { RiskLevel } from '@/types';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskIndicatorProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

const riskConfig = {
  safe: {
    icon: ShieldCheck,
    label: 'Safe',
    description: 'No harmful interactions detected',
    bgClass: 'bg-gradient-safe',
    textClass: 'text-safe',
    ringClass: 'ring-safe',
  },
  caution: {
    icon: AlertTriangle,
    label: 'Caution',
    description: 'Potential interaction - monitor closely',
    bgClass: 'bg-gradient-caution',
    textClass: 'text-caution',
    ringClass: 'ring-caution',
  },
  danger: {
    icon: ShieldAlert,
    label: 'Danger',
    description: 'Dangerous interaction detected',
    bgClass: 'bg-gradient-danger',
    textClass: 'text-danger',
    ringClass: 'ring-danger',
  },
};

const RiskIndicator = ({ 
  level, 
  size = 'md', 
  showLabel = true,
  animate = true 
}: RiskIndicatorProps) => {
  const config = riskConfig[level];
  const Icon = config.icon;

  const sizes = {
    sm: { icon: 20, container: 'w-10 h-10', text: 'text-sm' },
    md: { icon: 28, container: 'w-14 h-14', text: 'text-base' },
    lg: { icon: 40, container: 'w-20 h-20', text: 'text-lg' },
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {animate && level === 'danger' && (
          <motion.div
            className={`absolute inset-0 ${sizes[size].container} rounded-full ${config.bgClass} opacity-30`}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <motion.div
          className={`${sizes[size].container} ${config.bgClass} rounded-full flex items-center justify-center shadow-lg relative z-10`}
          initial={animate ? { scale: 0 } : {}}
          animate={animate ? { scale: 1 } : {}}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Icon 
            size={sizes[size].icon} 
            className="text-white" 
            strokeWidth={2.5}
          />
        </motion.div>
      </div>
      {showLabel && (
        <motion.div 
          className="text-center"
          initial={animate ? { opacity: 0, y: 10 } : {}}
          animate={animate ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <p className={`font-bold ${sizes[size].text} ${config.textClass}`}>
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground max-w-[150px]">
            {config.description}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RiskIndicator;
