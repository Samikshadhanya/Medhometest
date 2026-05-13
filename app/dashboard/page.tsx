'use client';

import Link from 'next/link';
import { AlertTriangle, Bell, Calendar, Copy, Package } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
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
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Today at a glance</h1>
          <p className="text-slate-600 mt-1">Here is what is happening with your family medicines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 hover:border-teal-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-teal-600" />
                  <span className="text-2xl md:text-3xl font-bold text-slate-900">{card.value}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{card.label}</h3>
                  <p className="text-sm text-slate-500">{card.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-teal-600" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/inventory" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Manage Inventory</p>
                    <p className="text-xs text-slate-500">Add or edit medicines</p>
                  </div>
                </Link>
                <Link href="/family-profiles" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Family Members</p>
                    <p className="text-xs text-slate-500">Update profiles</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
              Keep inventory updated to get accurate reminders, restock alerts, duplicate warnings, and expiry notices.
            </div>
          </div>

          <div>
            <UpcomingEvents />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
