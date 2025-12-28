import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage?: string; // If not provided, we'll apply a "smart" filter to the beforeImage
  detectedMedicines?: string[];
  overallRisk?: 'safe' | 'caution' | 'danger';
  className?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
  beforeImage, 
  afterImage, 
  detectedMedicines = [], 
  overallRisk = 'safe',
  className 
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const relativeX = x - containerRect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / containerRect.width) * 100));
    
    setSliderPos(percentage);
  };

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => handleMove(e);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 select-none group", className)}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Before Image (Bottom Layer) */}
      <div className="absolute inset-0">
        <img 
          src={beforeImage} 
          alt="Before" 
          className="w-full h-full object-cover grayscale-[0.5] brightness-75 transition-all duration-700"
        />
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          Raw Capture
        </div>
      </div>

      {/* After Image (Top Layer - Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <div className="absolute inset-0 w-[100vw] h-full" style={{ width: containerRef.current?.offsetWidth }}>
          <img 
            src={afterImage || beforeImage} 
            alt="After" 
            className={cn(
              "w-full h-full object-cover brightness-110 saturate-[1.2] transition-all duration-700",
              !afterImage && "sepia-[0.1] contrast-[1.1]"
            )}
          />
          
          {/* Simulated AR Highlights */}
          <div className="absolute inset-0 pointer-events-none">
            {detectedMedicines.length > 0 ? (
              detectedMedicines.map((med, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute border-2 border-primary/60 bg-primary/10 rounded-lg backdrop-blur-[2px]"
                  style={{
                    top: `${20 + (index * 25)}%`,
                    left: `${15 + (index * 10)}%`,
                    width: '30%',
                    height: '12%'
                  }}
                >
                  <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-full text-[9px] font-bold text-white shadow-lg">
                    <Sparkles size={10} />
                    DETECTED: {med.toUpperCase()}
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/20 text-xs font-medium text-white/80">
                  No critical interactions detected in this area
                </div>
              </motion.div>
            )}

            {overallRisk !== 'safe' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={cn(
                  "absolute bottom-[15%] right-[10%] w-[35%] h-[10%] border-2 rounded-lg backdrop-blur-[2px]",
                  overallRisk === 'danger' ? "border-danger/60 bg-danger/10" : "border-caution/60 bg-caution/10"
                )}
              >
                <div className={cn(
                  "absolute -top-6 right-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-lg",
                  overallRisk === 'danger' ? "bg-danger" : "bg-caution"
                )} >
                  <AlertCircle size={10} />
                  {overallRisk.toUpperCase()} RISK DETECTED
                </div>
              </motion.div>
            )}

            {/* Scanning Line Effect */}
            <motion.div 
              className="absolute top-0 bottom-0 w-1 bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-20"
              style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            />
          </div>
        </div>
        
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary/80 backdrop-blur-md rounded-full border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
          <Sparkles size={12} className="animate-spin-slow" />
          AI Enhanced Analysis
        </div>
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-10 h-10 rounded-full bg-white shadow-2xl border-4 border-primary flex items-center justify-center pointer-events-auto active:scale-90 transition-transform">
          <Scan size={20} className="text-primary" />
        </div>
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-white rounded-md text-[9px] font-bold text-primary shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap uppercase tracking-tighter">
          Slide to Compare
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
