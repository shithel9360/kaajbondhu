import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchProviders();
    }
    checkAdmin();
  }, [navigate]);

  async function fetchProviders() {
    const { data } = await supabase
      .from('provider_profiles')
      .select('*, auth_users:id(email)')
      .eq('status', 'pending_approval');
      
    if (data) {
      // NOTE: Using a join might need special view or RPC if auth.users isn't exposed.
      // Assuming we just show NID and address for MVP.
      setProviders(data);
    }
    setLoading(false);
  }

  const handleApprove = async (id: string) => {
    const { error } = await supabase.rpc('approve_provider', { provider_uuid: id });
    if (!error) {
      alert('প্রোভাইডার অ্যাপ্রুভ করা হয়েছে!');
      fetchProviders();
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('বাতিল করার কারণ লিখুন:');
    if (!reason) return;
    
    const { error } = await supabase
      .from('provider_profiles')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', id);

    if (!error) {
      alert('প্রোভাইডার বাতিল করা হয়েছে!');
      fetchProviders();
    } else {
      alert('সমস্যা হয়েছে: ' + error.message);
    }
  };

  if (loading) return <div className="p-8 text-center">লোড হচ্ছে...</div>;
  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8">
      <h1 className="text-3xl font-bold mb-8 text-red-700">অ্যাডমিন প্যানেল</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>পেন্ডিং প্রোভাইডার অ্যাপ্লিকেশন ({providers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <p className="text-gray-500">কোনো নতুন অ্যাপ্লিকেশন নেই।</p>
          ) : (
            <div className="space-y-4">
              {providers.map(p => (
                <div key={p.id} className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
                  <div className="space-y-1">
                    <p className="font-bold">NID: {p.nid_number}</p>
                    <p className="text-sm">বর্তমান ঠিকানা: {p.present_address}</p>
                    <p className="text-sm">জরুরি যোগাযোগ: {p.emergency_contact_name} ({p.emergency_contact_phone})</p>
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => handleApprove(p.id)} className="bg-green-600 hover:bg-green-700">অ্যাপ্রুভ</Button>
                    <Button onClick={() => handleReject(p.id)} variant="destructive">রিজেক্ট</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
