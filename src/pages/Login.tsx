import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // Redirect based on role or dashboard
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">লগইন করুন</CardTitle>
          <CardDescription>
            আপনার একাউন্টে প্রবেশ করতে ইমেইল ও পাসওয়ার্ড দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="আপনার ইমেইল" 
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required 
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            একাউন্ট নেই? <Link to="/signup" className="text-blue-600 hover:underline">নতুন একাউন্ট খুলুন</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
