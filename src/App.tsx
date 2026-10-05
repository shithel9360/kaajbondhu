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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 py-4 px-6 flex justify-between items-center transition-all">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl leading-none">
                ক
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">কাজ<span className="text-indigo-600">বন্ধু</span></h1>
            </Link>
            <div className="space-x-3">
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-full px-6 font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50">ড্যাশবোর্ড</Button>
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
  );
}

export default App;
