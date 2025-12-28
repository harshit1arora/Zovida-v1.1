import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface AppointmentStore {
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: string) => void;
}

export const useAppointmentStore = create<AppointmentStore>()(
  persist(
    (set) => ({
      appointments: [],
      addAppointment: (appointment) => set((state) => ({
        appointments: [
          ...state.appointments,
          {
            ...appointment,
            id: Math.random().toString(36).substring(7),
            status: 'upcoming' as const,
          },
        ].sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()),
      })),
      cancelAppointment: (id) => set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? { ...a, status: 'cancelled' } : a
        ),
      })),
    }),
    {
      name: 'zovida-appointments',
    }
  )
);
