import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src="/kaajbondhu-logo.jpg" alt="KaajBondhu Logo" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-none">
                  কাজ<span className="text-blue-600 dark:text-blue-400">বন্ধু</span>
                </h2>
              </div>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              বাংলাদেশের সবচেয়ে নির্ভরযোগ্য হোম সার্ভিস প্ল্যাটফর্ম। বিশ্বস্ত মানুষ, সহজে কাজ। 
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">কোম্পানি</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">আমাদের সম্পর্কে</Link></li>
              <li><a href="/#how-it-works" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">কীভাবে কাজ করে</a></li>
              <li><Link to="/apply" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">পার্টনার হোন</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">সার্ভিস</h3>
            <ul className="space-y-3">
              <li><a href="/#services" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">এসি সার্ভিসিং</a></li>
              <li><a href="/#services" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">প্লাম্বিং</a></li>
              <li><a href="/#services" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">ইলেকট্রিক্যাল</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4">লিগ্যাল</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">প্রাইভেসি পলিসি</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">শর্তাবলী</a></li>
              <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">লগইন</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} KaajBondhu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
