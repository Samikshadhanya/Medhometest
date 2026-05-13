'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { initialState, medicineImage } from '@/lib/initial-data';
import type { AppState, AppUser, Caregiver, FamilyMember, Household, Medicine, MedicineInput, MemberInput, ReminderInput, ReminderLog } from '@/lib/types';
import { auth, db, googleProvider } from '@/lib/firebase';
import { createHousehold, fetchUserProfile } from '@/services/householdService';
import { createMedicine, deleteMedicine as deleteMedicineRequest, fetchMedicines, updateMedicine as updateMedicineRequest } from '@/services/medicineService';
import { createReminder, deleteReminder as deleteReminderRequest, fetchReminders, updateReminder as updateReminderRequest } from '@/services/reminderService';

export type { AppState, AppUser, Caregiver, FamilyMember, Medicine, MedicineInput, MemberInput, ReminderInput, ReminderLog };

type AppStore = AppState & {
  loading: boolean;
  error: string | null;
  signIn: (provider: AppUser['authProvider'], email?: string, name?: string, age?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshHouseholdData: () => Promise<void>;
  addMedicine: (medicine: MedicineInput) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<MedicineInput>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  addMember: (member: MemberInput) => Promise<void>;
  updateMember: (id: string, member: Partial<MemberInput>) => Promise<void>;
  addReminder: (reminder: ReminderInput) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  markDose: (id: string, status: ReminderLog['status']) => Promise<void>;
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'status'>) => Promise<void>;
  removeCaregiver: (id: string) => Promise<void>;
  getMember: (id: string) => FamilyMember | undefined;
  switchHousehold: (household: string) => Promise<void>;
  addHousehold: (household: string) => Promise<void>;
  lowStockMedicines: Medicine[];
  expiringMedicines: Medicine[];
  duplicateMedicines: Medicine[];
  purchaseList: Medicine[];
  todayReminders: ReminderLog[];
  calendarUrlForMedicine: (medicine: Medicine) => string;
};

const AppContext = createContext<AppStore | null>(null);

const localProviders = new Set<AppUser['authProvider']>(['email', 'guest']);

