'use client';

import { AlertTriangle, Bell, CalendarClock, ChevronDown, Home, LogOut, Menu, PackageX } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/app-store';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, signOut, todayReminders, lowStockMedicines, expiringMedicines } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  const notifications = [
    ...todayReminders.filter((reminder) => reminder.status === 'missed').map((reminder) => ({
      id: `missed-${reminder.id}`,
      type: 'alert',
      icon: AlertTriangle,
      title: 'Missed dose',
      message: `A ${reminder.time} reminder was marked missed.`,
    })),
    ...lowStockMedicines.map((medicine) => ({
      id: `stock-${medicine.id}`,
      type: 'warning',
      icon: PackageX,
      title: 'Low stock',
      message: `${medicine.name} has ${medicine.quantity} ${medicine.unit} left.`,
    })),
    ...expiringMedicines.map((medicine) => ({
      id: `expiry-${medicine.id}`,
      type: 'info',
      icon: CalendarClock,
      title: 'Expiring soon',
      message: `${medicine.name} expires on ${medicine.expiryDate}.`,
    })),
  ];

  return (
    <header className="shrink-0 bg-white border-b border-slate-200 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] md:px-6 md:py-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex items-center gap-2 md:gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition">
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex min-w-0 items-center gap-2">
          <span className="text-sm text-slate-600 hidden sm:block">Selected Household</span>
          <button 
            onClick={() => setShowHouseholdMenu(!showHouseholdMenu)}
            className="min-w-0 flex items-center gap-1 px-2 py-1.5 md:px-3 rounded-lg hover:bg-slate-100 transition font-medium text-slate-900"
          >
            <span className="truncate max-w-[9rem] sm:max-w-[14rem]">{user.household}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showHouseholdMenu && (
            <div className="absolute top-full left-0 sm:left-auto mt-2 w-[min(20rem,calc(100vw-2rem))] bg-white rounded-lg shadow-lg border border-slate-200 z-20">
              <div className="p-2 space-y-1">
                <p className="text-xs font-semibold text-slate-500 px-2 py-1">Switch Household</p>
                {user.households?.map((hh) => (
                  <button
                    key={hh}
                    onClick={() => {
                      switchHousehold(hh);
                      setShowHouseholdMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${hh === user.household ? 'bg-teal-50 text-teal-700 font-medium' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {hh}
                  </button>
                ))}
                
                <div className="border-t border-slate-100 my-1 pt-2">
                  <p className="text-xs font-semibold text-slate-500 px-2 pb-1">Add New Household</p>
                  <div className="flex gap-2 px-2 pb-1">
                    <input 
                      type="text" 
                      placeholder="Family Name" 
                      value={newHouseholdName}
                      onChange={(e) => setNewHouseholdName(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    <button 
                      disabled={addingHousehold}
                      onClick={async () => {
                        const name = newHouseholdName.trim();
                        if (!name) return;

                        try {
                          setAddingHousehold(true);
                          setHouseholdError('');
                          await addHousehold(name);
                          setNewHouseholdName('');
                          setShowHouseholdMenu(false);
                        } catch (error) {
                          setHouseholdError(error instanceof Error ? error.message : 'Could not create household.');
                        } finally {
                          setAddingHousehold(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {addingHousehold ? 'Adding' : 'Add'}
                    </button>
                  </div>
                  {householdError && <p className="px-2 pb-1 text-xs font-medium text-red-600">{householdError}</p>}
                </div>
              </div>
            </div>
          )}
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <Home className="w-4 h-4 text-teal-600" />
          <span className="font-medium text-slate-900">Your household</span>
          {user.household && <span className="hidden sm:inline text-slate-500">- {user.household}</span>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">

        <div className="relative">
          <button 
            onClick={() => setShowNotificationsMenu((curr) => !curr)} 
            className="relative p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Bell className="w-6 h-6 text-slate-600" />
            {notifications.length > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />}
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1rem))] bg-white rounded-lg shadow-xl border border-slate-200 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">{notifications.length} New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-4 text-sm text-slate-600">No medicine alerts right now.</div>
                )}
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  return (
                  <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        notif.type === 'alert' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <button 
                  onClick={() => {
                    setShowNotificationsMenu(false);
                    router.push('/reminders');
                  }} 
                  className="w-full text-center text-sm font-medium text-teal-700 hover:text-teal-800 py-1"
                >
                  View all reminders
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu((current) => !current)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white grid place-items-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-600" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
                <p className="text-xs text-teal-700 mt-1">Signed in with {user.authProvider}</p>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  router.replace('/signin');
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-slate-700 hover:bg-slate-50 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
