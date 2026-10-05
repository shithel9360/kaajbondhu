import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, ThumbsUp, Wrench, Search, Star, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').is('archived_at', null);
      if (catData) setCategories(catData);

      const { data: srvData } = await supabase.from('services').select('*').is('archived_at', null);
      if (srvData) setServices(srvData);
    }
    fetchData();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-50 to-white pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold mb-4 animate-fade-in">
            <Star className="w-4 h-4 fill-indigo-600 text-indigo-600" />
            বাংলাদেশের সেরা অন-ডিমান্ড সার্ভিস প্ল্যাটফর্ম
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
            আপনার প্রয়োজনীয় যেকোনো সার্ভিস, <br className="hidden md:block" />
            <span className="gradient-text">এখন হাতের মুঠোয়!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            এসি সার্ভিসিং, প্লাম্বিং, ইলেকট্রিক্যাল কাজ কিংবা বাসা পরিষ্কার—প্রফেশনাল সার্ভিস প্রোভাইডার দিয়ে বিশ্বস্ততার সাথে কাজ করান।
          </p>
          
          <div className="max-w-2xl mx-auto flex gap-2 pt-4">
            <div className="relative flex-1 shadow-lg rounded-xl overflow-hidden">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                className="pl-12 py-6 text-lg bg-white border-0 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl w-full"
                placeholder="আপনার কী সার্ভিস প্রয়োজন? (যেমন: এসি সার্ভিসিং)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="lg" className="py-6 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
              খুঁজুন
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges / Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">ভেরিফাইড প্রোভাইডার</h3>
              <p className="text-gray-500">আমাদের সকল প্রোভাইডারদের ব্যাকগ্রাউন্ড এবং NID ভেরিফাই করা হয়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-orange-50 rounded-2xl text-orange-600">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">সময়মতো সার্ভিস</h3>
              <p className="text-gray-500">আপনার দেওয়া নির্ধারিত সময়ে প্রোভাইডার পৌঁছে যাবে আপনার দোরগোড়ায়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-green-50 rounded-2xl text-green-600">
                <ThumbsUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">১০০% সন্তুষ্টি গ্যারান্টি</h3>
              <p className="text-gray-500">কাজের পর কোনো সমস্যা হলে আমরা বিনা খরচে সমাধান করে দেব।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Catalog */}
      <section className="py-20 bg-gray-50 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">আমাদের জনপ্রিয় সার্ভিসসমূহ</h2>
            <p className="text-gray-600 max-w-xl mx-auto">আমরা দিচ্ছি প্রতিদিনের প্রয়োজনীয় সব ধরনের সার্ভিসের সমাধান এক জায়গাতেই।</p>
          </div>

          {categories.map((category) => {
            // Filter services by search if search is active, otherwise just by category
            const catServices = search 
              ? filteredServices.filter(s => s.category_id === category.id)
              : services.filter(s => s.category_id === category.id);
              
            if (catServices.length === 0) return null;

            return (
              <div key={category.id} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-3xl">{category.icon_url}</div>
                  <h3 className="text-2xl font-bold text-gray-800">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catServices.map(service => (
                    <Card key={service.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Wrench className="w-6 h-6" />
                          </div>
                          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                            {service.pricing_model === 'fixed' ? 'Fixed' : 'Starting At'}
                          </div>
                        </div>
                        <h4 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">{service.name}</h4>
                        <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{service.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 font-medium">সার্ভিস ফি</p>
                            <p className="text-lg font-extrabold text-gray-900">
                              ৳ {(service.base_price / 100).toFixed(0)}
                              {service.pricing_model === 'starting_at' && <span className="text-sm font-normal text-gray-500 ml-1">+</span>}
                            </p>
                          </div>
                          <Link to={`/book/${service.id}`}>
                            <Button className="rounded-full px-6 shadow-md hover:shadow-lg group-hover:bg-indigo-700">
                              বুক করুন <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          
          {search && filteredServices.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">কোনো সার্ভিস পাওয়া যায়নি!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">কাজবন্ধু</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">বাংলাদেশের সবচেয়ে নির্ভরযোগ্য হোম সার্ভিস প্ল্যাটফর্ম। প্রফেশনাল সার্ভিস, নিশ্চিন্ত সমাধান।</p>
          <div className="border-t border-gray-800 pt-8 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} কাজবন্ধু। সর্বসত্ত্ব সংরক্ষিত। (This MVP is deployed completely free via Vercel & Supabase)
          </div>
        </div>
      </footer>
    </div>
  );
}
