import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Briefcase, CalendarCheck } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availableWork, setAvailableWork] = useState<any[]>([]);
  const [stats, setStats] = useState({ income: 0, completed: 0 });

  useEffect(() => {
    fetchData();
  }, [navigate]);

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setUser(user);

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const userRole = roleData ? roleData.role : 'customer';
    setRole(userRole);

    if (userRole === 'customer') {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`*, services ( name, base_price )`)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (bookingsData) setBookings(bookingsData);
    } 
    else if (userRole === 'provider') {
      const { data: workData } = await supabase
        .from('bookings')
        .select(`*, services ( name, base_price )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (workData) setAvailableWork(workData);
      
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select(`*, bookings (*, services ( name, base_price ))`)
        .eq('provider_id', user.id);
      
      if (assignmentData) {
        const activeBookings = assignmentData.map((a: any) => a.bookings).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setBookings(activeBookings);

        // Calculate income (assuming 80% provider cut)
        const completed = activeBookings.filter((b: any) => ['paid', 'review_pending', 'closed'].includes(b.status));
        const totalIncome = completed.reduce((sum: number, b: any) => sum + (b.total_price * 0.8), 0);
        setStats({ income: totalIncome, completed: completed.length });
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const acceptWork = async (bookingId: string) => {
    const { error: err1 } = await supabase.from('assignments').insert({
      booking_id: bookingId,
      provider_id: user.id,
      status: 'accepted'
    });
    
    if (!err1) {
      await updateBookingStatus(bookingId, 'provider_selected');
    } else {
      alert('দুঃখিত, কাজটি গ্রহণ করা সম্ভব হয়নি: ' + err1.message);
    }
  };

  const updateBookingStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert('Error updating status: ' + error.message);
    }
  };

  const handlePayment = async (id: string) => {
    alert('AamarPay পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে... (Dummy)');
    setTimeout(() => {
      alert('পেমেন্ট সফল হয়েছে!');
      updateBookingStatus(id, 'paid');
    }, 1500);
  };

  const handleReview = async (id: string) => {
    const review = prompt('সার্ভিসটি কেমন লাগলো? রেটিং (১-৫) এবং মন্তব্য লিখুন:');
    if (review) {
      alert('রিভিউ জমা দেওয়ার জন্য ধন্যবাদ!');
      updateBookingStatus(id, 'closed');
    }
  };

  if (!user) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-8 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-500 mt-1">স্বাগতম, {user.user_metadata?.full_name || user.email}</p>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleLogout}>
          লগআউট করুন
        </Button>
      </div>

      {role === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-indigo-100 font-medium">মোট আয়</p>
                <h3 className="text-3xl font-bold">৳ {(stats.income / 100).toFixed(0)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-gray-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Briefcase className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500 font-medium">সম্পন্ন করা কাজ</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.completed} টি</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
              {role === 'customer' ? 'গ্রাহক একাউন্ট' : role === 'provider' ? 'সার্ভিস প্রোভাইডার একাউন্ট' : role === 'admin' ? 'অ্যাডমিন একাউন্ট' : 'একাউন্ট'}
            </span>
            
            {role === 'admin' && (
              <Link to="/admin">
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  অ্যাডমিন প্যানেলে যান
                </Button>
              </Link>
            )}
            
            {role === 'customer' && (
              <Link to="/apply">
                <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  প্রোভাইডার হিসেবে কাজ করুন
                </Button>
              </Link>
            )}
          </div>
          
          {role === 'provider' && (
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <CalendarCheck className="w-6 h-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">নতুন কাজের সুযোগ</h3>
              </div>
              {availableWork.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500">এই মুহূর্তে আপনার এলাকায় কোনো নতুন কাজ নেই।</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableWork.map(w => (
                    <div key={w.id} className="border border-indigo-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                      <div className="mb-4 md:mb-0">
                        <p className="font-bold text-lg text-indigo-900">{w.services?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">📍 ঠিকানা: {w.address}</p>
                        <p className="text-sm text-gray-600">🕒 সময়: {new Date(w.scheduled_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                        <p className="font-extrabold text-xl text-indigo-700 mb-2">৳ {(w.total_price / 100).toFixed(0)}</p>
                        <Button onClick={() => acceptWork(w.id)} className="bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto shadow-md">কাজটি গ্রহণ করুন</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{role === 'provider' ? 'আপনার চলমান কাজসমূহ' : 'আপনার বুকিং সমূহ'}</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">আপনার কোনো {role === 'provider' ? 'কাজ' : 'বুকিং'} নেই।</p>
                {role === 'customer' && (
                  <Link to="/">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">নতুন সার্ভিস বুক করুন</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="border border-gray-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 md:mb-0">
                      <p className="font-bold text-lg text-gray-900">{b.services?.name}</p>
                      <p className="text-sm text-gray-600 mt-1">📍 ঠিকানা: {b.address}</p>
                      <p className="text-sm text-gray-600 mb-3">🕒 সময়: {new Date(b.scheduled_at).toLocaleString('bn-BD')}</p>
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                      <p className="font-extrabold text-2xl text-gray-900">৳ {(b.total_price / 100).toFixed(0)}</p>
                      
                      {/* Provider Actions */}
                      {role === 'provider' && b.status === 'provider_selected' && (
                        <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-sm" onClick={() => updateBookingStatus(b.id, 'in_progress')}>কাজ শুরু করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'in_progress' && (
                        <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => updateBookingStatus(b.id, 'completed')}>কাজ সম্পন্ন করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'completed' && (
                        <Button className="w-full md:w-auto" variant="outline" onClick={() => updateBookingStatus(b.id, 'payment_pending')}>পেমেন্ট রিকোয়েস্ট পাঠান</Button>
                      )}

                      {/* Customer Actions */}
                      {role === 'customer' && b.status === 'payment_pending' && (
                        <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => handlePayment(b.id)}>পেমেন্ট করুন (AamarPay)</Button>
                      )}
                      {role === 'customer' && b.status === 'paid' && (
                        <Button className="w-full md:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50" variant="outline" onClick={() => handleReview(b.id)}>রিভিউ দিন</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
