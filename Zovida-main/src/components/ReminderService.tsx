import { useEffect } from 'react';
import { useReminderStore } from '@/store/reminderStore';
import { toast } from 'sonner';

const ReminderService = () => {
  const { reminders } = useReminderStore();

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;
      
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

      reminders.forEach(reminder => {
        if (reminder.isActive && reminder.time === currentTime && reminder.days.includes(currentDay)) {
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Zovida Medicine Reminder', {
              body: `It's time to take ${reminder.medicineName} (${reminder.dosage})`,
              icon: '/favicon.ico'
            });
          }
          
          // Also show a toast
          toast.info(`Medicine Reminder: ${reminder.medicineName}`, {
            description: `Dosage: ${reminder.dosage}`,
            duration: 10000,
          });
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders]);

  return null;
};

export default ReminderService;
