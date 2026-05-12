'use client';

import { CalendarPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Medicine, useAppStore } from '@/lib/app-store';

interface MedicineTableProps {
  medicines: Medicine[];
  showDelete?: boolean;
}

const daysUntil = (date: string) => {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

export default function MedicineTable({ medicines, showDelete = false }: MedicineTableProps) {
  const { getMember, deleteMedicine, calendarUrlForMedicine } = useAppStore();

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-6 py-3 font-semibold text-slate-900">Medicine</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-900">Assigned To</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-900">Quantity</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-900">Expiry Date</th>
              <th className="text-center px-6 py-3 font-semibold text-slate-900">Action</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => {
              const member = getMember(medicine.assignedToId);
              const daysLeft = daysUntil(medicine.expiryDate);
              const urgent = daysLeft <= 30 || medicine.quantity <= medicine.lowStockAt;

              return (
                <tr key={medicine.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={medicine.image} alt={medicine.name} className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium text-slate-900">{medicine.name}</p>
                        <p className="text-xs text-slate-500">{medicine.category} - {medicine.use}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{member ? `${member.name} (${member.role})` : 'Unassigned'}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {medicine.quantity} {medicine.unit}
                    {medicine.quantity <= medicine.lowStockAt && <p className="text-xs text-red-600 mt-1">Low stock</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={urgent ? 'text-orange-600' : 'text-slate-600'}>{medicine.expiryDate}</span>
                    <p className="text-xs text-slate-500 mt-1">{daysLeft} days left</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild variant="outline" size="sm" className="text-teal-600 border-teal-600 hover:bg-teal-50">
                        <a href={calendarUrlForMedicine(medicine)} target="_blank" rel="noreferrer">
                          <CalendarPlus className="w-4 h-4" />
                          Calendar
                        </a>
                      </Button>
                      {showDelete && (
                        <Button
                          onClick={() => deleteMedicine(medicine.id)}
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-600"
                          aria-label={`Delete ${medicine.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
