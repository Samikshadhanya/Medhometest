'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Check, Clock, Plus, Trash2, X } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function RemindersPage() {
  const { todayReminders, medicines, members, getMember, markDose, deleteReminder, addReminder, calendarUrlForMedicine } = useAppStore();
  const [medicineId, setMedicineId] = useState(medicines[0]?.id ?? '');
  const [time, setTime] = useState('08:00');

  useEffect(() => {
    if (!medicineId && medicines[0]?.id) {
      setMedicineId(medicines[0].id);
    }
  }, [medicineId, medicines]);

  const selectedMedicine = medicines.find((medicine) => medicine.id === medicineId);

  const submitReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMedicine) return;

    await addReminder({
      medicineId: selectedMedicine.id,
      memberId: selectedMedicine.assignedToId,
      time,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reminders</h1>
            <p className="text-slate-600 mt-1">Track pill reminders and send them to Google Calendar.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">Today&apos;s dose schedule</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {todayReminders.length === 0 && (
                <div className="p-8 text-center text-slate-600">No reminders yet. Add one from the panel.</div>
              )}
              {todayReminders.map((reminder) => {
                const medicine = medicines.find((item) => item.id === reminder.medicineId);
                const member = getMember(reminder.memberId);

                return (
                  <div key={reminder.id} className="p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-700 grid place-items-center font-bold">
                        {reminder.time}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{medicine?.name}</p>
                        <p className="text-sm text-slate-600">{medicine?.dosage} - {medicine?.mealInstruction}</p>
                        <p className="text-xs text-slate-500 mt-1">{member?.name} ({member?.role})</p>
                        <span className="inline-flex mt-2 px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs capitalize">
                          {reminder.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 items-center">
                      {reminder.status === 'taken' ? (
                        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Check className="w-4 h-4" /> Taken {reminder.takenAt ? new Date(reminder.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      ) : reminder.status === 'missed' ? (
                        <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <X className="w-4 h-4" /> Missed
                        </span>
                      ) : (
                        <>
                          <Button onClick={() => markDose(reminder.id, 'taken')} size="sm" className="bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4" />
                            Taken
                          </Button>
                          <Button onClick={() => markDose(reminder.id, 'missed')} size="sm" variant="outline" className="text-red-600">
                            <X className="w-4 h-4" />
                            Missed
                          </Button>
                        </>
                      )}
                      {medicine && (
                        <Button asChild size="sm" variant="outline">
                          <a href={calendarUrlForMedicine(medicine)} target="_blank" rel="noreferrer">
                            Calendar
                          </a>
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteReminder(reminder.id)}
                        size="icon-sm"
                        variant="ghost"
                        className="text-red-600"
                        aria-label={`Delete reminder for ${medicine?.name ?? 'medicine'} at ${reminder.time}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-600" />
                Add reminder
              </h2>
              {medicines.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Add a pill first. Its reminder times will show up here automatically.</p>
                  <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                    <Link href="/inventory">Add medicine</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitReminder} className="space-y-3">
                  <label className="space-y-2 text-sm font-medium text-slate-700 block">
                    Medicine
                    <select
                      value={medicineId}
                      onChange={(event) => setMedicineId(event.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    >
                      {medicines.map((medicine) => {
                        const member = members.find((item) => item.id === medicine.assignedToId);
                        return <option key={medicine.id} value={medicine.id}>{medicine.name} - {member?.name ?? 'Unassigned'}</option>;
                      })}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700 block">
                    Time
                    <input
                      type="time"
                      value={time}
                      onChange={(event) => setTime(event.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                    />
                  </label>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Save reminder
                  </Button>
                </form>
              )}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Reminder rules
              </h2>
              <div className="space-y-3 text-sm text-slate-600">
                <p>App reminders can be created manually or generated from medicine reminder times.</p>
                <p>Calendar buttons create a Google Calendar event template for pill schedules and restock planning.</p>
                <p>Low-stock reminders trigger when quantity reaches the medicine&apos;s threshold.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
