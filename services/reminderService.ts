import type { Medicine, ReminderInput, ReminderLog } from '@/lib/types';
import { apiRequest } from '@/services/apiClient';

type CreateReminderPayload = ReminderInput & {
  householdId: string;
  userId?: string;
};

export async function fetchReminders(params: { userId?: string; householdId?: string }) {
  const search = new URLSearchParams();
  if (params.userId) search.set('userId', params.userId);
  if (params.householdId) search.set('householdId', params.householdId);

  return apiRequest<{ reminders: ReminderLog[] }>(`/api/reminders?${search.toString()}`);
}

export async function createReminder(reminder: CreateReminderPayload) {
  return apiRequest<{ reminder: ReminderLog }>('/api/reminders', {
    method: 'POST',
    body: reminder,
  });
}

export async function updateReminder(id: string, reminder: Partial<ReminderLog>) {
  return apiRequest<{ reminder: ReminderLog; medicine?: Medicine }>(`/api/reminders/${id}`, {
    method: 'PATCH',
    body: reminder,
  });
}

export async function deleteReminder(id: string) {
  return apiRequest<{ ok: true }>(`/api/reminders/${id}`, {
    method: 'DELETE',
  });
}
