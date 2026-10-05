import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, Wallet } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, platformIncome: 0, totalProviders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (roleData?.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      fetchDashboardData();
    }
    checkAdmin();
  }, [navigate]);

  async function fetchDashboardData() {
    // Fetch pending providers
    const { data: provs } = await supabase
      .from('provider_profiles')
      .select('*, auth_users:id(email)')
      .eq('status', 'pending_approval');
    if (provs) setProviders(provs);

    // Fetch stats
    const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact' });
    const { count: pCount } = await supabase.from('provider_profiles').select('*', { count: 'exact' }).eq('status', 'approved');
    
    // Calculate platform income (20% of all paid/completed bookings)
    const { data: paidBookings } = await supabase
      .from('bookings')
      .select('total_price')
      .in('status', ['paid', 'review_pending', 'closed']);
      
    const income = paidBookings?.reduce((sum, b) => sum + (b.total_price * 0.20), 0) || 0;

    setStats({
      totalBookings: bCount || 0,
      totalProviders: pCount || 0,
      platformIncome: income
    });
    
    setLoading(false);
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase.rpc('approve_provider', { provider_uuid: id });
    if (!error) {
      alert('প্রোভাইডার অ্যাপ্রুভ করা হয়েছে!');
      fetchDashboardData();
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('বাতিল করার কারণ লিখুন:');
    if (!reason) return;
    
    const { error } = await supabase
      .from('provider_profiles')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);

    if (!error) {
      alert('প্রোভাইডার বাতিল করা হয়েছে!');
      fetchDashboardData();
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">লোড হচ্ছে...</div>;
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8 mb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <div className="w-4 h-8 bg-red-600 rounded-sm"></div>
          অ্যাডমিন কন্ট্রোল প্যানেল
        </h1>
        <Button onClick={() => navigate('/dashboard')} variant="outline">
          মূল ড্যাশবোর্ডে যান
        </Button>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white border-0 shadow-sm border-t-4 border-blue-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">সর্বমোট বুকিং</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalBookings}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-0 shadow-sm border-t-4 border-green-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-full">
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">প্লাটফর্মের আয় (২০%)</p>
              <h3 className="text-3xl font-bold text-gray-900">৳ {(stats.platformIncome / 100).toFixed(0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm border-t-4 border-orange-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-orange-50 rounded-full">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-gray-500 font-medium">অ্যাক্টিভ প্রোভাইডার</p>
              <h3 className="text-3xl font-bold text-gray-900">{stats.totalProviders}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b border-gray-100 pb-4">
          <CardTitle className="text-xl">পেন্ডিং প্রোভাইডার অ্যাপ্লিকেশন ({providers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {providers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">কোনো নতুন অ্যাপ্লিকেশন নেই।</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {providers.map(p => (
                <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition-colors">
                  <div className="space-y-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{p.nid_number}</p>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">New</span>
                    </div>
                    <p className="text-sm text-gray-600">📍 বর্তমান ঠিকানা: {p.present_address}</p>
                    <p className="text-sm text-gray-600">📞 জরুরি যোগাযোগ: {p.emergency_contact_name} ({p.emergency_contact_phone})</p>
                  </div>
                  <div className="space-x-3">
                    <Button onClick={() => handleApprove(p.id)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm px-6">অ্যাপ্রুভ</Button>
                    <Button onClick={() => handleReject(p.id)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">রিজেক্ট</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
