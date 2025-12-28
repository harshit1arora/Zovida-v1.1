import { Doctor } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Video, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

interface DoctorListItemProps {
  doctor: Doctor;
  index: number;
  onConsult: (doctor: Doctor) => void;
}

const DoctorListItem = ({ doctor, index, onConsult }: DoctorListItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-100 dark:border-slate-800 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[1.5rem]">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar & Basic Info */}
            <div className="flex gap-4 flex-1">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-lg font-black text-primary border border-primary/10 group-hover:scale-105 transition-transform duration-300">
                  {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                {doctor.available && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-safe border-2 border-white dark:border-slate-900" />
                )}
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-black text-slate-900 dark:text-white truncate tracking-tight">{doctor.name}</h4>
                  <div className="flex items-center gap-1 bg-trust/10 px-1.5 py-0.5 rounded-md">
                    <Star className="text-trust fill-trust" size={10} />
                    <span className="text-[10px] font-black text-trust">{doctor.rating}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-primary/80 uppercase tracking-wider mb-2">{doctor.specialty}</p>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <MapPin size={12} />
                    <span className="text-[11px] font-medium truncate max-w-[120px]">{doctor.hospital || 'Private Practice'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <Clock size={12} />
                    <span className="text-[11px] font-medium">10:00 - 18:00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Actions */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:items-end">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fee</span>
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  ${doctor.consultationFee}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={doctor.available ? 'default' : 'secondary'}
                  size="sm"
                  disabled={!doctor.available}
                  onClick={() => onConsult(doctor)}
                  className="h-9 px-4 rounded-xl font-bold text-[11px] shadow-lg shadow-primary/10"
                >
                  <Video size={14} className="mr-1.5" />
                  Consult
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorListItem;
