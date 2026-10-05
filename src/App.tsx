import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import BookService from './pages/BookService';
import ProviderApply from './pages/ProviderApply';
import AdminDashboard from './pages/AdminDashboard';
import { Button } from './components/ui/button';
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b py-4 px-6 shadow-sm flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-bold text-blue-600">কাজবন্ধু</h1>
          </Link>
          <div className="space-x-2">
            <Link to="/dashboard"><Button variant="outline">ড্যাশবোর্ড</Button></Link>
          </div>
        </header>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookService />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<ProviderApply />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
