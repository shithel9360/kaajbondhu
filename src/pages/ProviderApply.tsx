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
  
  const [formData, setFormData] = useState({
    nid_number: '',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: ''
  });

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      const { data } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfile(data);
      }
    }
    checkStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (profile?.status === 'draft' || !profile) {
      // Upsert profile
      const { error } = await supabase.from('provider_profiles').upsert({
        id: user.id,
        ...formData,
        status: 'pending_approval'
      });

      if (!error) {
        alert('আপনার আবেদন সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন অ্যাপ্রুভালের জন্য অপেক্ষা করুন।');
        navigate('/dashboard');
      } else {
        alert('সমস্যা হয়েছে: ' + error.message);
      }
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  if (profile && profile.status !== 'draft') {
    return (
      <div className="container mx-auto p-8 text-center max-w-lg mt-8">
        <Card>
          <CardHeader>
            <CardTitle>আবেদন স্ট্যাটাস</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.status === 'pending_approval' && <p className="text-yellow-600 font-bold">আপনার আবেদনটি রিভিউ করা হচ্ছে।</p>}
            {profile.status === 'approved' && <p className="text-green-600 font-bold">অভিনন্দন! আপনি এখন একজন ভেরিফাইড প্রোভাইডার।</p>}
            {profile.status === 'rejected' && <p className="text-red-600 font-bold">আপনার আবেদনটি বাতিল করা হয়েছে। কারণ: {profile.rejection_reason}</p>}
            <Button onClick={() => navigate('/dashboard')} className="mt-4">ড্যাশবোর্ডে ফিরে যান</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">সার্ভিস প্রোভাইডার হিসেবে যোগ দিন</CardTitle>
          <CardDescription>
            কাজবন্ধুতে কাজ শুরু করতে আপনার ভেরিফিকেশন তথ্য দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="border-t pt-4 mt-4 space-y-4">
              <h3 className="font-bold text-slate-700">জরুরি যোগাযোগ (Emergency Contact)</h3>
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

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'জমা দেওয়া হচ্ছে...' : 'আবেদন জমা দিন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
