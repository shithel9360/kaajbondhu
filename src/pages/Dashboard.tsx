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
      
      if (roleData) {
        setRole(roleData.role);
      } else {
        setRole('customer'); // fallback
      }

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          *,
          services ( name, base_price )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
        
      if (bookingsData) {
        setBookings(bookingsData);
      }
    }
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
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
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-xl font-bold mb-4">আপনার বুকিং সমূহ</h3>
            {bookings.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">আপনার কোনো বুকিং নেই।</p>
                <Link to="/">
                  <Button>নতুন সার্ভিস বুক করুন</Button>
                </Link>
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
                        {b.status}
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
