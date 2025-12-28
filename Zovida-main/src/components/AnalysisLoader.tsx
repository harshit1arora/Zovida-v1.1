import { motion } from 'framer-motion';
import { Scan, Sparkles, Brain, FileSearch } from 'lucide-react';

const AnalysisLoader = () => {
  const steps = [
    { icon: Scan, label: 'Scanning prescription...' },
    { icon: FileSearch, label: 'Extracting medicine names...' },
    { icon: Brain, label: 'Analyzing with Azure AI...' },
    { icon: Sparkles, label: 'Generating safety report...' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Animated scanner */}
      <div className="relative w-48 h-48 mb-8">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Inner ring with gradient */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-hero opacity-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Scanning line */}
        <motion.div
          className="absolute inset-8 overflow-hidden rounded-full"
        >
          <motion.div
            className="w-full h-1 bg-accent shadow-glow"
            animate={{ y: [-80, 80, -80] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="bg-card p-4 rounded-2xl shadow-lg">
            <Brain className="text-primary" size={40} />
          </div>
        </motion.div>

        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-accent rounded-full shadow-glow"
            style={{ top: '50%', left: '50%' }}
            animate={{
              x: [0, 70, 0, -70, 0],
              y: [-70, 0, 70, 0, -70],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Loading steps */}
      <div className="space-y-3 w-full max-w-xs">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.8 }}
          >
            <motion.div
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: index * 0.8,
              }}
            >
              <step.icon className="text-primary" size={20} />
            </motion.div>
            <span className="text-sm text-muted-foreground">{step.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Shimmer effect on loading text */}
      <motion.p
        className="mt-6 text-muted-foreground text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Please wait while we analyze your prescription...
      </motion.p>
    </div>
  );
};

export default AnalysisLoader;
