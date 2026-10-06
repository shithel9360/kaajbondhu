import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import BookService from './pages/BookService';
import { lazy, Suspense } from 'react';
const ProviderApply = lazy(() => import('./pages/ProviderApply'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
import Profile from './pages/Profile';
import { ThemeProvider } from './components/theme-provider';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col font-sans overflow-x-hidden w-full max-w-[100vw] transition-colors duration-300">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <ErrorBoundary>
            <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>}>
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
            </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
