import type { Household, UserProfile } from '@/lib/types';
import { apiRequest } from '@/services/apiClient';

export async function fetchUserProfile() {
  return apiRequest<{
    profile: UserProfile;
    household: Household | null;
    households: Household[];
    familyMembers: import('@/lib/types').FamilyMember[];
  }>('/api/users/profile');
}

export async function createHousehold(name: string) {
  return apiRequest<{ household: Household }>('/api/households', {
    method: 'POST',
    body: { name },
  });
}

export async function getHousehold(id: string) {
  return apiRequest<{ household: Household }>(`/api/households/${id}`);
}

export async function setActiveHousehold(activeHouseholdId: string) {
  return apiRequest<{ ok: true }>('/api/users/profile', {
    method: 'PATCH',
    body: { activeHouseholdId },
  });
}
