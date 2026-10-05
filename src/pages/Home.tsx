import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, ThumbsUp, Wrench, Search, Star, ChevronRight, Percent, Zap } from 'lucide-react';
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

  const offerServices = services.filter(s => s.discount_percentage > 0);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Notification Bar */}
      <div className="bg-indigo-600 text-white text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-yellow-300" />
        লঞ্চিং অফার! নির্দিষ্ট সার্ভিসে পাচ্ছেন ২০% পর্যন্ত নিশ্চিত ছাড়!
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-50 to-white pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
        
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-indigo-100 text-indigo-800 text-sm font-semibold mb-4 animate-fade-in">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            সেরা দামে বিশ্বস্ত সার্ভিস
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
            ঘরে বসেই পান <br className="hidden md:block" />
            <span className="gradient-text">প্রফেশনাল সার্ভিস!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            এসি মেরামত থেকে শুরু করে সম্পূর্ণ বাসা ক্লিনিং—কাজবন্ধুর ভেরিফাইড প্রোভাইডাররা আছে আপনার সেবায়।
          </p>
          
          <div className="max-w-2xl mx-auto flex gap-2 pt-6">
            <div className="relative flex-1 shadow-2xl rounded-2xl overflow-hidden bg-white">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <Input 
                className="pl-14 py-8 text-lg border-0 focus-visible:ring-0 rounded-2xl w-full"
                placeholder="আপনার কী সার্ভিস প্রয়োজন? (যেমন: এসি সার্ভিসিং)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {!search && offerServices.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <Percent className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold text-gray-900">হট অফার ও ডিসকাউন্ট</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerServices.map(service => {
                const originalPrice = service.base_price / (1 - service.discount_percentage / 100);
                
                return (
                  <Card key={service.id} className="relative group overflow-hidden border-2 border-red-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-300 bg-white">
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                      {service.discount_percentage}% ছাড়
                    </div>
                    <CardContent className="p-6 pt-12">
                      <h4 className="text-xl font-bold mb-2 text-gray-900">{service.name}</h4>
                      <p className="text-gray-500 text-sm mb-6 h-10">{service.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-400 line-through">৳ {(originalPrice / 100).toFixed(0)}</p>
                          <p className="text-2xl font-extrabold text-red-600">
                            ৳ {(service.base_price / 100).toFixed(0)}
                          </p>
                        </div>
                        <Link to={`/book/${service.id}`}>
                          <Button className="rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md">
                            অফারটি নিন
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services Catalog */}
      <section className="py-16 bg-gray-50 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">সকল সার্ভিস ক্যাটাগরি</h2>
            <p className="text-gray-600 max-w-xl mx-auto">সঠিক মূল্যে সেরা সার্ভিসের নিশ্চয়তা</p>
          </div>

          {categories.map((category) => {
            const catServices = search 
              ? filteredServices.filter(s => s.category_id === category.id)
              : services.filter(s => s.category_id === category.id);
              
            if (catServices.length === 0) return null;

            return (
              <div key={category.id} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <div className="text-4xl">{category.icon_url}</div>
                  <h3 className="text-2xl font-bold text-gray-800">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catServices.map(service => (
                    <Card key={service.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Wrench className="w-6 h-6" />
                          </div>
                          {service.discount_percentage > 0 && (
                            <div className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                              {service.discount_percentage}% OFF
                            </div>
                          )}
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
                            <Button className="rounded-full px-6 shadow-md hover:shadow-lg group-hover:bg-indigo-700 transition-all">
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

      {/* Trust Badges */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-full text-blue-600">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">ভেরিফাইড প্রোভাইডার</h3>
              <p className="text-gray-500">আমাদের সকল প্রোভাইডারদের ব্যাকগ্রাউন্ড এবং NID ভেরিফাই করা হয়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-orange-50 rounded-full text-orange-600">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">সময়মতো সার্ভিস</h3>
              <p className="text-gray-500">আপনার দেওয়া নির্ধারিত সময়ে প্রোভাইডার পৌঁছে যাবে আপনার দোরগোড়ায়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-green-50 rounded-full text-green-600">
                <ThumbsUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">১০০% সন্তুষ্টি গ্যারান্টি</h3>
              <p className="text-gray-500">কাজের পর কোনো সমস্যা হলে আমরা বিনা খরচে সমাধান করে দেব।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl leading-none">
              ক
            </div>
            <h2 className="text-3xl font-bold">কাজবন্ধু</h2>
          </div>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">বাংলাদেশের সবচেয়ে নির্ভরযোগ্য হোম সার্ভিস প্ল্যাটফর্ম। প্রফেশনাল সার্ভিস, নিশ্চিন্ত সমাধান।</p>
          <div className="border-t border-slate-800 pt-8 text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
            <span>&copy; {new Date().getFullYear()} কাজবন্ধু। সর্বসত্ত্ব সংরক্ষিত।</span>
            <div className="space-x-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">শর্তাবলী</a>
              <a href="#" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</a>
              <a href="#" className="hover:text-white transition-colors">যোগাযোগ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
