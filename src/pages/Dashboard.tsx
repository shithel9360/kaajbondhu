import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Briefcase, CalendarCheck, MapPin } from 'lucide-react';
import { formatBDT, StatusBadge } from '@/components/ui/PriceDisplay';

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

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
    const userRole = roleData ? roleData.role : 'customer';
    setRole(userRole);

    if (userRole === 'customer') {
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`*, services ( name, base_price, pricing_model )`)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (bookingsData) setBookings(bookingsData);
    } 
    else if (userRole === 'provider') {
      const { data: workData } = await supabase
        .from('bookings')
        .select(`*, services ( name, base_price, pricing_model )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (workData) setAvailableWork(workData);
      
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select(`*, bookings (*, services ( name, base_price, pricing_model ))`)
        .eq('provider_id', user.id);
      
      if (assignmentData) {
        const activeBookings = assignmentData.map((a: any) => a.bookings).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setBookings(activeBookings);

        const { data: ledger } = await supabase.from('financial_ledger').select('amount_poisha').eq('user_id', user.id).eq('type', 'provider_payable');
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
    } else alert('দুঃখিত, কাজটি গ্রহণ করা সম্ভব হয়নি: ' + error.message);
  };

  const generateOTP = async (bookingId: string) => {
    const { error } = await supabase.rpc('generate_booking_otp', { target_booking_id: bookingId });
    if (!error) {
      alert('কাস্টমারকে এই OTP টি প্রদান করতে বলুন।');
      fetchData();
    } else alert('OTP জেনারেট করতে সমস্যা: ' + error.message);
  };

  const verifyOTP = async (bookingId: string) => {
    const otp = prompt('কাস্টমারের কাছ থেকে পাওয়া ৪-ডিজিটের OTP দিন:');
    if (!otp) return;

    const { error } = await supabase.rpc('verify_booking_otp', { target_booking_id: bookingId, submitted_otp: otp });
    if (!error) {
      alert('OTP ভেরিফাইড! কাজ শুরু হয়েছে।');
      fetchData();
    } else alert('ভুল OTP বা মেয়াদ শেষ: ' + error.message);
  };

  const completeBooking = async (bookingId: string) => {
    const { error } = await supabase.rpc('complete_booking', { target_booking_id: bookingId });
    if (!error) {
      alert('কাজ সম্পন্ন হয়েছে! পেমেন্ট ড্যাশবোর্ডে যোগ হয়েছে।');
      fetchData();
    } else alert('সমস্যা: ' + error.message);
  };

    const handlePayment = async (id: string, amountPoisha: number) => {
    // SECURITY BARRIER: Real production implementation
    // Client MUST NOT update payment_status directly.
    // 1. Call secure backend Edge Function to initialize AamarPay session.
    // 2. Redirect to AamarPay URL returned by Edge Function.
    // 3. AamarPay calls Webhook Edge Function on success -> Webhook updates DB.
    
    const confirmReal = window.confirm('AamarPay Payment Gateway integration is strictly BLOCKED pending Server Configuration.

Would you like to process a Demo/Test Payment instead?');
    
    if (confirmReal) {
      alert('TEST/DEMO PAYMENT INITIATED.

Note: In a real environment, this connects to Supabase Edge Function 'payment-webhook'.');
      // Secure architecture placeholder - in demo we fake the webhook success via RPC or direct call just for testing the UI flow, 
      // but in real production, the webhook does this. We use a secure mock RPC if available, or just throw alert.
      alert('Mock Payment Successful (Client-Simulated).');
    }
  };

  if (!user) return <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl mt-8 mb-20 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ড্যাশবোর্ড</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">স্বাগতম, {user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile">
            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:bg-slate-900">
              প্রোফাইল
            </Button>
          </Link>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20" onClick={handleLogout}>
            লগআউট
          </Button>
        </div>
      </div>

      {role === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-500 text-white border-0 shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-full">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-blue-50 font-medium">মোট আয় (অ্যাভেলেবল)</p>
                <h3 className="text-4xl font-bold">{formatBDT(stats.income)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">সম্পন্ন করা কাজ</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{stats.completed} টি</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-lg border-0 bg-white dark:bg-slate-800">
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold tracking-wide border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              {role === 'customer' ? 'গ্রাহক একাউন্ট' : role === 'provider' ? 'প্রোভাইডার একাউন্ট' : role === 'admin' ? 'অ্যাডমিন একাউন্ট' : 'একাউন্ট'}
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
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-900">
                  প্রোভাইডার হিসেবে কাজ করুন
                </Button>
              </Link>
            )}
          </div>
          
          {role === 'provider' && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">নতুন কাজের সুযোগ</h3>
              </div>
              {availableWork.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">এই মুহূর্তে আপনার এলাকায় কোনো নতুন কাজ নেই।</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableWork.map(w => (
                    <div key={w.id} className="border border-blue-100 dark:border-slate-700 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                      <div className="mb-4 md:mb-0 space-y-1.5">
                        <p className="font-bold text-xl text-slate-900 dark:text-slate-50">{w.services?.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> লোকেশন: বিস্তারিত ঠিকানা গ্রহণের পর দৃশ্যমান হবে
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          🕒 সময়: {new Date(w.scheduled_at).toLocaleString('bn-BD')}
                        </p>
                      </div>
                      <div className="text-left md:text-right w-full md:w-auto">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{w.services?.pricing_model === 'starting_at' ? 'আনুমানিক বিল' : 'বুকিং মূল্য'}</p>
                        <p className="font-extrabold text-2xl text-blue-600 dark:text-blue-400 mb-3">{formatBDT(w.total_price)}</p>
                        <Button onClick={() => acceptWork(w.id)} className="bg-blue-600 hover:bg-blue-700 w-full shadow-md text-white">কাজটি গ্রহণ করুন</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{role === 'provider' ? 'আপনার চলমান কাজসমূহ' : 'আপনার বুকিং সমূহ'}</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 mb-4">আপনার কোনো {role === 'provider' ? 'কাজ' : 'বুকিং'} নেই।</p>
                {role === 'customer' && (
                  <Link to="/">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">নতুন সার্ভিস বুক করুন</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 md:mb-0 space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-xl text-slate-900 dark:text-white">{b.services?.name}</p>
                        <StatusBadge status={b.status} type="booking" />
                        <StatusBadge status={b.payment_status} type="payment" />
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <a href={`https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> {b.address}
                        </a>
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">🕒 {new Date(b.scheduled_at).toLocaleString('bn-BD')}</p>
                      
                      {role === 'customer' && b.otp_code && b.status === 'accepted' && (
                        <div className="mt-3 inline-block bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-800">
                          <p className="text-red-700 dark:text-red-400 font-bold text-sm mb-1">প্রোভাইডারকে এই OTP দিন</p>
                          <p className="text-3xl font-mono text-red-600 dark:text-red-300 tracking-widest">{b.otp_code}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">মোট বিল</p>
                        <p className="font-extrabold text-2xl text-slate-900 dark:text-white">{formatBDT(b.total_price)}</p>
                      </div>
                      
                      {/* Provider Actions */}
                      {role === 'provider' && b.status === 'accepted' && !b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => generateOTP(b.id)}>OTP জেনারেট করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'accepted' && b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => verifyOTP(b.id)}>OTP ভেরিফাই করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'ongoing' && (
                        <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => completeBooking(b.id)}>কাজ সম্পন্ন করুন</Button>
                      )}

                      {/* Customer Actions */}
                      {role === 'customer' && b.status === 'completed' && b.payment_status === 'pending' && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={() => handlePayment(b.id, b.total_price)}>পেমেন্ট করুন (AamarPay)</Button>
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
