'use client';

import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { useAppStore } from '@/lib/app-store';

export default function SettingsPage() {
  const { user } = useAppStore();

  return (
    <>
      <div className="page-panel space-y-5 p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">Settings</h1>
            <p className="mt-1 text-sm text-slate-600 md:text-base">Manage account, login providers, and calendar sync.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-2 sm:flex-row sm:justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 capitalize">{value}</span>
    </div>
  );
}
