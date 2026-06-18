import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, Brain,
  MessageSquare, BarChart3, ChevronRight, LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Job Descriptions', icon: FileText, path: '/dashboard/jobs' },
  { label: 'Candidates', icon: Users, path: '/dashboard/candidates' },
  { label: 'AI Analysis', icon: Brain, path: '/dashboard/ai-processing' },
  { label: 'Interview Assistant', icon: MessageSquare, path: '/dashboard/interview' },
  { label: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
];

export function Sidebar() {
  const location = useLocation();
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col fixed left-0 top-16 bottom-0 z-30">
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                )}
              >
                <item.icon className={cn('w-4.5 h-4.5', isActive ? 'text-primary-600' : 'text-current')} size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="ml-auto text-primary-400" size={14} />}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border relative">
        <AnimatePresence>
          {popupOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
              {/* Popup */}
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">Niharika B.</p>
                  <p className="text-xs text-text-secondary">Niharika.Bandila@bilvantis.io</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setPopupOpen(false)}
                  >
                    <LogOut size={15} />
                    <span>Log out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150',
            popupOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
          )}
          onClick={() => setPopupOpen(v => !v)}
        >
          <Avatar initials="NB" size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-text-primary truncate">Niharika B.</p>
            <p className="text-xs text-text-secondary truncate">Niharika.Bandila@bilvantis.io</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
