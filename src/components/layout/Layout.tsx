import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toaster } from '@/components/ui/Toast';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-64 mt-16 min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-[85rem] mx-auto">
          <Outlet />
        </div>
      </main>
      <Toaster />
    </div>
  );
}
