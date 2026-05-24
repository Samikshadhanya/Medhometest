'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutGrid,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/lib/app-store';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { todayReminders, expiringMedicines } = useAppStore();
  const reminderAlertCount = todayReminders.length + expiringMedicines.length;
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Family Profiles', href: '/family-profiles' },
    { icon: Package, label: 'Inventory', href: '/inventory' },
    { icon: Bell, label: 'Reminders', href: '/reminders', count: reminderAlertCount },
    { icon: ShoppingCart, label: 'Purchase List', href: '/purchase-list' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];
  const closeAfterMobileNavigation = () => {
    if (window.innerWidth < 768 && open) onToggle();
  };

  return (
    <>
      <aside className={`${open ? 'translate-x-0 md:w-64' : '-translate-x-full md:translate-x-0 md:w-20'} fixed inset-y-0 left-0 z-40 flex w-[min(18rem,86vw)] flex-col bg-slate-900 text-white transition-all duration-300 md:relative md:flex-shrink-0`}>
        <div className="flex items-center justify-between border-b border-slate-800 px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] md:pt-4">
      <div className={`${open ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full md:relative z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {open && (
            <Link href="/dashboard" onClick={closeAfterMobileNavigation} className="flex items-center gap-2 rounded hover:opacity-90">
              <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">MedHome</span>
            </Link>
          )}
          <button onClick={onToggle} className="p-1 hover:bg-slate-800 rounded transition">
            {open ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAfterMobileNavigation}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={!open ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {open && <span className="text-sm font-medium">{item.label}</span>}
                {open && item.count ? (
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-white text-teal-700' : 'bg-teal-500 text-white'}`}>
                    {item.count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>


      </aside>

      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={onToggle} />}
    </>
  );
}
