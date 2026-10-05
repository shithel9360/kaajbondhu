import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: ''
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setEmail(user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || ''
        });
      }
    }
    loadProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
      })
      .eq('id', user.id);

    if (error) {
      alert('প্রোফাইল আপডেট করতে সমস্যা হয়েছে: ' + error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-8 mb-20">
      <Card className="shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">আমার প্রোফাইল</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                আপনার ব্যক্তিগত তথ্য আপডেট করুন
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">ইমেইল (পরিবর্তনযোগ্য নয়)</Label>
              <Input value={email}
                disabled
                className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                আপনার পুরো নাম
              </Label>
              <Input id="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
                placeholder="যেমন: রহিম মিয়া"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                মোবাইল নম্বর
              </Label>
              <Input id="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
                placeholder="01XXXXXXXXX"
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium text-sm">প্রোফাইল সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
