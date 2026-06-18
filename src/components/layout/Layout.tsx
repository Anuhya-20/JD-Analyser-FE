import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AICopilot } from '@/components/AICopilot';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main className="ml-64 mt-16 min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-[85rem] mx-auto">
          <Outlet />
        </div>
      </main>
      <AICopilot />
    </div>
  );
}
