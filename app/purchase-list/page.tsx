'use client';

import { ChevronLeft, ShoppingCart } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/app-store';

export default function PurchaseListPage() {
  const { purchaseList, getMember, updateMedicine } = useAppStore();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Purchase List</h1>
            <p className="text-slate-600 mt-1">Medicines that need restocking soon.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {purchaseList.length === 0 ? (
            <div className="p-10 text-center text-slate-600">No medicines need restocking right now.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {purchaseList.map((medicine) => {
                const member = getMember(medicine.assignedToId);
                return (
                  <div key={medicine.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img src={medicine.image} alt={medicine.name} className="w-12 h-12 rounded object-cover" />
                      <div>
                        <p className="font-semibold text-slate-900">{medicine.name}</p>
                        <p className="text-sm text-slate-600">{member?.name} - only {medicine.quantity} {medicine.unit} left</p>
                        <p className="text-xs text-slate-500">Reorder 2 days before expected shortage.</p>
                      </div>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                      <Button
                        onClick={() => updateMedicine(medicine.id, { quantity: medicine.quantity + 30 })}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Mark restocked
                      </Button>
                      <Button asChild variant="outline">
                        <a
                          href={`https://www.google.com/search?q=buy+${encodeURIComponent(medicine.name)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Find pharmacy
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
