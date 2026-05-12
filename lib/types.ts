export type FamilyMember = {
  id: string;
  name: string;
  role: string;
  age: number;
  gender: string;
  image: string;
  healthNotes: string[];
  knownAllergies: string;
};

export type Medicine = {
  id: string;
  name: string;
  category: string;
  strength: string;
  type: string;
  quantity: number;
  unit: string;
  assignedToId: string;
  expiryDate: string;
  manufactureDate?: string;
  pharmaName?: string;
  use: string;
  dosage: string;
  mealInstruction: string;
  reminderTimes: string[];
  lowStockAt: number;
  image: string;
};

export type ReminderLog = {
  id: string;
  medicineId: string;
  memberId: string;
  time: string;
  status: 'taken' | 'missed' | 'upcoming';
  takenAt?: string;
};

export type ReminderInput = Omit<ReminderLog, 'id' | 'status'> & {
  status?: ReminderLog['status'];
};

export type Caregiver = {
  id: string;
  name: string;
  relationship: string;
  accessLevel: string;
  status: 'Active' | 'Invited';
};

export type AppUser = {
  name: string;
  email: string;
  role: string;
  authProvider: 'email' | 'google' | 'microsoft' | 'facebook' | 'guest';
  household: string;
  calendarConnected: boolean;
};

export type AppState = {
  user: AppUser;
  members: FamilyMember[];
  medicines: Medicine[];
  reminderLogs: ReminderLog[];
  caregivers: Caregiver[];
};

export type MedicineInput = Omit<Medicine, 'id' | 'image'> & { image?: string };
export type MemberInput = Omit<FamilyMember, 'id' | 'image'> & { image?: string };
