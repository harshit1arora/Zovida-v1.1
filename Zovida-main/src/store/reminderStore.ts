import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { endpoints } from '@/lib/api';

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  days: string[];
  isActive: boolean;
}

interface ReminderStore {
  reminders: Reminder[];
  initReminders: () => Promise<void>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'isActive'>) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],
      initReminders: async () => {
        const userId = localStorage.getItem('zovida_user_id');
        if (!userId) return;
        
        try {
          const response = await fetch(endpoints.reminders.get(userId));
          if (response.ok) {
            const data = await response.json();
            set({ reminders: data });
          }
        } catch (error) {
          console.error('Error fetching reminders:', error);
        }
      },
      addReminder: async (reminder) => {
        const userId = localStorage.getItem('zovida_user_id');
        if (!userId) {
          // Fallback for non-logged in users
          set((state) => ({
            reminders: [
              ...state.reminders,
              {
                ...reminder,
                id: Math.random().toString(36).substring(7),
                isActive: true,
              },
            ],
          }));
          return;
        }

        try {
          const response = await fetch(endpoints.reminders.create, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              medicine_name: reminder.medicineName,
              dosage: reminder.dosage,
              time: reminder.time,
              days: reminder.days,
              user_id: parseInt(userId)
            }),
          });
          if (response.ok) {
            const data = await response.json();
            set((state) => ({
              reminders: [
                ...state.reminders,
                { ...reminder, id: data.id.toString(), isActive: true },
              ],
            }));
          } else {
            const errorData = await response.json();
            console.error('Failed to add reminder:', errorData);
          }
        } catch (error) {
          console.error('Error adding reminder:', error);
        }
      },
      removeReminder: async (id) => {
        const userId = localStorage.getItem('zovida_user_id');
        if (userId && !isNaN(parseInt(id))) {
          try {
            await fetch(endpoints.reminders.delete(id), { method: 'DELETE' });
          } catch (error) {
            console.error('Error deleting reminder:', error);
          }
        }
        
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        }));
      },
      toggleReminder: async (id) => {
        const reminder = get().reminders.find((r) => r.id === id);
        if (!reminder) return;

        const userId = localStorage.getItem('zovida_user_id');
        if (userId && !isNaN(parseInt(id))) {
          try {
            await fetch(endpoints.reminders.update(id), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ is_active: !reminder.isActive }),
            });
          } catch (error) {
            console.error('Error toggling reminder:', error);
          }
        }

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isActive: !r.isActive } : r
          ),
        }));
      },
      updateReminder: async (id, updates) => {
        const userId = localStorage.getItem('zovida_user_id');
        if (userId && !isNaN(parseInt(id))) {
          try {
            // Map frontend field names to backend if necessary
            const backendUpdates: any = { ...updates };
            if (updates.medicineName) {
              backendUpdates.medicine_name = updates.medicineName;
              delete backendUpdates.medicineName;
            }
            if (updates.isActive !== undefined) {
              backendUpdates.is_active = updates.isActive;
              delete backendUpdates.isActive;
            }

            await fetch(endpoints.reminders.update(id), {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(backendUpdates),
            });
          } catch (error) {
            console.error('Error updating reminder:', error);
          }
        }

        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
    }),
    {
      name: 'zovida-reminders',
    }
  )
);
