import { toast } from "sonner";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, CheckCircle2, CreditCard, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    bkash_number: '',
    bank_account: ''
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
          phone_number: data.phone_number || '',
          bkash_number: data.bkash_number || '',
          bank_account: data.bank_account || ''
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

    // We will attempt to update all fields. If bkash/bank columns don't exist yet, it will throw an error.
    // To be safe, we first try updating everything.
    const updatePayload: any = {
      full_name: formData.full_name,
      phone_number: formData.phone_number,
    };
    
    // Add payment info conditionally so it doesn't break if columns are missing
    updatePayload.bkash_number = formData.bkash_number;
    updatePayload.bank_account = formData.bank_account;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...updatePayload });

    if (error) {
      if (error.message.includes('bkash_number') || error.message.includes('bank_account')) {
         toast.info('সিস্টেমে ব্যাংক/বিকাশ কলাম এখনো তৈরি হয়নি। দয়া করে অ্যাডমিনকে Supabase-এ bkash_number এবং bank_account কলাম যোগ করতে বলুন।');
      } else {
         toast.info('প্রোফাইল আপডেট করতে সমস্যা হয়েছে: ' + error.message);
      }
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className=" animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-50">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : <User />}
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900 dark:text-slate-50">আমার প্রোফাইল</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  আপনার ব্যক্তিগত এবং পেমেন্ট তথ্য আপডেট করুন
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-2">ব্যক্তিগত তথ্য</h3>
                
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-slate-200">ইমেইল (পরিবর্তনযোগ্য নয়)</Label>
                  <Input value={email}
                    disabled
                    className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
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
                    <Label htmlFor="phone_number" className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
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
                </div>
              </div>

              {/* Payment Info Section */}
              <div className="space-y-6 pt-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-800 pb-2">পেমেন্ট এবং ব্যাংক তথ্য</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">প্রোভাইডার হিসেবে কাজ করলে আপনার পেমেন্ট বা বিল রিসিভ করার জন্য এই তথ্যগুলো প্রয়োজন।</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bkash_number" className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
                      <CreditCard className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                      বিকাশ / নগদ নম্বর (পার্সোনাল)
                    </Label>
                    <Input id="bkash_number"
                      type="tel"
                      value={formData.bkash_number}
                      onChange={handleChange}
                      className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account" className="flex items-center gap-2 text-slate-900 dark:text-slate-200">
                      <Building className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                      ব্যাংক একাউন্ট ডিটেইলস
                    </Label>
                    <Input id="bank_account"
                      value={formData.bank_account}
                      onChange={handleChange}
                      className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
                      placeholder="যেমন: DBBL, Acc: 1234..."
                    />
                  </div>
                </div>
              </div>

              {success && (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 p-3 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium text-sm">প্রোফাইল সফলভাবে আপডেট হয়েছে!</span>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
