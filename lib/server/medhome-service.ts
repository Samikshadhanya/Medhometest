import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { medicineImage } from '@/lib/initial-data';
import { adminDb } from '@/lib/firebase-admin';
import { ApiError } from '@/lib/server/api';
import type { Caregiver, FamilyMember, Household, Medicine, ReminderDocument, ReminderLog, UserProfile } from '@/lib/types';

const householdSchema = z.object({
  name: z.string().trim().min(1, 'Household name is required.').max(120),
});

const medicineSchema = z.object({
  householdId: z.string().trim().min(1, 'householdId is required.'),
  name: z.string().trim().min(1, 'Medicine name is required.').max(160),
  category: z.string().trim().min(1),
  strength: z.string().trim().min(1),
  type: z.string().trim().min(1),
  quantity: z.number().int().min(0),
  unit: z.string().trim().min(1),
  assignedToUid: z.string().trim().optional(),
  assignedToMemberId: z.string().trim().optional(),
  expiryDate: z.string().trim().min(1),
  manufactureDate: z.string().trim().optional(),
  pharmaName: z.string().trim().optional(),
  use: z.string().trim().min(1),
  dosage: z.string().trim().min(1),
  mealInstruction: z.string().trim().min(1),
  reminderTimes: z.array(z.string().trim().regex(/^\d{2}:\d{2}$/)).default([]),
  lowStockAt: z.number().int().min(0),
  image: z.string().trim().url().optional(),
});

const medicinePatchSchema = medicineSchema.partial().omit({ householdId: true });

const reminderSchema = z.object({
  householdId: z.string().trim().min(1, 'householdId is required.'),
  medicineId: z.string().trim().min(1, 'medicineId is required.'),
  memberId: z.string().trim().min(1, 'memberId is required.'),
  userId: z.string().trim().optional(),
  time: z.string().trim().regex(/^\d{2}:\d{2}$/),
  status: z.enum(['taken', 'missed', 'upcoming']).default('upcoming'),
});

const reminderPatchSchema = z.object({
  status: z.enum(['taken', 'missed', 'upcoming']).optional(),
  time: z.string().trim().regex(/^\d{2}:\d{2}$/).optional(),
  takenAt: z.string().datetime().nullable().optional(),
});

const caregiverSchema = z.object({
  householdId: z.string().trim().min(1, 'householdId is required.'),
  name: z.string().trim().min(1, 'Caregiver name is required.').max(120),
  relationship: z.string().trim().min(1).max(80),
  accessLevel: z.string().trim().min(1).max(80),
  status: z.enum(['Active', 'Invited']).default('Invited'),
});

const activeHouseholdSchema = z.object({
  activeHouseholdId: z.string().trim().min(1, 'activeHouseholdId is required.'),
});

type CreateHouseholdPayload = z.infer<typeof householdSchema>;
type CreateMedicinePayload = z.infer<typeof medicineSchema>;

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : undefined;
}

