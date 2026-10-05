import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').is('archived_at', null);
      if (catData) setCategories(catData);

      const { data: srvData } = await supabase.from('services').select('*').is('archived_at', null);
      if (srvData) setServices(srvData);
    }
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-4 space-y-8">
      <div className="text-center space-y-4 py-8 bg-blue-50 rounded-2xl">
        <h1 className="text-4xl font-bold text-blue-900">আপনার প্রয়োজনীয় সব সার্ভিস এক ঠিকানায়</h1>
        <p className="text-lg text-gray-600">এসি সার্ভিসিং থেকে শুরু করে ক্লিনিং, প্লাম্বিং - সবকিছু পাচ্ছেন কাজবন্ধুতে।</p>
      </div>

      {categories.map((category) => {
        const catServices = services.filter(s => s.category_id === category.id);
        if (catServices.length === 0) return null;

        return (
          <div key={category.id} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <span>{category.icon_url}</span> {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catServices.map(service => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="font-semibold text-blue-700">
                      ৳ {(service.base_price / 100).toFixed(0)} 
                      {service.pricing_model === 'starting_at' ? ' থেকে শুরু' : ''}
                    </div>
                    <Link to={`/book/${service.id}`}>
                      <Button className="w-full">বুক করুন</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
