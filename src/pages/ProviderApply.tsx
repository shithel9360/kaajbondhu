import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProviderApply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nid_number: '',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    category_id: '',
    experience_years: ''
  });

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data: profileData } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileData) {
        setProfile(profileData);
      }

      // Load Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .is('archived_at', null);
      if (catData) setCategories(catData);
    }
    loadInitialData();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast.info('দয়া করে একটি কাজের ধরণ (Category) নির্বাচন করুন।');
      return;
    }
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (profile?.status === 'draft' || !profile) {
      // Upsert profile
      const { error: profileError } = await supabase.from('provider_profiles').upsert({
        id: user.id,
        nid_number: formData.nid_number,
        present_address: formData.present_address,
        permanent_address: formData.permanent_address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        emergency_contact_relation: formData.emergency_contact_relation,
        status: 'pending_approval'
      });

      if (profileError) {
        toast.info('সমস্যা হয়েছে (Profile): ' + profileError.message);
        setLoading(false);
        return;
      }

      // Upsert skills
      const { error: skillError } = await supabase.from('provider_skills').upsert({
        provider_id: user.id,
        category_id: formData.category_id,
        experience_years: parseInt(formData.experience_years) || 0
      });

      if (skillError) {
        console.error('Skill Error:', skillError);
        // We won't block the UI for skill error, it's non-fatal if they somehow already have it, but we log it.
      }

      toast.info('আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন অ্যাপ্রুভালের জন্য অপেক্ষা করুন।');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id || e.target.name]: e.target.value }));
  };

  if (profile && profile.status !== 'draft') {
    return (
      <div className=" animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out py-8 max-w-2xl mx-auto px-4">
        <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
          <CardHeader>
            <CardTitle>আবেদন স্ট্যাটাস</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.status === 'pending_approval' && <p className="text-yellow-600 dark:text-yellow-500 font-bold">আপনার আবেদনটি রিভিউ করা হচ্ছে।</p>}
            {profile.status === 'approved' && <p className="text-green-600 dark:text-green-400 font-bold">অভিনন্দন! আপনি এখন একজন ভেরিফাইড প্রোভাইডার।</p>}
            {profile.status === 'rejected' && <p className="text-red-600 dark:text-red-400 font-bold">আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: {profile.rejection_reason}</p>}
            <Button onClick={() => navigate('/dashboard')} className="mt-4">ড্যাশবোর্ডে ফিরে যান</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out py-8 px-4">
      <Card className="shadow-sm max-w-3xl mx-auto border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
        <CardHeader>
          <CardTitle className="text-2xl">সার্ভিস প্রোভাইডার হিসেবে যোগ দিন</CardTitle>
          <CardDescription>
            কাজবন্ধুতে কাজ শুরু করতে আপনার ভেরিফিকেশন তথ্য দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 space-y-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-100">কাজের বিবরণ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">আপনি কোন ধরণের কাজ করতে চান?</Label>
                  <select 
                    id="category_id"
                    required 
                    className="flex h-11 w-full rounded-lg border border-input bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-50"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">কাজের অভিজ্ঞতা (বছর)</Label>
                  <Input 
                    type="number" 
                    min="0"
                    className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 bg-white" 
                    required 
                    id="experience_years" 
                    placeholder="যেমন: 2" 
                    value={formData.experience_years} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-2">ব্যক্তিগত তথ্য</h3>
              <div className="space-y-2">
                <Label htmlFor="nid_number">জাতীয় পরিচয়পত্র (NID) নম্বর</Label>
                <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="nid_number" value={formData.nid_number} onChange={handleChange} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="present_address">বর্তমান ঠিকানা</Label>
                  <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="present_address" value={formData.present_address} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="permanent_address">স্থায়ী ঠিকানা</Label>
                  <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="permanent_address" value={formData.permanent_address} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-700 pb-2">জরুরি যোগাযোগ (Emergency Contact)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">নাম</Label>
                  <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">ফোন</Label>
                  <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_relation">সম্পর্ক</Label>
                  <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" required id="emergency_contact_relation" placeholder="যেমন: ভাই/বাবা" value={formData.emergency_contact_relation} onChange={handleChange} />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-6 bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'জমা দেওয়া হচ্ছে...' : 'আবেদন জমা দিন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
