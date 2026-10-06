import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Briefcase, CalendarCheck, MapPin, Star, UserCheck, CheckCircle2, Power } from 'lucide-react';
import { formatBDT, StatusBadge } from '@/components/ui/PriceDisplay';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availableWork, setAvailableWork] = useState<any[]>([]);
  const [stats, setStats] = useState({ income: 0, completed: 0 });
  
  // Provider features
  const [isOnline, setIsOnline] = useState(true);
  const [providerStats, setProviderStats] = useState<any>(null);
  const [customerStats, setCustomerStats] = useState<any>(null);
  
  // Rating state
  const [ratingInput, setRatingInput] = useState<{ [key: string]: { rating: number, comment: string } }>({});

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

      const { data: profile } = await supabase.from('profiles').select('average_rating, total_reviews').eq('id', user.id).single();
      if (profile) setCustomerStats(profile);
      
    } else if (userRole === 'provider') {
      // 1. Fetch Assigned Work
      const { data: assignments } = await supabase
        .from('assignments')
        .select('booking_id')
        .eq('provider_id', user.id);
      
      const bookingIds = assignments?.map(a => a.booking_id) || [];
      if (bookingIds.length > 0) {
        const { data: myBookings } = await supabase
          .from('bookings')
          .select(`*, services ( name, pricing_model )`)
          .in('id', bookingIds)
          .order('created_at', { ascending: false });
        if (myBookings) setBookings(myBookings);
      }

      // 2. Fetch Pending/Available Work
      const { data: available } = await supabase
        .from('bookings')
        .select(`*, services ( name, pricing_model )`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      if (available) setAvailableWork(available);

      // 3. Stats & Online Status
      const { data: incomeData } = await supabase.from('bookings').select('provider_amount').in('id', bookingIds).eq('status', 'completed');
      const totalIncome = incomeData ? incomeData.reduce((acc, curr) => acc + (curr.provider_amount || 0), 0) : 0;
      setStats({ income: totalIncome, completed: incomeData?.length || 0 });

      const { data: provProfile } = await supabase.from('provider_profiles').select('is_online, average_rating, total_reviews').eq('id', user.id).single();
      if (provProfile) {
        setIsOnline(provProfile.is_online);
        setProviderStats(provProfile);
      }
    }
  }

  const handleToggleOnline = async () => {
    const newVal = !isOnline;
    setIsOnline(newVal);
    await supabase.from('provider_profiles').update({ is_online: newVal }).eq('id', user?.id);
    fetchData();
  };

  const submitRating = async (bookingId: string, isProviderRatingCustomer: boolean) => {
    const ratingObj = ratingInput[bookingId] || { rating: 5, comment: '' };
    
    if (ratingObj.rating < 1 || ratingObj.rating > 5) {
      alert("১ থেকে ৫ এর মধ্যে রেটিং দিন।");
      return;
    }

    const updateData = isProviderRatingCustomer 
      ? { customer_rating: ratingObj.rating, customer_review_comment: ratingObj.comment }
      : { provider_rating: ratingObj.rating, provider_review_comment: ratingObj.comment };
      
    const { error } = await supabase.from('bookings').update(updateData).eq('id', bookingId);
    
    if (!error) {
      alert('রেটিং সফলভাবে জমা দেওয়া হয়েছে!');
      fetchData();
    } else {
      alert('রেটিং জমা দিতে সমস্যা হয়েছে: ' + error.message);
    }
  };

  // Remaining booking action functions (acceptWork, generateOTP, verifyOTP, completeBooking, handlePayment, handleLogout)
  const acceptWork = async (bookingId: string) => {
    const { error } = await supabase.rpc('accept_booking', {
      p_booking_id: bookingId,
      p_provider_id: user.id
    });
    if (!error) {
      alert('কাজটি সফলভাবে গ্রহণ করা হয়েছে!');
      fetchData();
    } else alert(error.message);
  };
  const generateOTP = async (bookingId: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { error } = await supabase.from('bookings').update({ otp_code: otp, otp_expires_at: new Date(Date.now() + 15*60000).toISOString() }).eq('id', bookingId);
    if (!error) fetchData();
  };
  const verifyOTP = async (bookingId: string) => {
    const code = prompt('কাস্টমারের কাছ থেকে প্রাপ্ত ৬-ডিজিটের OTP লিখুন:');
    if (!code) return;
    const booking = bookings.find(b => b.id === bookingId);
    if (booking?.otp_code === code) {
      const { error } = await supabase.from('bookings').update({ status: 'ongoing', otp_verified_at: new Date().toISOString() }).eq('id', bookingId);
      if (!error) { alert('OTP ভেরিফাই সফল! কাজ শুরু করুন।'); fetchData(); }
    } else alert('ভুল OTP!');
  };
  const completeBooking = async (bookingId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে কাজ সম্পন্ন হয়েছে?')) return;
    const { error } = await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    if (!error) fetchData();
  };
  const handlePayment = async (id: string, amountPoisha: number) => { 
    console.log(id, amountPoisha);
    const confirmReal = window.confirm(`AamarPay Payment Gateway integration is strictly BLOCKED pending Server Configuration.\n\nWould you like to process a Demo/Test Payment instead?`);
    if(confirmReal) {
      await supabase.from('bookings').update({ payment_status: 'paid' }).eq('id', id);
      alert("Demo Payment Successful!");
      fetchData();
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center text-slate-500 dark:text-slate-400">লোড হচ্ছে...</div>;

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 md:space-y-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10"><UserCheck className="w-32 h-32" /></div>
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">আপনার ড্যাশবোর্ড</h1>
            <p className="text-slate-300 font-medium text-sm flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                {role === 'customer' ? 'গ্রাহক একাউন্ট' : role === 'provider' ? 'প্রোভাইডার একাউন্ট' : role === 'admin' ? 'অ্যাডমিন একাউন্ট' : 'একাউন্ট'}
              </span>
              
              {role === 'provider' && providerStats && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" /> {providerStats.average_rating} ({providerStats.total_reviews} রিভিউ)
                </span>
              )}
              {role === 'customer' && customerStats && customerStats.total_reviews > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" /> {customerStats.average_rating} ({customerStats.total_reviews} রিভিউ)
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {role === 'provider' && (
              <Button 
                variant="outline" 
                className={`font-bold border-2 ${isOnline ? 'border-green-400 text-green-400 hover:bg-green-400/10' : 'border-slate-500 text-slate-400 hover:bg-slate-500/10'} bg-transparent`}
                onClick={handleToggleOnline}
              >
                <Power className="w-4 h-4 mr-2" /> {isOnline ? 'আপনি অনলাইনে আছেন' : 'আপনি অফলাইনে আছেন'}
              </Button>
            )}
            {role === 'admin' && (
              <Link to="/admin">
                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-900">
                  অ্যাডমিন প্যানেল
                </Button>
              </Link>
            )}
            <Link to="/profile">
              <Button size="sm" variant="outline" className="text-slate-800 border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                প্রোফাইল সেটিংস
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Provider Wallet/Earnings Summary */}
      {role === 'provider' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-full">
                <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">আপনার মোট আয়</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{formatBDT(stats.income)}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">সম্পন্ন কাজ</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">{stats.completed} টি</h3>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Customer Quick Links */}
      {role === 'customer' && (
        <div className="flex gap-4">
          <Link to="/#services" className="flex-1">
             <Button className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg font-bold">নতুন কাজ বুক করুন</Button>
          </Link>
          <Link to="/apply" className="flex-1">
             <Button variant="outline" className="w-full h-14 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700">পার্টনার হিসেবে আয় করুন</Button>
          </Link>
        </div>
      )}

      <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <CardContent className="p-6 md:p-8">
          
          {role === 'provider' && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">নতুন কাজের সুযোগ</h3>
              </div>
              
              {!isOnline ? (
                <div className="p-8 text-center bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-dashed border-amber-200 dark:border-amber-800">
                  <p className="text-amber-700 dark:text-amber-500 font-medium">আপনি বর্তমানে অফলাইনে আছেন। কাজ পেতে হলে উপরে থাকা বাটন থেকে অনলাইনে আসুন।</p>
                </div>
              ) : availableWork.length === 0 ? (
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

          <div className="pt-2">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-slate-50">{role === 'provider' ? 'আপনার চলমান ও সম্পন্ন কাজসমূহ' : 'আপনার বুকিং হিস্ট্রি'}</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">আপনার কোনো {role === 'provider' ? 'কাজ' : 'বুকিং'} নেই।</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(b => (
                  <div key={b.id} className="border border-slate-200 dark:border-slate-700 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-start bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="mb-4 md:mb-0 space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-xl text-slate-900 dark:text-slate-50">{b.services?.name}</p>
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

                      {/* Ratings Section */}
                      {b.status === 'completed' && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 max-w-md">
                          {role === 'customer' && b.provider_rating === null && (
                            <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">প্রোভাইডারের কাজ কেমন ছিল? (রেটিং দিন)</p>
                              <select 
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                onChange={(e) => setRatingInput({...ratingInput, [b.id]: { ...ratingInput[b.id], rating: parseInt(e.target.value) }})}
                                defaultValue={5}
                              >
                                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} স্টার</option>)}
                              </select>
                              <Input placeholder="মতামত (ঐচ্ছিক)" onChange={(e) => setRatingInput({...ratingInput, [b.id]: { ...ratingInput[b.id], comment: e.target.value }})} className="h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                              <Button size="sm" onClick={() => submitRating(b.id, false)} className="w-full">রেটিং জমা দিন</Button>
                            </div>
                          )}
                          {role === 'provider' && b.customer_rating === null && (
                            <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কাস্টমারের আচরণ কেমন ছিল? (রেটিং দিন)</p>
                              <select 
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                onChange={(e) => setRatingInput({...ratingInput, [b.id]: { ...ratingInput[b.id], rating: parseInt(e.target.value) }})}
                                defaultValue={5}
                              >
                                {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} স্টার</option>)}
                              </select>
                              <Input placeholder="মতামত (ঐচ্ছিক)" onChange={(e) => setRatingInput({...ratingInput, [b.id]: { ...ratingInput[b.id], comment: e.target.value }})} className="h-10 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" />
                              <Button size="sm" onClick={() => submitRating(b.id, true)} className="w-full">রেটিং জমা দিন</Button>
                            </div>
                          )}
                          
                          {((role === 'customer' && b.provider_rating !== null) || (role === 'provider' && b.customer_rating !== null)) && (
                            <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/10 inline-flex px-3 py-1.5 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800/30">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> আপনার রেটিং: {role === 'customer' ? b.provider_rating : b.customer_rating} স্টার
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-3 w-full md:w-auto md:min-w-[150px]">
                      <div className="text-left md:text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{role === 'provider' ? 'আপনার আয়' : 'মোট বিল'}</p>
                        <p className="font-extrabold text-2xl text-slate-900 dark:text-slate-50">{formatBDT(role === 'provider' ? b.provider_amount : b.total_price)}</p>
                      </div>
                      
                      {role === 'provider' && b.status === 'accepted' && !b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => generateOTP(b.id)}>OTP জেনারেট করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'accepted' && b.otp_code && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm" onClick={() => verifyOTP(b.id)}>OTP ভেরিফাই করুন</Button>
                      )}
                      {role === 'provider' && b.status === 'ongoing' && (
                        <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => completeBooking(b.id)}>কাজ সম্পন্ন করুন</Button>
                      )}

                      {role === 'customer' && b.status === 'completed' && b.payment_status === 'pending' && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={() => handlePayment(b.id, b.total_price)}>পেমেন্ট করুন</Button>
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
