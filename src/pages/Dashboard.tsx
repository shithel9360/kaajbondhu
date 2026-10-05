import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (roleData) {
        setRole(roleData.role);
      }
    }
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return <div className="p-8 text-center">লোড হচ্ছে...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ড্যাশবোর্ড</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-gray-600">স্বাগতম, <span className="font-semibold text-gray-900">{user.user_metadata?.full_name || user.email}</span></p>
            <p className="text-sm text-gray-500">আপনার একাউন্টের ধরন: {role === 'customer' ? 'গ্রাহক' : role === 'provider' ? 'সার্ভিস প্রোভাইডার' : role === 'admin' ? 'অ্যাডমিন' : 'অজানা'}</p>
          </div>
          
          <div className="pt-4 border-t">
            {role === 'customer' && (
              <p>আপনি এখান থেকে নতুন সার্ভিস বুক করতে পারবেন। (খুব শিগগিরই আসছে)</p>
            )}
            {role === 'provider' && (
              <p>আপনি এখান থেকে নতুন কাজের রিকোয়েস্ট দেখতে পারবেন। (খুব শিগগিরই আসছে)</p>
            )}
          </div>

          <Button variant="destructive" onClick={handleLogout} className="mt-4">
            লগআউট করুন
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
