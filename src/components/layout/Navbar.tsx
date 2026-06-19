import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { BASE_URL } from '@/lib/api';

interface NavbarProps {
  onMenuClick: () => void;
}

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

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const [popupOpen, setPopupOpen] = useState(false);
  const user = getStoredUser();
  const displayName = user.full_name || user.email || 'User';
  const initials = getUserInitials(displayName);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-4 md:px-6 fixed top-0 left-0 right-0 z-40 shadow-sm">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-1 mr-2 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <img
          src="https://storage.googleapis.com/bilvantis-website-buc/Header/Bilvantis%20logo.svg"
          alt="Bilvantis"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User section */}
      <div className="relative">
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-150"
          onClick={() => setPopupOpen(v => !v)}
        >
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-text-primary leading-tight">{displayName}</p>
            <p className="text-xs text-text-secondary leading-tight">{user.email}</p>
          </div>
          <Avatar initials={initials} size="sm" />
        </button>

        <AnimatePresence>
          {popupOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPopupOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
                <div className="p-2">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem('talentiq_auth_token');
                        await fetch(`${BASE_URL}/api/v1/auth/logout`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                          },
                        });
                      } catch { /* proceed with logout regardless */ }
                      localStorage.clear();
                      setPopupOpen(false);
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
      </div>
    </header>
  );
}
