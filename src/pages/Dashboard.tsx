import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [availableWork, setAvailableWork] = useState<any[]>([]);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      const userRole = roleData ? roleData.role : 'customer';
      setRole(userRole);

      if (userRole === 'customer') {
        // Fetch customer bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`*, services ( name, base_price )`)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });
        if (bookingsData) setBookings(bookingsData);
      } 
      else if (userRole === 'provider') {
        // Fetch available work (pending bookings)
        const { data: workData } = await supabase
          .from('bookings')
          .select(`*, services ( name, base_price )`)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        if (workData) setAvailableWork(workData);
        
        // Fetch provider's active assignments
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select(`*, bookings (*, services ( name, base_price ))`)
          .eq('provider_id', user.id);
        
        if (assignmentData) {
          // map to same format as bookings for simple rendering
          const activeBookings = assignmentData.map((a: any) => a.bookings);
          setBookings(activeBookings);
        }
      }
    }
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const acceptWork = async (bookingId: string) => {
    // Upsert assignment and change booking status
    const { error: err1 } = await supabase.from('assignments').insert({
      booking_id: bookingId,
      provider_id: user.id,
      status: 'accepted'
    });
    
    if (!err1) {
      await supabase.from('bookings').update({ status: 'provider_selected' }).eq('id', bookingId);
      alert('কাজটি আপনি গ্রহণ করেছেন!');
      window.location.reload();
    } else {
      alert('দুঃখিত, কাজটি গ্রহণ করা সম্ভব হয়নি: ' + err1.message);
    }
  };

  if (!user) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex justify-between items-center">
            ড্যাশবোর্ড
            <Button variant="destructive" onClick={handleLogout} size="sm">
              লগআউট
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-gray-600">স্বাগতম, <span className="font-semibold text-gray-900">{user.user_metadata?.full_name || user.email}</span></p>
            <p className="text-sm text-gray-500">আপনার একাউন্টের ধরন: {role === 'customer' ? 'গ্রাহক' : role === 'provider' ? 'সার্ভিস প্রোভাইডার' : role === 'admin' ? 'অ্যাডমিন' : 'গ্রাহক'}</p>
            
            {role === 'admin' && (
              <Link to="/admin">
                <Button variant="outline" className="mt-4 mr-2 text-red-600 border-red-600">
                  অ্যাডমিন প্যানেল
                </Button>
              </Link>
            )}
            
            {role === 'customer' && (
              <Link to="/apply">
                <Button variant="outline" className="mt-4 text-blue-600 border-blue-600">
                  প্রোভাইডার হিসেবে কাজ করুন
                </Button>
              </Link>
            )}
          </div>
          
          {role === 'provider' && (
            <div className="pt-4 border-t">
              <h3 className="text-xl font-bold mb-4 text-green-700">নতুন কাজের সুযোগ</h3>
              {availableWork.length === 0 ? (
                <p className="text-gray-500">এই মুহূর্তে কোনো নতুন কাজ নেই।</p>
              ) : (
                <div className="space-y-4">
                  {availableWork.map(w => (
                    <div key={w.id} className="border p-4 rounded-lg flex justify-between items-center bg-green-50">
                      <div>
                        <p className="font-bold text-lg">{w.services?.name}</p>
                        <p className="text-sm text-gray-700">ঠিকানা: {w.address}</p>
                        <p className="text-sm text-gray-700">সময়: {new Date(w.scheduled_at).toLocaleString('bn-BD')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700 mb-2">৳ {(w.total_price / 100).toFixed(0)}</p>
                        <Button onClick={() => acceptWork(w.id)} className="bg-green-600 hover:bg-green-700">কাজটি নিন</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-xl font-bold mb-4">{role === 'provider' ? 'আপনার চলমান কাজসমূহ' : 'আপনার বুকিং সমূহ'}</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">আপনার কোনো {role === 'provider' ? 'কাজ' : 'বুকিং'} নেই।</p>
                {role === 'customer' && (
                  <Link to="/">
                    <Button>নতুন সার্ভিস বুক করুন</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="border p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg">{b.services?.name}</p>
                      <p className="text-sm text-gray-500">ঠিকানা: {b.address}</p>
                      <p className="text-sm text-gray-500">সময়: {new Date(b.scheduled_at).toLocaleString('bn-BD')}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2 capitalize">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                      <p className="font-bold text-gray-700">৳ {(b.total_price / 100).toFixed(0)}</p>
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
