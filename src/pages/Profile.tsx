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
    <div className="container mx-auto p-4 max-w-2xl mt-12 mb-20">
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <CardTitle className="text-2xl text-indigo-900">আমার প্রোফাইল</CardTitle>
              <CardDescription className="text-indigo-700">
                আপনার ব্যক্তিগত তথ্য আপডেট করুন
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700">ইমেইল (পরিবর্তনযোগ্য নয়)</Label>
              <Input 
                value={email}
                disabled
                className="bg-gray-100 border-gray-200 text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4 text-indigo-500" />
                আপনার পুরো নাম
              </Label>
              <Input 
                id="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="border-gray-300 focus-visible:ring-indigo-500"
                placeholder="যেমন: রহিম মিয়া"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-indigo-500" />
                মোবাইল নম্বর
              </Label>
              <Input 
                id="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="border-gray-300 focus-visible:ring-indigo-500"
                placeholder="01XXXXXXXXX"
              />
            </div>

            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <CheckCircle2 className="w-5 h-5" />
                <span>প্রোফাইল সফলভাবে আপডেট হয়েছে!</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full py-6 text-lg rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 transition-all"
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
