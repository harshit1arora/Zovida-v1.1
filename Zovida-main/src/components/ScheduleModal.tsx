import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  CheckCircle2,
  X,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctor } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ScheduleModalProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string) => void;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

const ScheduleModal = ({ doctor, isOpen, onClose, onConfirm }: ScheduleModalProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [step, setStep] = useState(1);

  const handleConfirm = () => {
    if (date && time) {
      onConfirm(date, time);
      setStep(3); // Show success step
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setDate(new Date());
    setTime("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        {step < 3 && (
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule a consultation with {doctor.name}
            </DialogDescription>
          </DialogHeader>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-3 border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{doctor.name}</h4>
                  <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Date</label>
                <div className="border rounded-xl p-2 bg-muted/30">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border-0"
                  />
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={() => setStep(2)}
                disabled={!date}
              >
                Continue to Time Slots
                <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="-ml-2 text-muted-foreground">
                  Change Date ({date ? format(date, 'MMM dd') : ''})
                </Button>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} />
                  Available Time Slots
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={time === slot ? 'default' : 'outline'}
                      className={`text-xs h-10 ${time === slot ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                      onClick={() => setTime(slot)}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 flex gap-3">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 dark:text-amber-400">
                  A consultation fee of ${doctor.consultationFee} will be charged upon confirmation. You can cancel up to 2 hours before.
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={handleConfirm} disabled={!time}>Confirm Booking</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-safe/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} className="text-safe animate-bounce" />
              </div>
              <h3 className="text-xl font-bold">Appointment Confirmed!</h3>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Successfully scheduled with</p>
                <p className="font-semibold">{doctor.name}</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl inline-block mt-4 border">
                <p className="text-sm font-medium">
                  {date ? format(date, 'EEEE, MMMM dd') : ''}
                </p>
                <p className="text-primary font-bold text-lg">{time}</p>
              </div>
              <p className="text-xs text-muted-foreground px-8">
                A confirmation email and calendar invite have been sent to you.
              </p>
              <Button className="w-full mt-8" onClick={resetAndClose}>Great, thanks!</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleModal;
