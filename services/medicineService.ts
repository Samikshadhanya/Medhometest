import type { Medicine, MedicineInput } from '@/lib/types';
import { apiRequest } from '@/services/apiClient';

type CreateMedicinePayload = MedicineInput & {
  householdId: string;
  assignedToMemberId?: string;
};

export async function fetchMedicines(householdId: string) {
  return apiRequest<{ medicines: Medicine[] }>(`/api/medicines?householdId=${encodeURIComponent(householdId)}`);
}

export async function createMedicine(medicine: CreateMedicinePayload) {
  return apiRequest<{ medicine: Medicine }>('/api/medicines', {
    method: 'POST',
    body: medicine,
  });
}

export async function updateMedicine(id: string, medicine: Partial<MedicineInput>) {
  return apiRequest<{ medicine: Medicine }>(`/api/medicines/${id}`, {
    method: 'PATCH',
    body: medicine,
  });
}

export async function deleteMedicine(id: string) {
  return apiRequest<{ ok: true }>(`/api/medicines/${id}`, {
    method: 'DELETE',
  });
}
