'use client';

import { useState } from 'react';
import { ChevronLeft, ExternalLink, Plus, Search } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import MedicineTable from '@/components/medicine-table';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function InventoryPage() {
  const { medicines, members, addMedicine, lowStockMedicines, expiringMedicines, duplicateMedicines } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [lookupName, setLookupName] = useState('');
  const [lookupResult, setLookupResult] = useState<MedicineLookup | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'OTC',
    strength: '',
    type: 'Tablet',
    quantity: 10,
    unit: 'tablets',
    assignedToId: members[0]?.id ?? '',
    expiryDate: '',
    manufactureDate: '',
    pharmaName: '',
    use: '',
    dosage: '1 tablet',
    mealInstruction: 'After food',
    reminderTimes: '08:00',
    lowStockAt: 5,
  });

  const minExpiryDate = getTomorrowDate();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFutureDate(form.expiryDate)) {
      setFormError('Choose an expiry date after today.');
      return;
    }
    setFormError('');
    addMedicine({
      ...form,
      reminderTimes: form.reminderTimes.split(',').map((time) => time.trim()).filter(Boolean),
    });
    setShowForm(false);
  };

  const submitLookup = (event: React.FormEvent) => {
    event.preventDefault();
    const query = lookupName.trim();
    if (!query) return;
    setLookupResult(findMedicineLookup(query));
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Medicine Inventory</h1>
              <p className="text-slate-600 mt-1">Manage medicines across the household.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm((current) => !current)} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4" />
            Add Medicine
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat label="Total medicines" value={medicines.length} />
          <Stat label="Low stock" value={lowStockMedicines.length} />
          <Stat label="Expiring soon" value={expiringMedicines.length} />
          <Stat label="Duplicates" value={duplicateMedicines.length} />
        </div>

        <section className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-600" />
              Medicine lookup
            </h2>
            <p className="text-sm text-slate-600 mt-1">Type a tablet name to see common uses. If MedHome has no match, jump straight to Google.</p>
            <form onSubmit={submitLookup} className="flex flex-col sm:flex-row gap-3 mt-4">
              <input
                value={lookupName}
                onChange={(event) => setLookupName(event.target.value)}
                placeholder="e.g. Paracetamol"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                <Search className="w-4 h-4" />
                Look up
              </Button>
            </form>
          </div>

          <div className="rounded-lg border border-teal-100 bg-teal-50/60 p-4 min-h-32 flex items-center">
            {!lookupResult ? (
              <p className="text-sm text-slate-600">Try a medicine name to get a quick, non-diagnostic summary for common symptoms and uses.</p>
            ) : lookupResult.found ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Basic info</p>
                <h3 className="text-lg font-bold text-slate-900">{lookupResult.name}</h3>
                <p className="text-sm text-slate-700">{lookupResult.summary}</p>
                <p className="text-xs text-slate-500">Ask a doctor or pharmacist before starting, stopping, or combining medicines.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">No local match for "{lookupResult.name}".</p>
                  <p className="text-sm text-slate-600">Search Google for reliable, current medicine information.</p>
                </div>
                <Button asChild variant="outline" className="border-teal-200 text-teal-700 hover:bg-white">
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(`${lookupResult.name} medicine uses symptoms`)}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Search Google
                  </a>
                </Button>
              </div>
            )}
          </div>
        </section>

        {showForm && (
          <form onSubmit={submit} className="bg-white border border-slate-200 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Medicine name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <Field label="Strength" value={form.strength} onChange={(value) => setForm({ ...form, strength: value })} placeholder="650mg" />
            <Field label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: value })} />
            <Field label="Quantity" type="number" value={String(form.quantity)} onChange={(value) => setForm({ ...form, quantity: Number(value) })} />
            <Field label="Unit" value={form.unit} onChange={(value) => setForm({ ...form, unit: value })} />
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Assigned to
              <select
                value={form.assignedToId}
                onChange={(event) => setForm({ ...form, assignedToId: event.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
              >
                {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
            </label>
            <Field label="Expiry date" type="date" min={minExpiryDate} value={form.expiryDate} onChange={(value) => setForm({ ...form, expiryDate: value })} required />
            <Field label="Manufacture date" value={form.manufactureDate} onChange={(value) => setForm({ ...form, manufactureDate: value })} placeholder="YYYY-MM-DD" />
            <Field label="Pharmacy / pharma" value={form.pharmaName} onChange={(value) => setForm({ ...form, pharmaName: value })} placeholder="Nil if unknown" />
            <Field label="Simple use" value={form.use} onChange={(value) => setForm({ ...form, use: value })} required />
            <Field label="Dosage" value={form.dosage} onChange={(value) => setForm({ ...form, dosage: value })} />
            <Field label="Meal instruction" value={form.mealInstruction} onChange={(value) => setForm({ ...form, mealInstruction: value })} />
            <Field label="Reminder times" value={form.reminderTimes} onChange={(value) => setForm({ ...form, reminderTimes: value })} placeholder="08:00, 20:00" />
            <Field label="Low stock at" type="number" value={String(form.lowStockAt)} onChange={(value) => setForm({ ...form, lowStockAt: Number(value) })} />
            {formError && <p className="md:col-span-3 text-sm font-medium text-red-600">{formError}</p>}
            <div className="md:col-span-3 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save medicine</Button>
            </div>
          </form>
        )}

        <MedicineTable medicines={medicines} showDelete />
      </div>
    </DashboardLayout>
  );
}

type MedicineLookup = {
  name: string;
  summary: string;
  found: boolean;
};

const medicineLookup = [
  { keys: ['paracetamol', 'acetaminophen', 'dolo'], name: 'Paracetamol / Acetaminophen', summary: 'Commonly used for fever, headache, body aches, mild pain, and cold-related discomfort.' },
  { keys: ['ibuprofen', 'brufen'], name: 'Ibuprofen', summary: 'Commonly used for pain, swelling, fever, period cramps, toothache, and muscle or joint aches.' },
  { keys: ['cetirizine', 'zyrtec'], name: 'Cetirizine', summary: 'Commonly used for allergy symptoms such as sneezing, runny nose, itchy eyes, and hives.' },
  { keys: ['amoxicillin', 'amoxycillin'], name: 'Amoxicillin', summary: 'An antibiotic used for some bacterial infections. It should be taken only when prescribed.' },
  { keys: ['omeprazole', 'pantoprazole'], name: 'Omeprazole / Pantoprazole', summary: 'Commonly used for acidity, heartburn, reflux symptoms, and stomach acid control.' },
  { keys: ['metformin'], name: 'Metformin', summary: 'Commonly prescribed to help manage blood sugar in type 2 diabetes.' },
  { keys: ['atorvastatin'], name: 'Atorvastatin', summary: 'Commonly prescribed to help manage cholesterol and reduce cardiovascular risk.' },
  { keys: ['amlodipine'], name: 'Amlodipine', summary: 'Commonly prescribed for high blood pressure and some types of chest pain.' },
];

function findMedicineLookup(query: string): MedicineLookup {
  const normalized = query.toLowerCase();
  const match = medicineLookup.find((item) => item.keys.some((key) => normalized.includes(key) || key.includes(normalized)));

  if (!match) {
    return { name: query, summary: '', found: false };
  }

  return { name: match.name, summary: match.summary, found: true };
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function isFutureDate(date: string) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  return target.getTime() > today.getTime();
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        type={type}
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => onChange(event.currentTarget.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2"
      />
    </label>
  );
}