function serializeHousehold(id: string, data: FirebaseFirestore.DocumentData): Household {
  return {
    id,
    name: data.name,
    ownerUid: data.ownerUid,
    members: data.members || [],
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function serializeMedicine(id: string, data: FirebaseFirestore.DocumentData): Medicine {
  return {
    id,
    householdId: data.householdId,
    name: data.name,
    category: data.category,
    strength: data.strength,
    type: data.type,
    quantity: data.quantity,
    unit: data.unit,
    assignedToId: data.assignedToMemberId || data.assignedToId || data.assignedToUid || '',
    expiryDate: data.expiryDate,
    manufactureDate: data.manufactureDate,
    pharmaName: data.pharmaName,
    use: data.use,
    dosage: data.dosage,
    mealInstruction: data.mealInstruction,
    reminderTimes: data.reminderTimes || [],
    lowStockAt: data.lowStockAt,
    image: data.image || medicineImage,
  };
}

function serializeReminder(id: string, data: FirebaseFirestore.DocumentData): ReminderLog {
  return {
    id,
    householdId: data.householdId,
    medicineId: data.medicineId,
    memberId: data.memberId || data.assignedToMemberId || '',
    userId: data.userId || data.assignedToUid,
    time: data.time,
    status: data.status || 'upcoming',
    takenAt: toIso(data.takenAt),
  };
}

function serializeFamilyMember(id: string, data: FirebaseFirestore.DocumentData): FamilyMember {
  return {
    id,
    householdId: data.householdId,
    name: data.name || '',
    role: data.role || 'Family Member',
    age: data.age || 'Unspecified',
    gender: data.gender || 'Unspecified',
    image: data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'User')}&background=0f766e&color=fff`,
    healthNotes: data.healthNotes || [],
    knownAllergies: data.knownAllergies || 'None known',
  };
}

function serializeCaregiver(id: string, data: FirebaseFirestore.DocumentData): Caregiver {
  return {
    id,
    householdId: data.householdId,
    name: data.name || '',
    relationship: data.relationship || 'Caregiver',
    accessLevel: data.accessLevel || 'Reminder Access',
    status: data.status || 'Invited',
  };
}

function serializeUser(uid: string, data: FirebaseFirestore.DocumentData): UserProfile {
  return {
    uid,
    name: data.name || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    role: data.role || 'Member',
    authProvider: data.authProvider || 'email',
    activeHouseholdId: data.activeHouseholdId,
    householdIds: data.householdIds || [],
    calendarConnected: Boolean(data.calendarConnected),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function withoutUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}

async function assertHouseholdAccess(uid: string, householdId: string) {
  const householdRef = adminDb.collection('households').doc(householdId);
  const householdSnap = await householdRef.get();

  if (!householdSnap.exists) {
    throw new ApiError(404, 'Household not found.');
  }

  const household = householdSnap.data()!;
  const members = (household.members || []) as Array<{ uid: string }>;
  if (household.ownerUid !== uid && !members.some((member) => member.uid === uid)) {
    throw new ApiError(403, 'You do not have access to this household.');
  }

  return { ref: householdRef, household: serializeHousehold(householdSnap.id, household) };
}

export async function createHousehold(uid: string, payload: unknown) {
  const parsed = householdSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid household payload.');
  }

  const input: CreateHouseholdPayload = parsed.data;
  const householdRef = adminDb.collection('households').doc();
  const userRef = adminDb.collection('users').doc(uid);
  const memberRef = adminDb.collection('members').doc();
  const now = FieldValue.serverTimestamp();
  const userSnap = await userRef.get();
  const user = userSnap.data();

  await adminDb.runTransaction(async (transaction) => {
    transaction.set(householdRef, {
      name: input.name,
      ownerUid: uid,
      members: [{ uid, role: 'owner', joinedAt: new Date().toISOString() }],
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(memberRef, {
      householdId: householdRef.id,
      uid,
      name: user?.name || user?.email || 'Household owner',
      role: 'Host',
      age: 'Unspecified',
      gender: 'Unspecified',
      image: user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0f766e&color=fff`,
      healthNotes: [],
      knownAllergies: 'None known',
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(
      userRef,
      {
        householdIds: FieldValue.arrayUnion(householdRef.id),
        householdProfileIds: FieldValue.arrayUnion(memberRef.id),
        activeHouseholdId: householdRef.id,
        updatedAt: now,
        createdAt: now,
      },
      { merge: true },
    );
  });

  const created = await householdRef.get();
  return serializeHousehold(created.id, created.data()!);
}

export async function getUserProfile(uid: string, fallback: { email?: string; name?: string; photoURL?: string; provider?: string }) {
  const userRef = adminDb.collection('users').doc(uid);
  let userSnap = await userRef.get();

  if (!userSnap.exists) {
    const now = FieldValue.serverTimestamp();
    await userRef.set({
      name: fallback.name || fallback.email?.split('@')[0] || 'User',
      email: fallback.email || '',
      photoURL: fallback.photoURL || '',
      role: 'Host',
      authProvider: fallback.provider === 'google.com' ? 'google' : 'email',
      householdIds: [],
      householdProfileIds: [],
      calendarConnected: false,
      createdAt: now,
      updatedAt: now,
    });

    await createHousehold(uid, { name: 'My Family' });
    userSnap = await userRef.get();
  } else {
    const data = userSnap.data()!;
    if (!Array.isArray(data.householdIds) || data.householdIds.length === 0) {
      await createHousehold(uid, { name: 'My Family' });
      userSnap = await userRef.get();
    }
  }

  return serializeUser(uid, userSnap.data()!);
}

