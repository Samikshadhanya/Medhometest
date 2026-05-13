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

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Family Profiles', href: '/family-profiles' },
    { icon: Package, label: 'Inventory', href: '/inventory' },
    { icon: Bell, label: 'Reminders', href: '/reminders' },
    { icon: ShoppingCart, label: 'Purchase List', href: '/purchase-list' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      <div className={`${open ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full md:relative z-40`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          {open && (
            <Link href="/dashboard" className="flex items-center gap-2 rounded hover:opacity-90">
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
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                  isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={!open ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {open && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>


      </div>

      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-30" onClick={onToggle} />}
    </>
  );
}
