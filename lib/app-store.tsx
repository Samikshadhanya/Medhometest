'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialState } from '@/lib/initial-data';
import type { AppState, AppUser, Caregiver, FamilyMember, Medicine, MedicineInput, MemberInput, ReminderInput, ReminderLog } from '@/lib/types';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, setDoc, updateDoc, deleteDoc, getDoc, addDoc } from 'firebase/firestore';

export type { AppState, AppUser, Caregiver, FamilyMember, Medicine, MedicineInput, MemberInput, ReminderInput, ReminderLog };

type AppStore = AppState & {
  loading: boolean;
  signIn: (provider: AppUser['authProvider'], email?: string, name?: string, age?: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
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

const daysUntil = (date: string) => {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          // Add a strict 3-second timeout so the loading screen doesn't hang indefinitely if Firestore connection fails
          const userDoc = await Promise.race([
            getDoc(userDocRef),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firestore connection timeout')), 3000))
          ]) as import('firebase/firestore').DocumentSnapshot;
          
          let currentUser: AppUser;
          if (userDoc.exists()) {
            currentUser = userDoc.data() as AppUser;
          } else {
            currentUser = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: 'Host',
              authProvider: 'google',
              household: 'My Family',
              households: ['My Family'],
              calendarConnected: false,
            };
            try {
              await setDoc(userDocRef, currentUser);
            } catch (e) {
              console.warn("Could not create user doc (likely offline or missing permissions)", e);
            }
          }
          setState((s) => ({ ...s, user: currentUser }));
        } catch (error: any) {
          console.warn("Auth state fallback triggered (client offline or permissions missing):", error?.message);
          // Fallback so the app doesn't hang indefinitely
          const fallbackUser: AppUser = {
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: 'Host',
            authProvider: 'google',
            household: 'My Family',
            households: ['My Family'],
            calendarConnected: false,
          };
          setState((s) => ({ ...s, user: fallbackUser }));
        }
        setLoading(false);
      } else {
        setState(initialState);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listeners for data when user and household are available
  useEffect(() => {
    if (!state.user?.household) return;
    
    const household = state.user.household;

    const handleError = (error: any) => {
      console.warn("Firestore subscription fallback (client offline or permissions missing):", error?.message);
      setLoading(false);
    };

    const unsubMedicines = onSnapshot(query(collection(db, 'medicines'), where('household', '==', household)), (snap) => {
      setState((s) => ({ ...s, medicines: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Medicine)) }));
    }, handleError);
    
    const unsubMembers = onSnapshot(query(collection(db, 'members'), where('household', '==', household)), (snap) => {
      setState((s) => ({ ...s, members: snap.docs.map((d) => ({ id: d.id, ...d.data() } as FamilyMember)) }));
    }, handleError);
    
    const unsubReminders = onSnapshot(query(collection(db, 'reminders'), where('household', '==', household)), (snap) => {
      setState((s) => ({ ...s, reminderLogs: snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReminderLog)) }));
    }, handleError);

    const unsubCaregivers = onSnapshot(query(collection(db, 'caregivers'), where('household', '==', household)), (snap) => {
      setState((s) => ({ ...s, caregivers: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Caregiver)) }));
    }, handleError);

    return () => {
      unsubMedicines();
      unsubMembers();
      unsubReminders();
      unsubCaregivers();
    };
  }, [state.user?.household]);

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

    const household = state.user?.household;

    return {
      ...state,
      loading,
      lowStockMedicines,
      expiringMedicines,
      duplicateMedicines,
      purchaseList: lowStockMedicines,
      todayReminders: state.reminderLogs,
      calendarUrlForMedicine,
      signIn: async (provider, email, name, age, role) => {
        if (provider === 'google') {
          const res = await signInWithPopup(auth, googleProvider);
          try {
            const userDocRef = doc(db, 'users', res.user.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              await setDoc(userDocRef, {
                name: res.user.displayName || 'User',
                email: res.user.email || '',
                role: 'Host',
                authProvider: 'google',
                household: 'My Family',
                households: ['My Family'],
                calendarConnected: false,
              });
            }
          } catch (e) {
            console.warn("Could not sync new user to Firestore (likely rules missing), proceeding with auth:", e);
          }
        } else if (provider === 'guest') {
          // For browser-use testing: mock a local user session so the dashboard loads and data can be added locally
          setState((s) => ({
            ...s,
            user: {
              name: name || 'Guest User',
              email: email || 'guest@test.com',
              role: role || 'Host',
              authProvider: 'guest',
              household: 'Test Family',
              households: ['Test Family'],
              calendarConnected: false,
            }
          }));
        }
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
      switchHousehold: async (newHousehold) => {
        if (!auth.currentUser) return;
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { household: newHousehold });
      },
      addHousehold: async (newHousehold) => {
        if (!auth.currentUser) return;
        const currentHouseholds = state.user.households || [state.user.household];
        if (!currentHouseholds.includes(newHousehold)) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            households: [...currentHouseholds, newHousehold],
            household: newHousehold,
          });
        }
      },
      addMedicine: async (medicine) => {
        await addDoc(collection(db, 'medicines'), { ...medicine, household });
      },
      updateMedicine: async (id, medicine) => {
        await updateDoc(doc(db, 'medicines', id), medicine);
      },
      deleteMedicine: async (id) => {
        await deleteDoc(doc(db, 'medicines', id));
      },
      addMember: async (member) => {
        await addDoc(collection(db, 'members'), { ...member, household });
      },
      updateMember: async (id, member) => {
        await updateDoc(doc(db, 'members', id), member);
      },
      addReminder: async (reminder) => {
        await addDoc(collection(db, 'reminders'), { ...reminder, household });
      },
      deleteReminder: async (id) => {
        await deleteDoc(doc(db, 'reminders', id));
      },
      markDose: async (id, status) => {
        await updateDoc(doc(db, 'reminders', id), { 
          status, 
          takenAt: status === 'taken' ? new Date().toISOString() : null 
        });
      },
      addCaregiver: async (caregiver) => {
        await addDoc(collection(db, 'caregivers'), { ...caregiver, status: 'Active', household });
      },
      removeCaregiver: async (id) => {
        await deleteDoc(doc(db, 'caregivers', id));
      },
      getMember: (id) => state.members.find((member) => member.id === id),
    };
  }, [loading, state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center text-sm font-medium text-slate-600">
        Loading MedHome...
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used inside AppProvider');
  return context;
}
