import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingSOS = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(true);

  // Optional: Hide SOS button on certain pages like /sos itself
  const pathname = window.location.pathname;
  if (pathname === '/sos' || pathname === '/auth') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] sm:bottom-10"
        >
          <Button
            variant="destructive"
            size="lg"
            className="h-12 px-6 rounded-full transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/sos')}
          >
            <Phone size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">Need urgent help</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSOS;
