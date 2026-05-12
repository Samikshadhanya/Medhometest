import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { initialState, medicineImage } from '@/lib/initial-data';
import type { AppState, AppUser, Caregiver, FamilyMember, Medicine, MedicineInput, MemberInput, ReminderInput, ReminderLog } from '@/lib/types';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'medhome-db.json');

type Database = {
  state: AppState;
};

const cloneInitialState = (): AppState => JSON.parse(JSON.stringify(initialState)) as AppState;

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const reminderLogsForMedicine = (medicine: Medicine): ReminderLog[] =>
  medicine.reminderTimes.map((time) => ({
    id: makeId('dose'),
    medicineId: medicine.id,
    memberId: medicine.assignedToId,
    time,
    status: 'upcoming',
  }));

async function ensureDb(): Promise<Database> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(dbPath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Database>;
    return { state: { ...cloneInitialState(), ...parsed.state } };
  } catch {
    const db = { state: cloneInitialState() };
    await writeDb(db);
    return db;
  }
}

async function writeDb(db: Database) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

async function updateState(updater: (state: AppState) => AppState): Promise<AppState> {
  const db = await ensureDb();
  db.state = updater(db.state);
  await writeDb(db);
  return db.state;
}

export async function getState() {
  return (await ensureDb()).state;
}

export async function setSignedInUser(provider: AppUser['authProvider'], email?: string, name?: string) {
  return updateState((state) => ({
    ...state,
    user: {
      ...state.user,
      authProvider: provider,
      email: email || state.user.email,
      name: name || (provider === 'guest' ? 'Guest User' : state.user.name),
    },
  }));
}

export async function signOutUser() {
  return updateState((state) => ({
    ...state,
    user: { ...initialState.user, calendarConnected: state.user.calendarConnected },
  }));
}

export async function setCalendarConnected(calendarConnected: boolean) {
  return updateState((state) => ({ ...state, user: { ...state.user, calendarConnected } }));
}

export async function addMedicine(medicine: MedicineInput) {
  return updateState((state) => {
    const nextMedicine: Medicine = { ...medicine, id: makeId('med'), image: medicine.image || medicineImage };
    return {
      ...state,
      medicines: [...state.medicines, nextMedicine],
      reminderLogs: [...state.reminderLogs, ...reminderLogsForMedicine(nextMedicine)],
    };
  });
}

export async function updateMedicine(id: string, medicine: Partial<MedicineInput>) {
  return updateState((state) => {
    const previous = state.medicines.find((item) => item.id === id);
    const medicines = state.medicines.map((item) => (item.id === id ? { ...item, ...medicine } : item));
    const updated = medicines.find((item) => item.id === id);
    const scheduleChanged =
      updated &&
      previous &&
      (medicine.assignedToId !== undefined || medicine.reminderTimes !== undefined) &&
      (previous.assignedToId !== updated.assignedToId || previous.reminderTimes.join('|') !== updated.reminderTimes.join('|'));

    return {
      ...state,
      medicines,
      reminderLogs: scheduleChanged
        ? [...state.reminderLogs.filter((item) => item.medicineId !== id), ...reminderLogsForMedicine(updated)]
        : state.reminderLogs,
    };
  });
}

export async function deleteMedicine(id: string) {
  return updateState((state) => ({
    ...state,
    medicines: state.medicines.filter((medicine) => medicine.id !== id),
    reminderLogs: state.reminderLogs.filter((reminder) => reminder.medicineId !== id),
  }));
}

export async function addMember(member: MemberInput) {
  return updateState((state) => {
    const nextMember: FamilyMember = {
      ...member,
      id: makeId('member'),
      image: member.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop',
    };
    return { ...state, members: [...state.members, nextMember] };
  });
}

export async function updateMember(id: string, member: Partial<MemberInput>) {
  return updateState((state) => ({
    ...state,
    members: state.members.map((item) => (item.id === id ? { ...item, ...member } : item)),
  }));
}

export async function markDose(id: string, status: ReminderLog['status']) {
  return updateState((state) => {
    const reminder = state.reminderLogs.find((item) => item.id === id);
    const shouldReduceStock = reminder && reminder.status !== 'taken' && status === 'taken';

    return {
      ...state,
      reminderLogs: state.reminderLogs.map((item) => (item.id === id ? { ...item, status } : item)),
      medicines: shouldReduceStock
        ? state.medicines.map((medicine) =>
            medicine.id === reminder.medicineId ? { ...medicine, quantity: Math.max(0, medicine.quantity - 1) } : medicine,
          )
        : state.medicines,
    };
  });
}

export async function addReminder(reminder: ReminderInput) {
  return updateState((state) => ({
    ...state,
    reminderLogs: [
      ...state.reminderLogs,
      {
        ...reminder,
        id: makeId('dose'),
        status: reminder.status || 'upcoming',
      },
    ],
  }));
}

export async function deleteReminder(id: string) {
  return updateState((state) => ({
    ...state,
    reminderLogs: state.reminderLogs.filter((reminder) => reminder.id !== id),
  }));
}

export async function addCaregiver(caregiver: Omit<Caregiver, 'id' | 'status'>) {
  return updateState((state) => ({
    ...state,
    caregivers: [...state.caregivers, { ...caregiver, id: makeId('care'), status: 'Invited' }],
  }));
}

export async function removeCaregiver(id: string) {
  return updateState((state) => ({
    ...state,
    caregivers: state.caregivers.filter((item) => item.id !== id),
  }));
}
