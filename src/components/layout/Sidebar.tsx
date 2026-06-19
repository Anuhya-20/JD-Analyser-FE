import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Users, MessageSquare, ChevronRight, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Job Descriptions', icon: FileText, path: '/dashboard/jobs' },
  { label: 'Candidates', icon: Users, path: '/dashboard/candidates' },
  { label: 'Shortlisted', icon: Star, path: '/dashboard/shortlisted' },
  { label: 'Interview Assistant', icon: MessageSquare, path: '/dashboard/interview' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const sidebarContent = (
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
                  ? 'text-white bg-white/20 shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon className="text-current" size={18} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="ml-auto text-white/70" size={14} />}
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
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
          'w-80 bg-primary-600 flex flex-col fixed left-0 top-16 bottom-0 z-40',
          'transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
