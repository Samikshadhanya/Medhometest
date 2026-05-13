import type { AppState } from './types';

export const medicineImage =
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?w=200&h=200&fit=crop';

export const initialState: AppState = {
  user: {
    name: '',
    email: '',
    role: 'Host',
    authProvider: 'email',
    household: '',
    households: [],
    calendarConnected: false,
  },
  members: [],
  medicines: [],
  reminderLogs: [],
  caregivers: [],
};
