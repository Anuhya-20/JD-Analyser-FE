import { useState } from 'react';
import { Search, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

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
      <div className="flex items-center w-40 md:w-64 flex-shrink-0">
        <img
          src="https://storage.googleapis.com/bilvantis-website-buc/Header/Bilvantis%20logo.svg"
          alt="Bilvantis"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center px-4">
        <div className={`relative flex items-center w-full max-w-lg transition-all duration-200 ${searchFocused ? 'ring-2 ring-primary-500 ring-offset-0' : ''} rounded-lg`}>
          <Search size={16} className="absolute left-3 text-text-secondary" />
          <input
            type="text"
            placeholder="Search candidates, jobs, analyses..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:bg-white"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
      </div>
    </header>
  );
}
