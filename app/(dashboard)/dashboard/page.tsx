'use client';

import Link from 'next/link';
import { AlertTriangle, Bell, Calendar, Copy, Package } from 'lucide-react';
import UpcomingEvents from '@/components/upcoming-events';
import { useAppStore } from '@/lib/app-store';

export default function DashboardPage() {
  const { todayReminders, lowStockMedicines, expiringMedicines, duplicateMedicines } = useAppStore();

  const cards = [
    { label: "Today's pill reminders", value: todayReminders.length, detail: 'Mark doses taken or missed', icon: Bell, href: '/reminders', tone: 'blue' },
    { label: 'Low-stock medicines', value: lowStockMedicines.length, detail: 'Need reorder soon', icon: AlertTriangle, href: '/purchase-list', tone: 'yellow' },
    { label: 'Expiry alerts', value: expiringMedicines.length, detail: 'Expiring within 30 days', icon: Calendar, href: '/inventory', tone: 'red' },
    { label: 'Duplicate purchase risk', value: duplicateMedicines.length, detail: 'Same medicine found twice', icon: Copy, href: '/inventory', tone: 'purple' },
  ];

  return (
    <>
      <div className="page-panel space-y-5 p-3 sm:p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">Today at a glance</h1>
          <p className="mt-1 text-sm text-slate-600 md:text-base">Here is what is happening with your family medicines.</p>
        </div>

        <div className="mobile-snap-row -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="min-w-[78vw] snap-start rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300 active:scale-[0.99] md:min-w-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-3xl font-bold text-slate-900">{card.value}</span>
                </div>
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-slate-900">{card.label}</h3>
                  <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 md:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 md:text-xl">
                <Package className="h-5 w-5 text-teal-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/inventory" className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 active:scale-[0.99]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Manage Inventory</p>
                    <p className="text-xs text-slate-500">Add or edit medicines</p>
                  </div>
                </Link>
                <Link href="/family-profiles" className="flex min-h-16 items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 active:scale-[0.99]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Family Members</p>
                    <p className="text-xs text-slate-500">Update profiles</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Keep inventory updated to get accurate reminders, restock alerts, duplicate warnings, and expiry notices.
            </div>
          </div>

          <div>
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </>
  );
}
