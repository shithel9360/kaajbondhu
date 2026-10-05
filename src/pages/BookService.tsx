import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

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

    const scheduledAt = new Date(date).toISOString();
    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      service_id: id,
      address,
      scheduled_at: scheduledAt,
      total_price: service.base_price,
      status: 'pending'
    });

    if (error) {
      alert('বুকিং ব্যর্থ হয়েছে: ' + error.message);
    } else {
      alert('আপনার বুকিং সফল হয়েছে!');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  if (!service) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">সার্ভিস বুকিং: {service.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBooking} className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p><strong>সার্ভিস ফি:</strong> ৳ {(service.base_price / 100).toFixed(0)} {service.pricing_model === 'starting_at' ? 'থেকে শুরু' : ''}</p>
              <p><strong>ভিজিট ফি:</strong> ৳ {(service.visit_fee / 100).toFixed(0)} (সার্ভিস নিলে ফ্রি)</p>
            </div>
            
            <div className="space-y-2">
              <Label>আপনার সম্পূর্ণ ঠিকানা</Label>
              <Input 
                required 
                placeholder="বাসা নং, রোড নং, এলাকা..." 
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>কখন সার্ভিসটি প্রয়োজন?</Label>
              <Input 
                type="datetime-local" 
                required 
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'বুকিং হচ্ছে...' : 'কনফার্ম করুন'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
