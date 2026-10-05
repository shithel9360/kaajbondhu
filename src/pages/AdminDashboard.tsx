import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Activity, Wallet, Plus, Server } from 'lucide-react';
import { formatBDT } from '@/components/ui/PriceDisplay';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, bookings: 0, platformIncome: 0 });
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '' });
  const [isAddingService, setIsAddingService] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (roleData?.role !== 'admin') {
        alert('Access denied.');
        navigate('/dashboard');
        return;
      }

      const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { data: ledger } = await supabase.from('financial_ledger').select('amount_poisha').eq('type', 'platform_commission');
      
      const platformIncome = ledger ? ledger.reduce((acc, row) => acc + row.amount_poisha, 0) : 0;
      
      setStats({ 
        users: uCount || 0, 
        bookings: bCount || 0,
        platformIncome
      });

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) setCategories(catData);

      const { data: sData } = await supabase.from('services').select('*, categories(name)').order('created_at', { ascending: false });
      if (sData) setServices(sData);

      setLoading(false);
    }
    checkAdmin();
  }, [navigate]);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.category_id) {
      alert("Please select a category");
      return;
    }

    const pricePoisha = parseInt(newService.base_price) * 100;
    
    const { error } = await supabase.from('services').insert({
      name: newService.name,
      description: newService.description,
      base_price: pricePoisha,
      category_id: newService.category_id,
      pricing_model: 'fixed'
    });

    if (error) alert("Error adding service: " + error.message);
    else {
      alert("Service added dynamically!");
      setIsAddingService(false);
      setNewService({ name: '', description: '', base_price: '', category_id: '' });
      const { data: sData } = await supabase.from('services').select('*, categories(name)').order('created_at', { ascending: false });
      if (sData) setServices(sData);
    }
  };

  if (loading) return <div className="p-8 text-center dark:text-slate-400">Loading Admin Secure Panel...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl mt-4 mb-20 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">প্লাটফর্মের সার্বিক চিত্র এবং কন্ট্রোল প্যানেল</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-blue-500 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-full">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-blue-50 font-medium">প্লাটফর্ম আয়</p>
              <h3 className="text-3xl font-bold">{formatBDT(stats.platformIncome)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-full">
              <Activity className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">মোট বুকিং</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.bookings}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-full">
              <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">মোট ইউজার</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.users}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-xl">সার্ভিস ম্যানেজমেন্ট (CMS)</CardTitle>
          </div>
          <Button onClick={() => setIsAddingService(!isAddingService)} className="mt-4 sm:mt-0 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            নতুন সার্ভিস যোগ করুন
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          {isAddingService && (
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <form onSubmit={handleAddService} className="max-w-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">সার্ভিসের নাম</Label>
                    <Input required placeholder="যেমন: Mistry (মিস্ত্রি)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="dark:text-slate-300">ক্যাটাগরি</Label>
                    <select 
                      required 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
                      value={newService.category_id}
                      onChange={e => setNewService({...newService, category_id: e.target.value})}
                    >
                      <option value="">নির্বাচন করুন</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">বিবরণ</Label>
                  <Input required placeholder="সার্ভিসের বিবরণ..." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="dark:text-slate-300">প্রাথমিক মূল্য (৳)</Label>
                  <Input required type="number" placeholder="যেমন: 500" value={newService.base_price} onChange={e => setNewService({...newService, base_price: e.target.value})} />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddingService(false)}>বাতিল</Button>
                  <Button type="submit">সেভ করুন</Button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  <th className="p-4">সার্ভিসের নাম</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4">বেস প্রাইস</th>
                  <th className="p-4 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {services.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{s.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{s.description}</p>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">
                      {s.categories?.name}
                    </td>
                    <td className="p-4 font-bold text-blue-600 dark:text-blue-400">
                      {formatBDT(s.base_price)}
                    </td>
                    <td className="p-4 text-right">
                      {s.is_active ? 
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">অ্যাকটিভ</span> : 
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">নিষ্ক্রিয়</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                কোনো সার্ভিস পাওয়া যায়নি।
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
