'use client';

import { useEffect, useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const syncSidebar = () => setSidebarOpen(media.matches);

    syncSidebar();
    media.addEventListener('change', syncSidebar);
    return () => media.removeEventListener('change', syncSidebar);
  }, []);

  return (
    <div className="app-shell flex bg-slate-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="min-h-0 flex-1 overflow-auto app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