export async function getProfileBundle(uid: string, fallback: { email?: string; name?: string; photoURL?: string; provider?: string }) {
  const profile = await getUserProfile(uid, fallback);
  const activeHouseholdId = profile.activeHouseholdId || profile.householdIds[0];
  const household = activeHouseholdId ? await getHousehold(uid, activeHouseholdId) : null;
  const households = await Promise.all(profile.householdIds.map((householdId) => getHousehold(uid, householdId)));
  const familyMembers = activeHouseholdId ? await getFamilyMembersByHousehold(uid, activeHouseholdId) : [];

  return { profile, household, households, familyMembers };
}

export async function setActiveHousehold(uid: string, payload: unknown) {
  const parsed = activeHouseholdSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid household payload.');
  }

  await assertHouseholdAccess(uid, parsed.data.activeHouseholdId);
  await adminDb.collection('users').doc(uid).set(
    {
      activeHouseholdId: parsed.data.activeHouseholdId,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getHousehold(uid: string, householdId: string) {
  const { household } = await assertHouseholdAccess(uid, householdId);
  return household;
}

export async function addMedicine(uid: string, payload: unknown) {
  const parsed = medicineSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid medicine payload.');
  }

  const input: CreateMedicinePayload = parsed.data;
  await assertHouseholdAccess(uid, input.householdId);

  const medicineRef = adminDb.collection('medicines').doc();
  const now = FieldValue.serverTimestamp();
  const reminderTimes = input.reminderTimes.filter(Boolean);

  await adminDb.runTransaction(async (transaction) => {
    transaction.set(medicineRef, {
      ...input,
      reminderTimes,
      image: input.image || medicineImage,
      createdByUid: uid,
      createdAt: now,
      updatedAt: now,
    });

    reminderTimes.forEach((time) => {
      const reminderRef = adminDb.collection('reminders').doc();
      const reminder: Omit<ReminderDocument, 'id' | 'createdAt' | 'updatedAt'> & { memberId?: string; userId?: string } = {
        householdId: input.householdId,
        medicineId: medicineRef.id,
        assignedToUid: input.assignedToUid,
        assignedToMemberId: input.assignedToMemberId,
        memberId: input.assignedToMemberId,
        userId: input.assignedToUid,
        time,
        status: 'upcoming',
      };

      transaction.set(reminderRef, {
        ...withoutUndefined(reminder),
        createdAt: now,
        updatedAt: now,
      });
    });
  });

  const created = await medicineRef.get();
  return serializeMedicine(created.id, created.data()!);
}

export async function getMedicinesByHousehold(uid: string, householdId: string) {
  await assertHouseholdAccess(uid, householdId);

  const snapshot = await adminDb
    .collection('medicines')
    .where('householdId', '==', householdId)
    .get();

  return snapshot.docs
    .map((doc) => serializeMedicine(doc.id, doc.data()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function updateMedicine(uid: string, medicineId: string, payload: unknown) {
  const parsed = medicinePatchSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid medicine payload.');
  }

  const medicineRef = adminDb.collection('medicines').doc(medicineId);
  const medicineSnap = await medicineRef.get();
  if (!medicineSnap.exists) {
    throw new ApiError(404, 'Medicine not found.');
  }

  await assertHouseholdAccess(uid, medicineSnap.data()!.householdId);
  await medicineRef.update({ ...parsed.data, updatedAt: FieldValue.serverTimestamp() });

  const updated = await medicineRef.get();
  return serializeMedicine(updated.id, updated.data()!);
}

export async function deleteMedicine(uid: string, medicineId: string) {
  const medicineRef = adminDb.collection('medicines').doc(medicineId);
  const medicineSnap = await medicineRef.get();
  if (!medicineSnap.exists) {
    throw new ApiError(404, 'Medicine not found.');
  }

  await assertHouseholdAccess(uid, medicineSnap.data()!.householdId);

  const reminders = await adminDb.collection('reminders').where('medicineId', '==', medicineId).get();
  const batch = adminDb.batch();
  reminders.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(medicineRef);
  await batch.commit();
}

export async function createReminder(uid: string, payload: unknown) {
  const parsed = reminderSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid reminder payload.');
  }

  const input = parsed.data;
  await assertHouseholdAccess(uid, input.householdId);

  const medicineSnap = await adminDb.collection('medicines').doc(input.medicineId).get();
  if (!medicineSnap.exists || medicineSnap.data()!.householdId !== input.householdId) {
    throw new ApiError(400, 'Reminder medicine must belong to the same household.');
  }

  const reminderRef = adminDb.collection('reminders').doc();
  await reminderRef.set({
    ...input,
    userId: input.userId || uid,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const created = await reminderRef.get();
  return serializeReminder(created.id, created.data()!);
}

export async function getReminders(uid: string, filters: { userId?: string; householdId?: string }) {
  let query: FirebaseFirestore.Query = adminDb.collection('reminders');

  if (filters.householdId) {
    await assertHouseholdAccess(uid, filters.householdId);
    query = query.where('householdId', '==', filters.householdId);
  } else {
    query = query.where('userId', '==', filters.userId || uid);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => serializeReminder(doc.id, doc.data())).sort((a, b) => a.time.localeCompare(b.time));
}

export async function updateReminder(uid: string, reminderId: string, payload: unknown) {
  const parsed = reminderPatchSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid reminder payload.');
  }

  const reminderRef = adminDb.collection('reminders').doc(reminderId);
  const reminderSnap = await reminderRef.get();
  if (!reminderSnap.exists) {
    throw new ApiError(404, 'Reminder not found.');
  }

  const existingReminder = reminderSnap.data()!;
  await assertHouseholdAccess(uid, existingReminder.householdId);

  let medicine: Medicine | undefined;
  await adminDb.runTransaction(async (transaction) => {
    const currentReminderSnap = await transaction.get(reminderRef);
    if (!currentReminderSnap.exists) {
      throw new ApiError(404, 'Reminder not found.');
    }

    const currentReminder = currentReminderSnap.data()!;
    const nextStatus = parsed.data.status;
    const medicineRef = adminDb.collection('medicines').doc(currentReminder.medicineId);
    const shouldTake = nextStatus === 'taken' && currentReminder.status !== 'taken';
    const shouldUndoTake = currentReminder.status === 'taken' && nextStatus && nextStatus !== 'taken';

    if (shouldTake || shouldUndoTake) {
      const medicineSnap = await transaction.get(medicineRef);
      if (medicineSnap.exists) {
        const medicineData = medicineSnap.data()!;
        const currentQuantity = Number(medicineData.quantity || 0);
        const nextQuantity = shouldTake ? Math.max(0, currentQuantity - 1) : currentQuantity + 1;
        transaction.update(medicineRef, {
          quantity: nextQuantity,
          updatedAt: FieldValue.serverTimestamp(),
        });
        medicine = serializeMedicine(medicineSnap.id, { ...medicineData, quantity: nextQuantity });
      }
    }

    transaction.update(reminderRef, { ...parsed.data, updatedAt: FieldValue.serverTimestamp() });
  });

  const updated = await reminderRef.get();
  return { reminder: serializeReminder(updated.id, updated.data()!), medicine };
}

export async function deleteReminder(uid: string, reminderId: string) {
  const reminderRef = adminDb.collection('reminders').doc(reminderId);
  const reminderSnap = await reminderRef.get();
  if (!reminderSnap.exists) {
    throw new ApiError(404, 'Reminder not found.');
  }

  await assertHouseholdAccess(uid, reminderSnap.data()!.householdId);
  await reminderRef.delete();
}

export async function getFamilyMembersByHousehold(uid: string, householdId: string) {
  await assertHouseholdAccess(uid, householdId);

  const snapshot = await adminDb.collection('members').where('householdId', '==', householdId).get();
  return snapshot.docs.map((doc) => serializeFamilyMember(doc.id, doc.data())).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCaregiversByHousehold(uid: string, householdId: string) {
  await assertHouseholdAccess(uid, householdId);

  const snapshot = await adminDb.collection('caregivers').where('householdId', '==', householdId).get();
  return snapshot.docs.map((doc) => serializeCaregiver(doc.id, doc.data())).sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCaregiver(uid: string, payload: unknown) {
  const parsed = caregiverSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message || 'Invalid caregiver payload.');
  }

  const input = parsed.data;
  await assertHouseholdAccess(uid, input.householdId);

  const caregiverRef = adminDb.collection('caregivers').doc();
  await caregiverRef.set({
    ...input,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const created = await caregiverRef.get();
  return serializeCaregiver(created.id, created.data()!);
}

export async function deleteCaregiver(uid: string, caregiverId: string) {
  const caregiverRef = adminDb.collection('caregivers').doc(caregiverId);
  const caregiverSnap = await caregiverRef.get();
  if (!caregiverSnap.exists) {
    throw new ApiError(404, 'Caregiver not found.');
  }

  await assertHouseholdAccess(uid, caregiverSnap.data()!.householdId);
  await caregiverRef.delete();
}
