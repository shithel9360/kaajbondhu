import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      alert('সফলভাবে একাউন্ট তৈরি হয়েছে! দয়া করে লগইন করুন।');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">একাউন্ট তৈরি করুন</CardTitle>
          <CardDescription>
            কাজবন্ধুতে যোগ দিতে আপনার তথ্য দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">পুরো নাম</Label>
              <Input 
                id="fullName" 
                placeholder="যেমন: রহিম মিয়া" 
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">মোবাইল নাম্বার</Label>
              <Input 
                id="phone" 
                type="tel"
                placeholder="01XXXXXXXXX" 
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                required 
              />
            </div>
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
                minLength={6}
              />
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'অপেক্ষা করুন...' : 'একাউন্ট খুলুন'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            আগে থেকেই একাউন্ট আছে? <Link to="/login" className="text-blue-600 hover:underline">লগইন করুন</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
