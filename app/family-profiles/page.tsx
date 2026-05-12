'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Heart,
  Pill,
  Shield,
  ShoppingCart,
  Stethoscope,
  UserPlus,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function FamilyProfilePage() {
  const store = useAppStore();
  const { members, medicines, todayReminders, caregivers, addCaregiver, removeCaregiver } = store;
  
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id ?? '');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  
  // New profile form state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Family Member');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Unspecified');
  const [newAllergies, setNewAllergies] = useState('');
  const [newHealthNotes, setNewHealthNotes] = useState('');

  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? members[0];
  const profileMedicines = medicines.filter((medicine) => medicine.assignedToId === selectedMember?.id);
  const profileReminders = todayReminders.filter((reminder) => reminder.memberId === selectedMember?.id);

  const warnings = useMemo(() => {
    const allergyText = selectedMember?.knownAllergies.toLowerCase() ?? '';
    return profileMedicines.filter((medicine) => allergyText !== 'none known' && allergyText !== '' && medicine.name.toLowerCase().includes(allergyText));
  }, [profileMedicines, selectedMember]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await store.addMember({
      name: newName.trim(),
      role: newRole,
      age: newAge || 'Unspecified',
      gender: newGender,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName.trim())}&background=random`,
      healthNotes: newHealthNotes.split(',').map(n => n.trim()).filter(Boolean),
      knownAllergies: newAllergies || 'None known',
    });

    setIsCreatingProfile(false);
    setNewName('');
    setNewRole('Family Member');
    setNewAge('');
    setNewGender('Unspecified');
    setNewAllergies('');
    setNewHealthNotes('');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Family Profiles</h1>
            <p className="text-slate-600 mt-1">Manage family members and view their health details.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-4">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="p-5 bg-teal-50">
                <div className="space-y-2">
                  <select
                    value={selectedMemberId}
                    onChange={(event) => setSelectedMemberId(event.target.value)}
                    className="w-full border border-teal-200 rounded-lg px-3 py-2 bg-white font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    {members.map((member) => <option key={member.id} value={member.id}>{member.name} - {member.role}</option>)}
                  </select>
                  <Button 
                    onClick={() => setIsCreatingProfile(true)}
                    variant="outline"
                    className="w-full border-teal-200 text-teal-700 hover:bg-teal-100 bg-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Profile
                  </Button>
                </div>
                {selectedMember && (
                  <div className="flex items-center gap-3 mt-5 p-3 bg-white rounded-lg border border-teal-100 shadow-sm">
                    <img src={selectedMember.image} alt={selectedMember.name} className="w-14 h-14 rounded-full object-cover border-2 border-teal-100" />
                    <div>
                      <h2 className="font-bold text-slate-900">{selectedMember.name}</h2>
                      <p className="text-sm text-slate-600">{selectedMember.role}, age {selectedMember.age}</p>
                      <p className="text-xs text-slate-500">{selectedMember.gender}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedMember?.name}'s Health Summary</h2>
                  <p className="text-slate-600 mt-2"><span className="font-medium text-slate-900">Health notes:</span> {selectedMember?.healthNotes.length ? selectedMember.healthNotes.join(', ') : 'None'}</p>
                  <p className="text-slate-600"><span className="font-medium text-slate-900">Known allergies:</span> {selectedMember?.knownAllergies || 'None known'}</p>
                </div>
                <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-3xl font-bold text-teal-700">{profileMedicines.length}</p>
                  <p className="text-sm font-medium text-slate-500">active medicines</p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Panel title="My Medicines" icon={<Pill className="w-5 h-5 text-teal-600" />}>
                <div className="space-y-3">
                  {profileMedicines.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No active medicines.</p>
                  ) : null}
                  {profileMedicines.map((medicine) => (
                    <div key={medicine.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-900">{medicine.name}</p>
                      <p className="text-sm text-slate-600">{medicine.dosage} - {medicine.mealInstruction}</p>
                      <p className="text-xs text-slate-500">{medicine.quantity} {medicine.unit} left</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Take Pill Schedule" icon={<CalendarDays className="w-5 h-5 text-teal-600" />}>
                <div className="space-y-3">
                  {profileReminders.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No reminders for today.</p>
                  ) : null}
                  {profileReminders.map((reminder) => {
                    const medicine = medicines.find((item) => item.id === reminder.medicineId);
                    return (
                      <div key={reminder.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-slate-900">{reminder.time} - {medicine?.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{reminder.status}</p>
                        </div>
                        {medicine && (
                          <Button asChild size="sm" variant="outline">
                            <a href={store.calendarUrlForMedicine(medicine)} target="_blank" rel="noreferrer">Calendar</a>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>

              <Panel title="Expiry & Restock" icon={<AlertTriangle className="w-5 h-5 text-teal-600" />}>
                <div className="space-y-3">
                  {profileMedicines.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No active medicines.</p>
                  ) : null}
                  {profileMedicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-slate-900">{medicine.name}</p>
                        <p className="text-sm text-slate-500">Expires {medicine.expiryDate}</p>
                      </div>
                      <span className={medicine.quantity <= medicine.lowStockAt ? 'text-red-600 text-sm font-medium' : 'text-green-700 text-sm font-medium'}>
                        {medicine.quantity <= medicine.lowStockAt ? 'Restock' : 'OK'}
                      </span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Allergies & Interactions" icon={<Heart className="w-5 h-5 text-teal-600" />}>
                <p className="text-sm text-slate-600 mb-3"><span className="font-medium text-slate-900">Known allergies:</span> {selectedMember?.knownAllergies}</p>
                {warnings.length ? (
                  warnings.map((medicine) => <p key={medicine.id} className="text-sm font-medium text-red-600 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {medicine.name} may need review.</p>)
                ) : (
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2"><Shield className="w-4 h-4" /> No allergy conflicts detected.</p>
                )}
              </Panel>

              <Panel title="Medicine Uses" icon={<Stethoscope className="w-5 h-5 text-teal-600" />}>
                {profileMedicines.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No active medicines.</p>
                ) : null}
                {profileMedicines.map((medicine) => (
                  <div key={medicine.id} className="border-b border-slate-100 pb-3 mb-3 last:border-0 last:pb-0 last:mb-0">
                    <p className="font-medium text-slate-900">{medicine.name}</p>
                    <p className="text-sm text-slate-600">{medicine.use}</p>
                  </div>
                ))}
              </Panel>

              <Panel title="Caregiver Access" icon={<Shield className="w-5 h-5 text-teal-600" />}>
                <div className="space-y-3">
                  {caregivers.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No caregivers added.</p>
                  ) : null}
                  {caregivers.map((caregiver) => (
                    <div key={caregiver.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium text-slate-900">{caregiver.name}</p>
                        <p className="text-sm text-slate-500">{caregiver.relationship} - {caregiver.accessLevel}</p>
                      </div>
                      <Button onClick={() => removeCaregiver(caregiver.id)} size="sm" variant="outline">Remove</Button>
                    </div>
                  ))}
                  <Button onClick={() => addCaregiver({ name: 'New Caregiver', relationship: 'Family', accessLevel: 'Reminder Access' })} className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-none border border-slate-200">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite caregiver
                  </Button>
                </div>
              </Panel>

              <Panel title="Monthly Report" icon={<BarChart3 className="w-5 h-5 text-teal-600" />}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-teal-700">{profileReminders.filter((item) => item.status === 'taken').length}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Today's Adherence</p>
                    <p className="text-sm text-slate-600">{profileReminders.filter((item) => item.status === 'taken').length} of {profileReminders.length} doses marked taken today.</p>
                  </div>
                </div>
              </Panel>

              <Panel title="Pharmacy Reorder" icon={<ShoppingCart className="w-5 h-5 text-teal-600" />}>
                <div className="space-y-3">
                  {profileMedicines.filter((medicine) => medicine.quantity <= medicine.lowStockAt).length === 0 ? (
                    <p className="text-sm text-green-700 font-medium">All medicines are fully stocked!</p>
                  ) : null}
                  {profileMedicines.filter((medicine) => medicine.quantity <= medicine.lowStockAt).map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-900">{medicine.name}</p>
                      <Button asChild size="sm" variant="outline" className="text-teal-700 border-teal-200 hover:bg-teal-50">
                        <a href={`https://www.google.com/search?q=buy+${encodeURIComponent(medicine.name)}`} target="_blank" rel="noreferrer">
                          Find pharmacy
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>
          </main>
        </div>
      </div>

      {isCreatingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create Family Profile</h2>
              <button onClick={() => setIsCreatingProfile(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProfile} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <input 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Role/Relationship</label>
                  <input 
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. Spouse"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Age</label>
                  <input 
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="e.g. 34"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Gender</label>
                <select 
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                >
                  <option>Unspecified</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Known Allergies</label>
                <input 
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="e.g. Penicillin, Peanuts (leave blank if none)"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Health Notes (comma separated)</label>
                <textarea 
                  value={newHealthNotes}
                  onChange={(e) => setNewHealthNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 min-h-24 resize-none"
                  placeholder="e.g. High blood pressure, Asthma"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCreatingProfile(false)}>Cancel</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Save Profile</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        {icon}
        {title}
      </h3>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}
