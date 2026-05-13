import type { Caregiver } from '@/lib/types';
import { apiRequest } from '@/services/apiClient';

type CreateCaregiverPayload = Omit<Caregiver, 'id'> & {
  householdId: string;
};

export async function fetchCaregivers(householdId: string) {
  return apiRequest<{ caregivers: Caregiver[] }>(`/api/caregivers?householdId=${encodeURIComponent(householdId)}`);
}

export async function createCaregiver(caregiver: CreateCaregiverPayload) {
  return apiRequest<{ caregiver: Caregiver }>('/api/caregivers', {
    method: 'POST',
    body: caregiver,
  });
}

export async function deleteCaregiver(id: string) {
  return apiRequest<{ ok: true }>(`/api/caregivers/${id}`, {
    method: 'DELETE',
  });
}
