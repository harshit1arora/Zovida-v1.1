import { Medicine } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Pill, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface MedicineCardProps {
  medicine: Medicine;
  index: number;
}

const MedicineCard = ({ medicine, index }: MedicineCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-secondary/30 border-0 overflow-hidden">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="text-primary" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">
                {medicine.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {medicine.dosage} • {medicine.frequency}
              </p>
            </div>
          </div>
          
          {medicine.components && medicine.components.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 mb-2">
                <Info size={12} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Components</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {medicine.components.map((comp) => (
                  <Badge 
                    key={comp} 
                    variant="outline" 
                    className="bg-primary/5 text-[10px] py-0 h-5 border-primary/20"
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MedicineCard;