const newLocalId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const daysUntil = (date: string) => {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

const userFromProfile = (
  profile: Awaited<ReturnType<typeof fetchUserProfile>>['profile'],
  household: Household | null,
  households: Household[] = [],
): AppUser => ({
  uid: profile.uid,
  name: profile.name || profile.email.split('@')[0] || 'User',
  email: profile.email,
  photoURL: profile.photoURL,
  role: profile.role || 'Host',
  authProvider: profile.authProvider || 'google',
  household: household?.name || 'My Family',
  householdId: household?.id || profile.activeHouseholdId || profile.householdIds[0],
  households: households.length ? households.map((item) => item.name) : household ? [household.name] : [],
  householdIds: households.length ? households.map((item) => item.id) : profile.householdIds,
  calendarConnected: profile.calendarConnected,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHouseholdData = useCallback(async (householdId?: string) => {
    if (!householdId || !auth.currentUser) return;

    const [medicineResult, reminderResult] = await Promise.all([
      fetchMedicines(householdId),
      fetchReminders({ householdId }),
    ]);

    setState((current) => ({
      ...current,
      medicines: medicineResult.medicines,
      reminderLogs: reminderResult.reminders,
    }));
  }, []);

  const loadAuthenticatedUser = useCallback(async () => {
    const bundle = await fetchUserProfile();
    const appUser = userFromProfile(bundle.profile, bundle.household, bundle.households);

    setState((current) => ({
      ...current,
      user: appUser,
      members: bundle.familyMembers,
    }));

    await loadHouseholdData(appUser.householdId);
  }, [loadHouseholdData]);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      setLoading(false);
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      window.clearTimeout(fallbackTimer);
      setError(null);

      if (!firebaseUser) {
        setState(initialState);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await loadAuthenticatedUser();
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load your MedHome data.';
        setError(message);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [loadAuthenticatedUser]);

  const refreshHouseholdData = useCallback(async () => {
    if (!state.user.householdId || localProviders.has(state.user.authProvider)) return;
    setError(null);

    try {
      await loadHouseholdData(state.user.householdId);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh household data.');
    }
  }, [loadHouseholdData, state.user.authProvider, state.user.householdId]);

  const value = useMemo<AppStore>(() => {
    const lowStockMedicines = state.medicines.filter((medicine) => medicine.quantity <= medicine.lowStockAt);
    const expiringMedicines = state.medicines.filter((medicine) => daysUntil(medicine.expiryDate) <= 30);
    const duplicateMedicines = state.medicines.filter((medicine, index, all) =>
      all.findIndex((item) => item.name.toLowerCase() === medicine.name.toLowerCase()) !== index,
    );

    const calendarUrlForMedicine = (medicine: Medicine) => {
      const member = state.members.find((item) => item.id === medicine.assignedToId);
      const title = encodeURIComponent(`Take ${medicine.name}`);
      const details = encodeURIComponent(`${medicine.dosage}, ${medicine.mealInstruction}. For ${member?.name ?? 'family member'}.`);
      const firstTime = medicine.reminderTimes[0] || '09:00';
      const [hours, minutes] = firstTime.split(':').map(Number);
      const start = new Date();
      start.setHours(hours || 9, minutes || 0, 0, 0);
      const end = new Date(start.getTime() + 15 * 60 * 1000);
      const formatDate = (date: Date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formatDate(start)}/${formatDate(end)}`;
    };

    const householdId = state.user.householdId;
    const isLocalSession = !auth.currentUser || localProviders.has(state.user.authProvider);

    return {
      ...state,
      loading,
      error,
      lowStockMedicines,
      expiringMedicines,
      duplicateMedicines,
      purchaseList: lowStockMedicines,
      todayReminders: state.reminderLogs,
      calendarUrlForMedicine,
      refreshHouseholdData,
      signIn: async (provider, email, name, age, role) => {
        setError(null);

        if (provider === 'google') {
          await signInWithPopup(auth, googleProvider);
          await loadAuthenticatedUser();
          return;
        }

        const fallbackName = provider === 'guest' ? name || 'Guest User' : email?.split('@')[0] || 'Demo User';
        const memberId = newLocalId('member');
        setState({
          ...initialState,
          user: {
            uid: newLocalId('local-user'),
            name: fallbackName,
            email: email || '',
            role: role || 'Host',
            authProvider: provider,
            household: provider === 'guest' ? 'Guest Household' : 'Local Household',
            householdId: newLocalId('local-household'),
            households: [provider === 'guest' ? 'Guest Household' : 'Local Household'],
            householdIds: [],
            calendarConnected: false,
          },
          members: provider === 'guest'
            ? [{
                id: memberId,
                name: fallbackName,
                role: role || 'Family Member',
                age: age || 'Unspecified',
                gender: 'Unspecified',
                image: `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0f766e&color=fff`,
                healthNotes: [],
                knownAllergies: 'None known',
              }]
            : [],
        });
      },
      signOut: async () => {
        if (auth.currentUser) {
          await firebaseSignOut(auth);
        }
        setState(initialState);
      },
      switchHousehold: async (newHousehold) => {
        const index = state.user.households?.findIndex((name) => name === newHousehold) ?? -1;
        const nextHouseholdId = index >= 0 ? state.user.householdIds?.[index] : undefined;
        setState((current) => ({ ...current, user: { ...current.user, household: newHousehold, householdId: nextHouseholdId || current.user.householdId } }));
        if (nextHouseholdId && !isLocalSession) await loadHouseholdData(nextHouseholdId);
      },
      addHousehold: async (newHousehold) => {
        if (isLocalSession) {
          setState((current) => ({
            ...current,
            user: {
              ...current.user,
              household: newHousehold,
              householdId: newLocalId('local-household'),
              households: [...(current.user.households || []), newHousehold],
            },
          }));
          return;
        }

        const result = await createHousehold(newHousehold);
        const bundle = await fetchUserProfile();
        const appUser = userFromProfile(bundle.profile, result.household, bundle.households);
        setState((current) => ({
          ...current,
          user: appUser,
          members: bundle.familyMembers,
          medicines: [],
          reminderLogs: [],
        }));
      },
      addMedicine: async (medicine) => {
        const reminderTimes = medicine.reminderTimes.filter(Boolean);

        if (isLocalSession) {
          const id = newLocalId('med');
          const newMedicine: Medicine = { ...medicine, reminderTimes, id, image: medicine.image || medicineImage, householdId };
          const newReminders: ReminderLog[] = reminderTimes.map((time) => ({
            id: newLocalId('reminder'),
            householdId,
            medicineId: id,
            memberId: medicine.assignedToId,
            time,
            status: 'upcoming',
          }));
          setState((current) => ({
            ...current,
            medicines: [...current.medicines, newMedicine],
            reminderLogs: [...current.reminderLogs, ...newReminders],
          }));
          return;
        }

        if (!householdId) throw new Error('No active household selected.');
        const result = await createMedicine({ ...medicine, householdId, assignedToMemberId: medicine.assignedToId, reminderTimes });
        setState((current) => ({ ...current, medicines: [...current.medicines, result.medicine] }));
        await loadHouseholdData(householdId);
      },
      updateMedicine: async (id, medicine) => {
        if (isLocalSession) {
          setState((current) => ({ ...current, medicines: current.medicines.map((item) => item.id === id ? { ...item, ...medicine } : item) }));
          return;
        }

        const result = await updateMedicineRequest(id, medicine);
        setState((current) => ({ ...current, medicines: current.medicines.map((item) => item.id === id ? result.medicine : item) }));
      },
      deleteMedicine: async (id) => {
        if (isLocalSession) {
          setState((current) => ({
            ...current,
            medicines: current.medicines.filter((item) => item.id !== id),
            reminderLogs: current.reminderLogs.filter((item) => item.medicineId !== id),
          }));
          return;
        }

        await deleteMedicineRequest(id);
        setState((current) => ({
          ...current,
          medicines: current.medicines.filter((item) => item.id !== id),
          reminderLogs: current.reminderLogs.filter((item) => item.medicineId !== id),
        }));
      },
      addMember: async (member) => {
        const nextMember = {
          ...member,
          householdId,
          image: member.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0f766e&color=fff`,
        };

        if (isLocalSession) {
          setState((current) => ({ ...current, members: [...current.members, { ...nextMember, id: newLocalId('member') }] }));
          return;
        }

        const docRef = await addDoc(collection(db, 'members'), nextMember);
        setState((current) => ({ ...current, members: [...current.members, { ...nextMember, id: docRef.id }] }));
      },
      updateMember: async (id, member) => {
        if (isLocalSession) {
          setState((current) => ({ ...current, members: current.members.map((item) => item.id === id ? { ...item, ...member } : item) }));
          return;
        }

        await updateDoc(doc(db, 'members', id), member);
        setState((current) => ({ ...current, members: current.members.map((item) => item.id === id ? { ...item, ...member } : item) }));
      },
      addReminder: async (reminder) => {
        if (isLocalSession) {
          setState((current) => ({
            ...current,
            reminderLogs: [...current.reminderLogs, { ...reminder, id: newLocalId('reminder'), householdId, status: reminder.status || 'upcoming' }],
          }));
          return;
        }

        if (!householdId) throw new Error('No active household selected.');
        const result = await createReminder({ ...reminder, householdId, userId: state.user.uid });
        setState((current) => ({ ...current, reminderLogs: [...current.reminderLogs, result.reminder] }));
      },
      deleteReminder: async (id) => {
        if (isLocalSession) {
          setState((current) => ({ ...current, reminderLogs: current.reminderLogs.filter((item) => item.id !== id) }));
          return;
        }

        await deleteReminderRequest(id);
        setState((current) => ({ ...current, reminderLogs: current.reminderLogs.filter((item) => item.id !== id) }));
      },
      markDose: async (id, status) => {
        const takenAt = status === 'taken' ? new Date().toISOString() : undefined;

        if (isLocalSession) {
          setState((current) => ({
            ...current,
            reminderLogs: current.reminderLogs.map((item) => item.id === id ? { ...item, status, takenAt } : item),
          }));
          return;
        }

        const result = await updateReminderRequest(id, { status, takenAt });
        setState((current) => ({ ...current, reminderLogs: current.reminderLogs.map((item) => item.id === id ? result.reminder : item) }));
      },
      addCaregiver: async (caregiver) => {
        if (isLocalSession) {
          setState((current) => ({ ...current, caregivers: [...current.caregivers, { ...caregiver, id: newLocalId('caregiver'), status: 'Active' }] }));
          return;
        }

        const docRef = await addDoc(collection(db, 'caregivers'), { ...caregiver, householdId, status: 'Active' });
        setState((current) => ({ ...current, caregivers: [...current.caregivers, { ...caregiver, id: docRef.id, status: 'Active' }] }));
      },
      removeCaregiver: async (id) => {
        if (isLocalSession) {
          setState((current) => ({ ...current, caregivers: current.caregivers.filter((item) => item.id !== id) }));
          return;
        }

        await deleteDoc(doc(db, 'caregivers', id));
        setState((current) => ({ ...current, caregivers: current.caregivers.filter((item) => item.id !== id) }));
      },
      getMember: (id) => state.members.find((member) => member.id === id),
    };
  }, [error, loadAuthenticatedUser, loadHouseholdData, loading, refreshHouseholdData, state]);

  useEffect(() => {
    if (!state.user.householdId || localProviders.has(state.user.authProvider)) return;

    let cancelled = false;

    async function loadSecondaryCollections() {
      try {
        const [membersSnapshot, caregiversSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'members'), where('householdId', '==', state.user.householdId))),
          getDocs(query(collection(db, 'caregivers'), where('householdId', '==', state.user.householdId))),
        ]);

        if (cancelled) return;

        setState((current) => ({
          ...current,
          members: membersSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as FamilyMember)),
          caregivers: caregiversSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Caregiver)),
        }));
      } catch (secondaryError) {
        setError(secondaryError instanceof Error ? secondaryError.message : 'Failed to load household members.');
      }
    }

    loadSecondaryCollections();

    return () => {
      cancelled = true;
    };
  }, [state.user.authProvider, state.user.householdId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center text-sm font-medium text-slate-600">
        Loading MedHome...
      </div>
    );
  }

  return (
    <AppContext.Provider value={value}>
      {error && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used inside AppProvider');
  return context;
}
