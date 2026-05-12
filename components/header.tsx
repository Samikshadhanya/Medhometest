'use client';

import { Bell, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/app-store';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, signOut, todayReminders, switchHousehold, addHousehold, medicines } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHouseholdMenu, setShowHouseholdMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [newHouseholdName, setNewHouseholdName] = useState('');

  // Generate some notifications from the data (and some dummy ones to ensure it looks populated as requested)
  const notifications = [
    { id: 1, type: 'alert', title: 'Skipped Dose', message: 'John missed his 8:00 AM Metformin.', time: '10 mins ago' },
    { id: 2, type: 'warning', title: 'Low Stock', message: 'Lisinopril is running low (4 pills left).', time: '1 hour ago' },
    { id: 3, type: 'info', title: 'Expiring Soon', message: 'Aspirin expires next month.', time: '2 days ago' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition">
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex items-center gap-2">
          <span className="text-sm text-slate-600 hidden sm:block">Selected Household</span>
          <button 
            onClick={() => setShowHouseholdMenu(!showHouseholdMenu)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition font-medium text-slate-900"
          >
            {user.household}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showHouseholdMenu && (
            <div className="absolute top-full left-0 sm:left-auto mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-20">
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
                      onClick={() => {
                        if (newHouseholdName.trim()) {
                          addHousehold(newHouseholdName.trim());
                          setNewHouseholdName('');
                          setShowHouseholdMenu(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 font-medium transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">

        <div className="relative">
          <button 
            onClick={() => setShowNotificationsMenu((curr) => !curr)} 
            className="relative p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <Bell className="w-6 h-6 text-slate-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <span className="text-xs font-medium bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        notif.type === 'alert' ? 'bg-red-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  router.push('/');
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
