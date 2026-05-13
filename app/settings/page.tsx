'use client';

import { ChevronLeft, ShieldCheck } from 'lucide-react';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/app-store';

export default function SettingsPage() {
  const { user } = useAppStore();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Manage account, login providers, and calendar sync.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              Account
            </h2>
            <div className="space-y-3 text-sm">
              <Row label="Name" value={user.name} />
              <Row label="Email" value={user.email} />
              <Row label="Role" value={user.role} />
              <Row label="Login provider" value={user.authProvider} />
              <Row label="Household" value={user.household} />
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 capitalize">{value}</span>
    </div>
  );
}
