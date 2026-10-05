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

        // Calculate income from ledger
        const { data: ledger } = await supabase
          .from('financial_ledger')
          .select('amount_poisha')
          .eq('user_id', user.id)
          .eq('type', 'provider_payable');
          
        const totalIncome = ledger ? ledger.reduce((acc, row) => acc + row.amount_poisha, 0) : 0;
        
        const completed = activeBookings.filter((b: any) => ['completed'].includes(b.status));
        setStats({ income: totalIncome, completed: completed.length });
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const acceptWork = async (bookingId: string) => {
    const { error } = await supabase.rpc('accept_booking', { target_booking_id: bookingId });
    if (!error) {
      alert('কাজটি সফলভাবে গ্রহণ করা হয়েছে!');
      fetchData();
    } else {
      alert('দুঃখিত, কাজটি গ্রহণ করা সম্ভব হয়নি: ' + error.message);
    }
  };

  const generateOTP = async (bookingId: string) => {
    const { error } = await supabase.rpc('generate_booking_otp', { target_booking_id: bookingId });
    if (!error) {
      alert('কাস্টমারকে এই OTP টি প্রদান করতে বলুন।');
      fetchData();
    } else {
      alert('OTP জেনারেট করতে সমস্যা: ' + error.message);
    }
  };

  const verifyOTP = async (bookingId: string) => {
    const otp = prompt('কাস্টমারের কাছ থেকে পাওয়া ৪-ডিজিটের OTP দিন:');
    if (!otp) return;

    const { error } = await supabase.rpc('verify_booking_otp', { target_booking_id: bookingId, submitted_otp: otp });
    if (!error) {
      alert('OTP ভেরিফাইড! কাজ শুরু হয়েছে।');
      fetchData();
    } else {
      alert('ভুল OTP বা মেয়াদ শেষ: ' + error.message);
    }
  };

  const completeBooking = async (bookingId: string) => {
    const { error } = await supabase.rpc('complete_booking', { target_booking_id: bookingId });
    if (!error) {
      alert('কাজ সম্পন্ন হয়েছে! পেমেন্ট ড্যাশবোর্ডে যোগ হয়েছে।');
      fetchData();
    } else {
      alert('সমস্যা: ' + error.message);
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ payment_status: newStatus }).eq('id', id);
    if (!error) fetchData();
  };

  const handlePayment = async (id: string) => {
    alert('AamarPay পেমেন্ট গেটওয়েতে রিডাইরেক্ট করা হচ্ছে... (Dummy)');
    setTimeout(() => {
      alert('পেমেন্ট সফল হয়েছে!');
      updatePaymentStatus(id, 'paid');
    }, 1500);
  };

  if (!user) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-8 mb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
          <p className="text-gray-500 mt-1">স্বাগতম, {user.email}</p>
        </div>
        <div className="flex items-center">
          <Link to="/profile">
            <Button variant="outline" className="mr-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              আমার প্রোফাইল
            </Button>
          </Link>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleLogout}>
            লগআউট করুন
          </Button>
        </div>
      </div>

      {role === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-indigo-100 font-medium">মোট আয় (অ্যাভেলেবল)</p>
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
                    <div key={w.id} className="border border-indigo-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-indigo-50/50">
                      <div className="mb-4 md:mb-0">
                        <p className="font-bold text-lg text-indigo-900">{w.services?.name}</p>
                        {/* Hidden detailed address to protect privacy until accepted */}
                        <p className="text-sm text-gray-600 mt-1">📍 লোকেশন: বিস্তারিত ঠিকানা গ্রহণের পর দৃশ্যমান হবে</p>
                        <p className="text-sm text-gray-600">🕒 সময়: {new Date(w.scheduled_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="text-right w-full md:w-auto">
                        <p className="font-extrabold text-xl text-indigo-700 mb-2">৳ {(w.total_price / 100).toFixed(0)}</p>
                        <Button onClick={() => acceptWork(w.id)} className="bg-indigo-600 hover:bg-indigo-700 w-full shadow-md">কাজটি গ্রহণ করুন</Button>
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
                  <div key={b.id} className="border border-gray-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm">
                    <div className="mb-4 md:mb-0 space-y-1">
                      <p className="font-bold text-lg text-gray-900">{b.services?.name}</p>
                      <p className="text-sm text-gray-600">
                        📍 ঠিকানা: <a href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">{b.address}</a>
                      </p>
                      <p className="text-sm text-gray-600 mb-2">🕒 সময়: {new Date(b.scheduled_at).toLocaleString('bn-BD')}</p>
                      
                      <div className="flex gap-2">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-100">
                          {b.status}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${b.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                          Payment: {b.payment_status}
                        </span>
                      </div>
                      
                      {role === 'customer' && b.otp_code && b.status === 'accepted' && (
                        <p className="text-red-600 font-bold mt-2">আপনার সিক্রেট OTP: {b.otp_code}</p>
                      )}
                    </div>
                    
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                      <p className="font-extrabold text-2xl text-gray-900">৳ {(b.total_price / 100).toFixed(0)}</p>
                      
                      {/* Provider Actions */}
                      {role === 'provider' && b.status === 'accepted' && !b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => generateOTP(b.id)}>কাস্টমারকে OTP পাঠান</Button>
                      )}
                      {role === 'provider' && b.status === 'accepted' && b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => verifyOTP(b.id)}>OTP ভেরিফাই করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'ongoing' && (
                        <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => completeBooking(b.id)}>কাজ সম্পন্ন করুন</Button>
                      )}

                      {/* Customer Actions */}
                      {role === 'customer' && b.status === 'completed' && b.payment_status === 'pending' && (
                        <Button className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => handlePayment(b.id)}>পেমেন্ট করুন (AamarPay)</Button>
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
