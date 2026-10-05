import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchService() {
      const { data } = await supabase.from('services').select('*').eq('id', id).single();
      if (data) setService(data);
    }
    fetchService();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('বুকিং করতে লগইন করা প্রয়োজন!');
      navigate('/login');
      return;
    }

    const isoDate = new Date(scheduledAt).toISOString();
    
    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      service_id: id,
      address,
      scheduled_at: isoDate,
      total_price: service.base_price, // Stores the discounted price
      status: 'pending'
    });

    if (error) {
      alert('বুকিং ব্যর্থ হয়েছে: ' + error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    }
    setLoading(false);
  };

  if (!service) return <div className="p-12 text-center text-gray-500">লোড হচ্ছে...</div>;

  if (success) {
    return (
      <div className="container mx-auto p-4 max-w-lg mt-12">
        <Card className="text-center py-12 shadow-lg border-0 bg-gradient-to-b from-green-50 to-white">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">বুকিং সফল হয়েছে!</h2>
          <p className="text-gray-600 mb-6">আপনার রিকোয়েস্টটি একজন প্রোভাইডারের কাছে পাঠানো হয়েছে।</p>
          <p className="text-sm text-gray-400">ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...</p>
        </Card>
      </div>
    );
  }

  const originalPrice = service.base_price / (1 - (service.discount_percentage || 0) / 100);

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-12 mb-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">সার্ভিস বুকিং</h1>
        <p className="text-gray-500">নিচের ফর্মটি পূরণ করে আপনার বুকিং কনফার্ম করুন</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Service Details */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-indigo-50">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-900">{service.name}</CardTitle>
              <CardDescription className="text-indigo-700/80 mt-2 line-clamp-3">
                {service.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
                <p className="text-sm text-gray-500 mb-1">মোট বিল</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-gray-900">
                    ৳ {(service.base_price / 100).toFixed(0)}
                  </span>
                  {service.pricing_model === 'starting_at' && <span className="text-gray-500 pb-1">থেকে শুরু</span>}
                  
                  {service.discount_percentage > 0 && (
                    <span className="text-sm text-gray-400 line-through pb-1 ml-2">
                      ৳ {(originalPrice / 100).toFixed(0)}
                    </span>
                  )}
                </div>
                
                {service.discount_percentage > 0 && (
                  <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                    {service.discount_percentage}% স্পেশাল ডিসকাউন্ট!
                  </div>
                )}

                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                  <span className="font-medium">ভিজিট ফি:</span> ৳ {(service.visit_fee / 100).toFixed(0)} (সার্ভিস নিলে ফ্রি)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleBooking} className="space-y-5">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  আপনার সম্পূর্ণ ঠিকানা
                </Label>
                <Input 
                  required 
                  placeholder="বাসা নং, রোড নং, এলাকা..." 
                  className="bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-lg py-6"
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  কখন সার্ভিসটি প্রয়োজন?
                </Label>
                <Input 
                  type="datetime-local" 
                  required 
                  className="bg-gray-50 border-gray-200 focus-visible:ring-indigo-500 rounded-lg py-6"
                  value={scheduledAt} 
                  onChange={e => setScheduledAt(e.target.value)} 
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700"
                  disabled={loading}
                >
                  {loading ? 'বুকিং হচ্ছে...' : 'বুকিং কনফার্ম করুন'}
                </Button>
                <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> কোনো হিডেন চার্জ নেই
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
