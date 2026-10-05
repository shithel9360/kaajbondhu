import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Activity, Wallet, Plus } from 'lucide-react';
import { formatBDT } from '@/components/ui/PriceDisplay';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, platformIncome: 0, totalProviders: 0 });
  const [loading, setLoading] = useState(true);

  // New Service Form State
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    base_price: '',
    category_id: ''
  });

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
    const { data: provs } = await supabase.from('provider_profiles').select('*, auth_users:id(email)').eq('status', 'pending_approval');
    if (provs) setProviders(provs);

    const { data: cats } = await supabase.from('categories').select('*').is('archived_at', null);
    if (cats) setCategories(cats);

    const { data: srvs } = await supabase.from('services').select('*').is('archived_at', null);
    if (srvs) setServices(srvs);

    const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact' });
    const { count: pCount } = await supabase.from('provider_profiles').select('*', { count: 'exact' }).eq('status', 'approved');
      
    const { data: ledger } = await supabase.from('financial_ledger').select('amount_poisha').eq('type', 'platform_commission');
    const income = ledger?.reduce((sum, row) => sum + row.amount_poisha, 0) || 0;

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
    } else alert('সমস্যা হয়েছে: ' + error.message);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('বাতিল করার কারণ লিখুন:');
    if (!reason) return;
    const { error } = await supabase.from('provider_profiles').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
    if (!error) {
      alert('প্রোভাইডার বাতিল করা হয়েছে!');
      fetchDashboardData();
    } else alert('সমস্যা হয়েছে: ' + error.message);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.category_id) {
      alert('ক্যাটাগরি সিলেক্ট করুন');
      return;
    }
    
    const { error } = await supabase.from('services').insert({
      name: newService.name,
      description: newService.description,
      base_price: parseInt(newService.base_price) * 100, // convert BDT to poisha
      category_id: newService.category_id,
      pricing_model: 'fixed'
    });

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('সার্ভিস সফলভাবে যোগ করা হয়েছে!');
      setNewService({ name: '', description: '', base_price: '', category_id: '' });
      fetchDashboardData();
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">লোড হচ্ছে...</div>;
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8 mb-20 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-4 h-8 bg-red-600 rounded-sm"></div>
          অ্যাডমিন কন্ট্রোল প্যানেল
        </h1>
        <Button onClick={() => navigate('/dashboard')} variant="outline" className="dark:border-slate-700 dark:text-slate-300">
          মূল ড্যাশবোর্ডে যান
        </Button>
      </div>
      
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-t-4 border-blue-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">সর্বমোট বুকিং</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalBookings}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-t-4 border-green-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">প্লাটফর্মের আয়</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{formatBDT(stats.platformIncome)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-sm border-t-4 border-orange-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-full">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">অ্যাক্টিভ প্রোভাইডার</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalProviders}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Applications */}
      <Card className="border-0 shadow-lg dark:bg-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 pb-4">
          <CardTitle className="text-xl dark:text-white">পেন্ডিং প্রোভাইডার অ্যাপ্লিকেশন ({providers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {providers.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">কোনো নতুন অ্যাপ্লিকেশন নেই।</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {providers.map(p => (
                <div key={p.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="space-y-1 mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg dark:text-white">{p.nid_number}</p>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">New</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">📍 বর্তমান ঠিকানা: {p.present_address}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">📞 জরুরি যোগাযোগ: {p.emergency_contact_name} ({p.emergency_contact_phone})</p>
                  </div>
                  <div className="space-x-3">
                    <Button onClick={() => handleApprove(p.id)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm px-6">অ্যাপ্রুভ</Button>
                    <Button onClick={() => handleReject(p.id)} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">রিজেক্ট</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services CMS Manager */}
      <Card className="border-0 shadow-lg dark:bg-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 pb-4">
          <CardTitle className="text-xl dark:text-white">সার্ভিস ম্যানেজমেন্ট (CMS)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          <form onSubmit={handleAddService} className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg flex items-center gap-2 dark:text-white">
              <Plus className="w-5 h-5 text-blue-600" /> নতুন সার্ভিস যোগ করুন
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">সার্ভিসের নাম</Label>
                <Input required placeholder="যেমন: Mistry (মিস্ত্রি)" className="dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">ক্যাটাগরি</Label>
                <select 
                  required 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:ring-offset-gray-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  value={newService.category_id} 
                  onChange={e => setNewService({...newService, category_id: e.target.value})}
                >
                  <option value="">নির্বাচন করুন</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="dark:text-slate-300">বিবরণ</Label>
                <Input required placeholder="সার্ভিসের বিবরণ..." className="dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">প্রাথমিক মূল্য (৳)</Label>
                <Input required type="number" placeholder="যেমন: 500" className="dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" value={newService.base_price} onChange={e => setNewService({...newService, base_price: e.target.value})} />
              </div>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-sm mt-4">সার্ভিসটি সেভ করুন</Button>
          </form>

          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">বর্তমান সার্ভিস সমূহ ({services.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.id} className="p-4 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700">
                  <h4 className="font-bold dark:text-white">{s.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 mt-2">{formatBDT(s.base_price)}</p>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}
