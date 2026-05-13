'use client';

import { useState } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import MedicineTable from '@/components/medicine-table';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function InventoryPage() {
  const { medicines, members, addMedicine, lowStockMedicines, expiringMedicines, duplicateMedicines } = useAppStore();
  const [showForm, setShowForm] = useState(false);
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

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    addMedicine({
      ...form,
      reminderTimes: form.reminderTimes.split(',').map((time) => time.trim()).filter(Boolean),
    });
    setShowForm(false);
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
            <Field label="Expiry date" value={form.expiryDate} onChange={(value) => setForm({ ...form, expiryDate: value })} placeholder="YYYY-MM-DD" required />
            <Field label="Manufacture date" value={form.manufactureDate} onChange={(value) => setForm({ ...form, manufactureDate: value })} placeholder="YYYY-MM-DD" />
            <Field label="Pharmacy / pharma" value={form.pharmaName} onChange={(value) => setForm({ ...form, pharmaName: value })} placeholder="Nil if unknown" />
            <Field label="Simple use" value={form.use} onChange={(value) => setForm({ ...form, use: value })} required />
            <Field label="Dosage" value={form.dosage} onChange={(value) => setForm({ ...form, dosage: value })} />
            <Field label="Meal instruction" value={form.mealInstruction} onChange={(value) => setForm({ ...form, mealInstruction: value })} />
            <Field label="Reminder times" value={form.reminderTimes} onChange={(value) => setForm({ ...form, reminderTimes: value })} placeholder="08:00, 20:00" />
            <Field label="Low stock at" type="number" value={String(form.lowStockAt)} onChange={(value) => setForm({ ...form, lowStockAt: Number(value) })} />
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2"
      />
    </label>
  );
}
