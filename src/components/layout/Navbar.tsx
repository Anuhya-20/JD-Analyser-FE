import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
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
    </header>
  );
}
