import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pill, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navLinks = [
    { name: 'لوحة التحكم', href: '/dashboard' },
    { name: 'المخزون', href: '/inventory' },
    { name: 'الأسعار', href: '/pricing' },
  ];
  const isHome = location.pathname === '/';
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
      isHome ? "bg-transparent border-transparent" : "bg-background/95 border-border"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-pharmav-primary/10 group-hover:bg-pharmav-primary/20 transition-colors">
              <Pill className="h-6 w-6 text-pharmav-primary" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              فارما<span className="text-pharmav-primary">فولت</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-pharmav-primary",
                  location.pathname === link.href ? "text-pharmav-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 border-r pr-8 mr-4 border-border">
              <ThemeToggle className="static" />
              <Button asChild className="rounded-full px-6 bg-pharmav-primary hover:bg-pharmav-primary/90 font-bold">
                <Link to="/dashboard">ابدأ الآن</Link>
              </Button>
            </div>
          </nav>
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle className="static" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-muted-foreground"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-in slide-in-from-top duration-300 bg-background border-b px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-lg font-medium px-4 py-2 hover:bg-muted rounded-lg"
            >
              {link.name}
            </Link>
          ))}
          <Button asChild className="w-full rounded-lg font-bold">
            <Link to="/dashboard">ابدأ الآن</Link>
          </Button>
        </div>
      )}
    </header>
  );
}