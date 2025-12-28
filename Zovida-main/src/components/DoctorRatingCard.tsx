import { DoctorRating as DoctorRatingType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, ShieldCheck, AlertTriangle, ShieldAlert, MessageCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface DoctorRatingCardProps {
  rating: DoctorRatingType;
  onConsultClick: () => void;
  onScheduleClick?: () => void;
}

const DoctorRatingCard = ({ rating, onConsultClick, onScheduleClick }: DoctorRatingCardProps) => {
  const safePercent = Math.round((rating.safeRatings / rating.totalReviews) * 100);
  const cautionPercent = Math.round((rating.cautionRatings / rating.totalReviews) * 100);
  const dangerPercent = Math.round((rating.dangerRatings / rating.totalReviews) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="pb-3 bg-secondary/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="text-primary" size={18} />
              Clinician Review Signal (Anonymous)
            </CardTitle>
            <div className="flex items-center gap-1 bg-trust/20 px-2 py-1 rounded-full">
              <Star className="text-trust fill-trust" size={14} />
              <span className="font-bold text-foreground text-sm">{rating.averageScore.toFixed(1)}</span>
              <span className="text-muted-foreground text-[10px]">/5</span>
            </div>
          </div>
          <p className="text-[10px] text-primary/60 font-medium flex items-center gap-1 mt-1">
            <ShieldCheck size={12} />
            Pilot clinician validation available
          </p>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Based on <span className="font-semibold text-foreground">{rating.totalReviews}</span> doctor reviews
          </p>

          {/* Rating breakdown */}
          <div className="space-y-3">
            {/* Safe */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-safe shrink-0" size={18} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Rated Safe</span>
                  <span className="font-semibold">{rating.safeRatings} doctors</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-safe rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${safePercent}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-12 text-right">{safePercent}%</span>
            </div>

            {/* Caution */}
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-caution shrink-0" size={18} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Rated Caution</span>
                  <span className="font-semibold">{rating.cautionRatings} doctors</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-caution rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${cautionPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-12 text-right">{cautionPercent}%</span>
            </div>

            {/* Danger */}
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-danger shrink-0" size={18} />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Rated Danger</span>
                  <span className="font-semibold">{rating.dangerRatings} doctors</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-danger rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${dangerPercent}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium w-12 text-right">{dangerPercent}%</span>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="default"
              className="text-sm h-11 bg-primary"
              onClick={onConsultClick}
            >
              <MessageCircle size={18} className="mr-2" />
              Share Safety Report with a Doctor
            </Button>
            <Button
              variant="outline"
              className="text-sm h-11 border-primary/20 text-primary"
              onClick={() => window.open('https://www.google.com/maps/search/hospitals+near+me', '_blank')}
            >
              <Calendar size={18} className="mr-2" />
              Find Care Providers
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DoctorRatingCard;
