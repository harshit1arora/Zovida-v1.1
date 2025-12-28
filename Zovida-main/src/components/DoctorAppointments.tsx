import { useAppointmentStore } from '@/store/appointmentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  MoreVertical, 
  XCircle,
  Video,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, parseISO } from 'date-fns';
import { toast } from 'sonner';

const DoctorAppointments = () => {
  const { appointments, cancelAppointment } = useAppointmentStore();

  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden bg-white h-full">
      <CardHeader className="bg-accent/5 border-b flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-accent/10 rounded-lg text-accent-foreground">
            <Calendar size={18} />
          </div>
          <div>
            <CardTitle className="text-lg">My Appointments</CardTitle>
            <p className="text-xs text-muted-foreground">Your upcoming consultations</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {upcomingAppointments.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Calendar size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">No upcoming appointments</p>
                  <p className="text-xs text-muted-foreground">Book a consultation with our experts.</p>
                </div>
              </motion.div>
            ) : (
              upcomingAppointments.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm">{app.doctorName}</p>
                      <p className="text-[10px] text-muted-foreground">{app.doctorSpecialty}</p>
                      <div className="flex items-center gap-2 text-[10px] text-primary font-medium mt-1">
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          {format(parseISO(app.date), 'MMM dd, yyyy')}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {app.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        cancelAppointment(app.id);
                        toast.success("Appointment cancelled");
                      }}
                    >
                      <XCircle size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
                    >
                      <Video size={12} />
                      Join
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {upcomingAppointments.length > 0 && (
          <div className="p-3 bg-muted/20 border-t">
            <div className="bg-safe/5 rounded-lg p-3 border border-safe/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-safe" />
                <span className="text-[10px] font-medium text-safe-foreground">Your next consultation is in 2 days</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorAppointments;
