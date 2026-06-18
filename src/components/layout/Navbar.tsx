import { useState } from 'react';
import { Search } from 'lucide-react';

export function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center px-6 fixed top-0 left-0 right-0 z-40 shadow-sm">
      {/* Logo */}
      <div className="flex items-center w-64">
        <img
          src="https://storage.googleapis.com/bilvantis-website-buc/Header/Bilvantis%20logo.svg"
          alt="Bilvantis"
          className="h-8 w-auto object-contain"
        />
      </div>

      {/* Search */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-lg px-4">
        <div className={`relative flex items-center transition-all duration-200 ${searchFocused ? 'ring-2 ring-primary-500 ring-offset-0' : ''} rounded-lg`}>
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
