import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, MessageSquare, ChevronRight, LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Job Descriptions', icon: FileText, path: '/dashboard/jobs' },
  { label: 'Candidates', icon: Users, path: '/dashboard/candidates' },
  { label: 'Interview Assistant', icon: MessageSquare, path: '/dashboard/interview' },
];

function getUserInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'U';
}

function nameFromEmail(email: string) {
  return email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('talentiq_user');
    if (raw) {
      const u = JSON.parse(raw) as { full_name: string; email: string };
      return { full_name: u.full_name || nameFromEmail(u.email), email: u.email };
    }
  } catch {}
  return { full_name: '', email: '' };
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);
  const user = getStoredUser();
  const displayName = user.full_name || user.email || 'User';
  const initials = getUserInitials(displayName);

  const sidebarContent = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} onClick={onClose}>
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
              <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      localStorage.removeItem('talentiq_auth');
                      localStorage.removeItem('talentiq_user');
                      setPopupOpen(false);
                      onClose();
                      navigate('/login');
                    }}
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
          <Avatar initials={initials} size="sm" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — always visible on desktop, slide-in drawer on mobile */}
      <aside
        className={cn(
          'w-64 bg-white border-r border-border flex flex-col fixed left-0 top-16 bottom-0 z-40',
          'transition-transform duration-300 ease-in-out',
          // Desktop: always shown
          'md:translate-x-0',
          // Mobile: controlled by isOpen
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
