import { useState, useEffect } from 'react';
import { useReminderStore, Reminder } from '@/store/reminderStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  Pill,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const MedicineReminders = () => {
  const { reminders, removeReminder, toggleReminder, addReminder, initReminders } = useReminderStore();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    initReminders();
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Notification permission denied.");
      }
    }
  };

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Bell size={16} />
          </div>
          <div>
            <CardTitle className="text-base">Medicine Schedule</CardTitle>
            <p className="text-[10px] text-muted-foreground">Stay on track with your health</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full h-8 w-8 p-0"
          onClick={() => handleRequestPermission()}
          title="Enable Notifications"
        >
          <Bell size={14} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {reminders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center space-y-3"
              >
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Clock size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">No active reminders</p>
                  <p className="text-xs text-muted-foreground">Your medication schedule will appear here.</p>
                </div>
              </motion.div>
            ) : (
              reminders.map((reminder) => (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      reminder.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <Pill size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <p className={cn(
                        "font-semibold text-xs",
                        !reminder.isActive && "text-muted-foreground line-through"
                      )}>
                        {reminder.medicineName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Clock size={10} />
                          {reminder.time}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          {reminder.days.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={reminder.isActive}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        removeReminder(reminder.id);
                        toast.success("Reminder removed");
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        
        {reminders.length > 0 && (
          <div className="p-3 bg-muted/20 border-t">
            <div className="bg-white rounded-lg p-3 border border-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-primary" />
                <span className="text-[10px] font-medium">Next dose: Aspirin at 8:00 PM</span>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper for class merging if not globally available
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default MedicineReminders;
