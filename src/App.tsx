import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import BookService from './pages/BookService';
import ProviderApply from './pages/ProviderApply';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { ModeToggle } from './components/mode-toggle';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col font-sans overflow-x-hidden w-full max-w-[100vw] transition-colors duration-300">
          <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 py-3 px-3 sm:px-6 flex justify-between items-center transition-all shadow-sm">
            <div className="container mx-auto flex justify-between items-center">
              <Link to="/" className="flex items-center gap-1 sm:gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 rounded-md">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl leading-none shadow-sm">
                  ক
                </div>
                <h1 className="text-lg sm:text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">কাজ<span className="text-blue-600 dark:text-blue-400">বন্ধু</span></h1>
              </Link>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <ModeToggle />
                <Link to="/dashboard" className="focus:outline-none">
                  <Button variant="outline" className="px-2 sm:px-6 text-sm sm:text-base font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-blue-400 bg-transparent">
                    <span className="hidden sm:inline">ড্যাশবোর্ড</span><span className="sm:hidden">ড্যাশ</span>
                  </Button>
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookService />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/apply" element={<ProviderApply />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
