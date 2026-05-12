'use client';

import { ChevronLeft } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/app-store';

export default function ReportsPage() {
  const { medicines, members, todayReminders, lowStockMedicines, expiringMedicines } = useAppStore();
  const taken = todayReminders.filter((item) => item.status === 'taken').length;
  const adherence = todayReminders.length ? Math.round((taken / todayReminders.length) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
            <p className="text-slate-600 mt-1">Monthly household medicine summary.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ReportCard label="Family members" value={members.length} />
          <ReportCard label="Medicines tracked" value={medicines.length} />
          <ReportCard label="Dose adherence" value={`${adherence}%`} />
          <ReportCard label="Needs attention" value={lowStockMedicines.length + expiringMedicines.length} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-bold text-slate-900 mb-4">Medicine distribution</h2>
            <div className="space-y-3">
              {members.map((member) => {
                const count = medicines.filter((medicine) => medicine.assignedToId === member.id).length;
                return (
                  <div key={member.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700">{member.name}</span>
                      <span className="text-slate-500">{count} medicines</span>
                    </div>
                    <div className="h-2 rounded bg-slate-100 overflow-hidden">
                      <div className="h-full bg-teal-600" style={{ width: `${Math.max(8, (count / Math.max(1, medicines.length)) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h2 className="font-bold text-slate-900 mb-4">Attention list</h2>
            <div className="space-y-3">
              {[...lowStockMedicines, ...expiringMedicines].map((medicine) => (
                <div key={`${medicine.id}-report`} className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <p className="font-medium text-slate-900">{medicine.name}</p>
                    <p className="text-sm text-slate-500">{medicine.quantity} {medicine.unit} left - expires {medicine.expiryDate}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Review</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ReportCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}
