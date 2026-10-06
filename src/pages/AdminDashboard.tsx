import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Activity, Wallet, Plus, Server, UserCheck, CheckCircle2, XCircle, Pencil, Trash } from 'lucide-react';
import { formatBDT } from '@/components/ui/PriceDisplay';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState({ users: 0, bookings: 0, platformIncome: 0 });
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  
  const [newService, setNewService] = useState({ name: '', description: '', base_price: '', category_id: '', is_active: true });
  const [isAddingService, setIsAddingService] = useState(false);
  const [editModeId, setEditModeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdminData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
      if (!roleData || roleData.role !== 'admin') {
        navigate('/dashboard');
        return;
      }

      // Load stats
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      setStats({ users: usersCount || 0, bookings: bookingsCount || 0, platformIncome: 25500 }); // Mock income for MVP

      // Load CMS data
      const { data: catData } = await supabase.from('categories').select('*').is('archived_at', null);
      if (catData) setCategories(catData);

      const { data: srvData } = await supabase.from('services').select('*, categories(name)').is('archived_at', null);
      if (srvData) setServices(srvData);

      // Load provider applications (Manually matching profiles with provider_profiles)
      const { data: provData } = await supabase.from('provider_profiles').select('*').order('created_at', { ascending: false });
      
      const { data: skillsData } = await supabase.from('provider_skills').select('provider_id, experience_years, categories(name)');
      
      if (provData && provData.length > 0) {
         // Fetch corresponding profiles to get names
         const ids = provData.map(p => p.id);
         const { data: profData } = await supabase.from('profiles').select('id, full_name, phone_number').in('id', ids);
         
         const mergedProviders = provData.map(prov => {
           const skill = skillsData?.find(s => s.provider_id === prov.id);
           const profile = profData?.find(p => p.id === prov.id);
           return { ...prov, profile, skill };
         });
         setProviders(mergedProviders);
      }

      setLoading(false);
    }
    fetchAdminData();
  }, [navigate]);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editModeId) {
      const { error } = await supabase.from('services').update({
        name: newService.name,
        description: newService.description,
        base_price: parseInt(newService.base_price),
        category_id: newService.category_id,
        is_active: newService.is_active,
        is_active: newService.is_active,
      }).eq('id', editModeId);

      if (!error) {
        alert('সার্ভিস সফলভাবে আপডেট করা হয়েছে!');
        window.location.reload();
      } else {
        alert('সমস্যা হয়েছে: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('services').insert({
        name: newService.name,
        description: newService.description,
        base_price: parseInt(newService.base_price),
        category_id: newService.category_id,
        pricing_model: 'starting_at'
      });

      if (!error) {
        alert('সার্ভিস সফলভাবে যোগ করা হয়েছে!');
        window.location.reload();
      } else {
        alert('সমস্যা হয়েছে: ' + error.message);
      }
    }
  };

  const handleEditClick = (service: any) => {
    setNewService({
      name: service.name,
      description: service.description || '',
      base_price: service.base_price.toString(),
      category_id: service.category_id,
      is_active: service.is_active
    });
    setEditModeId(service.id);
    setIsAddingService(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই সার্ভিসটি মুছে ফেলতে চান?')) return;
    
    const { error } = await supabase.from('services').update({ archived_at: new Date().toISOString() }).eq('id', serviceId);
    if (!error) {
      alert('সার্ভিস মুছে ফেলা হয়েছে।');
      window.location.reload();
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleApproveProvider = async (providerId: string) => {
    // 1. Update status
    const { error: updateError } = await supabase
      .from('provider_profiles')
      .update({ status: 'approved' })
      .eq('id', providerId);
      
    if (updateError) {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা: ' + updateError.message);
      return;
    }

    // 2. Grant role
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: providerId, role: 'provider' });

    if (roleError) {
      alert('রোল আপডেটে সমস্যা: ' + roleError.message);
    } else {
      alert('প্রোভাইডার সফলভাবে ভেরিফাই করা হয়েছে!');
      // Refresh local state
      setProviders(providers.map(p => p.id === providerId ? { ...p, status: 'approved' } : p));
    }
  };

  const handleRejectProvider = async (providerId: string) => {
    const reason = prompt('বাতিল করার কারণ লিখুন:');
    if (!reason) return;

    const { error } = await supabase
      .from('provider_profiles')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', providerId);

    if (!error) {
      alert('আবেদন বাতিল করা হয়েছে।');
      setProviders(providers.map(p => p.id === providerId ? { ...p, status: 'rejected', rejection_reason: reason } : p));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading admin panel...</div>;
  }

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">অ্যাডমিন প্যানেল</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">প্ল্যাটফর্ম ওভারভিউ এবং ম্যানেজমেন্ট</p>
        </div>
        
        {/* Custom Tabs */}
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
          >
            ওভারভিউ
          </button>
          <button 
            onClick={() => setActiveTab('providers')} 
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'providers' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
          >
            প্রোভাইডার ভেরিফিকেশন
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.bookings}</h3>
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
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{stats.users}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <Server className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xl">সার্ভিস ম্যানেজমেন্ট (CMS)</CardTitle>
              </div>
              <Button onClick={() => { setIsAddingService(!isAddingService); setEditModeId(null); setNewService({ name: '', description: '', base_price: '', category_id: '', is_active: true }); }} className="mt-4 sm:mt-0 shadow-sm bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                নতুন সার্ভিস যোগ করুন
              </Button>
            </CardHeader>
            
            <CardContent className="p-0">
              {isAddingService && (
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <form onSubmit={handleSaveService} className="max-w-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="dark:text-slate-300">সার্ভিসের নাম</Label>
                        <Input required placeholder="যেমন: Mistry (মিস্ত্রি)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="dark:bg-slate-800" />
                      </div>
                      <div className="space-y-2">
                        <Label className="dark:text-slate-300">ক্যাটাগরি</Label>
                        <select 
                          required 
                          className="flex h-11 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50"
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
                      <Input required placeholder="সার্ভিসের বিবরণ..." value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="dark:bg-slate-800" />
                    </div>
                    <div className="space-y-2">
                      <Label className="dark:text-slate-300">প্রাথমিক মূল্য (৳)</Label>
                      <Input required type="number" placeholder="যেমন: 500" value={newService.base_price} onChange={e => setNewService({...newService, base_price: e.target.value})} className="dark:bg-slate-800" />
                    </div>
                    <div className="space-y-2 flex flex-row items-center gap-2">
                      <input type="checkbox" id="is_active" checked={newService.is_active} onChange={e => setNewService({...newService, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600" />
                      <Label htmlFor="is_active" className="dark:text-slate-300 !mt-0">সার্ভিসটি কি বর্তমানে অ্যাকটিভ?</Label>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddingService(false)} className="dark:text-slate-300">বাতিল</Button>
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
                      <th className="p-4 text-center">স্ট্যাটাস</th>
<th className="p-4 text-right">অ্যাকশন</th>
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-xl">প্রোভাইডার ভেরিফিকেশন</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                      <th className="p-4">নাম ও ফোন</th>
                      <th className="p-4">NID নম্বর</th>
<th className="p-4">কাজের ধরণ</th>
                      <th className="p-4">ঠিকানা</th>
                      <th className="p-4 text-center">স্ট্যাটাস</th>
                      <th className="p-4 text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {providers.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{p.profile?.full_name || 'নাম নেই'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.profile?.phone_number || 'ফোন নেই'}</p>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">
                          {p.nid_number}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{p.skill?.categories?.name || 'অজানা'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{p.skill?.experience_years ? p.skill.experience_years + ' বছরের অভিজ্ঞতা' : 'নতুন'}</p>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400 text-xs">
                          {p.present_address}
                        </td>
                        <td className="p-4 text-center">
                          {p.status === 'pending_approval' && <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800">অপেক্ষমান</span>}
                          {p.status === 'approved' && <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">ভেরিফাইড</span>}
                          {p.status === 'rejected' && <span className="inline-flex px-2 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">বাতিলকৃত</span>}
                        </td>
                        <td className="p-4 text-right">
                          {p.status === 'pending_approval' && (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => handleApproveProvider(p.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <CheckCircle2 className="w-4 h-4 mr-1" /> এপ্রুভ
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectProvider(p.id)}>
                                <XCircle className="w-4 h-4 mr-1" /> রিজেক্ট
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {providers.length === 0 && (
                  <div className="p-8 text-center text-slate-500">
                    কোনো প্রোভাইডার অ্যাপ্লিকেশন নেই।
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
