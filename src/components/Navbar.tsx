import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { supabase } from '../lib/supabase';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="container mx-auto px-4 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg p-1">
          <img src="/kaajbondhu-logo.jpg" alt="KaajBondhu Logo" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shadow-sm" />
          <div className="hidden sm:block">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-none">
              কাজ<span className="text-blue-600 dark:text-blue-400">বন্ধু</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wider">বিশ্বস্ত মানুষ, সহজে কাজ</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">হোম</Link>
          <a href="/#services" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">সার্ভিস সমূহ</a>
          <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">কীভাবে কাজ করে</a>
          <Link to="/apply" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">পার্টনার হোন</Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <ModeToggle />
          {session ? (
            <Link to="/dashboard">
              <Button variant="outline" className="font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-50">
                ড্যাশবোর্ড
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
                  লগইন
                </Button>
              </Link>
              <Link to="/#services">
                <Button className="font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-full px-6 shadow-md transition-transform hover:-translate-y-0.5">
                  সার্ভিস বুক করুন
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle & Actions */}
        <div className="flex lg:hidden items-center gap-2 sm:gap-4">
          <ModeToggle />
          {session ? (
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="font-semibold border-slate-200 dark:border-slate-700">
                ড্যাশ
              </Button>
            </Link>
          ) : (
            <Link to="/#services">
              <Button size="sm" className="font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 rounded-full">
                বুক করুন
              </Button>
            </Link>
          )}
          <button 
            className="p-2 text-slate-600 dark:text-slate-300 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl animate-in slide-in-from-top-2 flex flex-col p-4 gap-4">
          <Link to="/" className="text-base font-medium text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">হোম</Link>
          <a href="/#services" className="text-base font-medium text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">সার্ভিস সমূহ</a>
          <a href="/#how-it-works" className="text-base font-medium text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">কীভাবে কাজ করে</a>
          <Link to="/apply" className="text-base font-medium text-slate-700 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">পার্টনার হোন</Link>
          {!session && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full justify-center">লগইন</Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white">রেজিস্টার</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
