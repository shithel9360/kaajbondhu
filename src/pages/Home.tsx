import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, ThumbsUp, Wrench, Search, Star, ChevronRight, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Top Notification Bar */}
      <div className="bg-blue-600 dark:bg-blue-600 text-white text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Zap className="w-4 h-4 text-yellow-300" />
        লঞ্চিং অফার! নির্দিষ্ট সার্ভিসে পাচ্ছেন সর্বোচ্চ ২০% পর্যন্ত নিশ্চিত ছাড়!
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
        
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 dark:bg-purple-900  mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 dark:bg-blue-900  mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2  bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 
            বাংলাদেশের সেরা সার্ভিস প্রোভাইডার
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            প্রয়োজনীয় সব সার্ভিস, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              এখন আপনার হাতের মুঠোয়
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            এসি মেরামত, ক্লিনিং, প্লাম্বিং থেকে শুরু করে যেকোনো সমস্যার সমাধানে কাজবন্ধু আছে আপনার পাশে।
          </p>

          <div className="max-w-xl mx-auto mt-10 relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-blue-400" />
            </div>
            <Input type="text" 
              placeholder="আপনি কী সার্ভিস খুঁজছেন? (যেমন: এসি ক্লিনিং, প্লাম্বিং...)" 
              className="h-16 pl-14 pr-4 w-full rounded-2xl text-lg shadow-xl border-0 ring-1 ring-blue-100 dark:ring-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Hot Offers */}
      {!search && offerServices.length > 0 && (
        <section className="py-12 bg-blue-50 dark:bg-slate-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Zap className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">হট অফার সমূহ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offerServices.slice(0, 3).map(service => (
                <Card key={service.id} className="border-0 shadow-lg bg-white dark:bg-slate-800 overflow-hidden relative">
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    {service.discount_percentage}% ছাড়
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pr-12">{service.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <PriceDisplay 
                        amountPoisha={service.base_price} 
                        pricingModel={service.pricing_model} 
                        discountPercentage={service.discount_percentage}
                        size="lg"
                      />
                      <Link to={`/book/${service.id}`}>
                        <Button className=" bg-amber-500 hover:bg-amber-600 text-white shadow-md">
                          বুক করুন
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Catalog */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 flex-1">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">সকল সার্ভিস ক্যাটাগরি</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">সঠিক মূল্যে সেরা সার্ভিসের নিশ্চয়তা</p>
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
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catServices.map(service => (
                    <Card key={service.id} className="group overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-900">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <Wrench className="w-6 h-6" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 h-10">{service.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                          <PriceDisplay 
                            amountPoisha={service.base_price} 
                            pricingModel={service.pricing_model} 
                            discountPercentage={service.discount_percentage}
                            size="md"
                          />
                          <Link to={`/book/${service.id}`}>
                            <Button className=" px-6 shadow-sm hover:shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all">
                              বিস্তারিত <ChevronRight className="w-4 h-4 ml-1" />
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
            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
              <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">কোনো সার্ভিস পাওয়া যায়নি!</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20  text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">ভেরিফাইড প্রোভাইডার</h3>
              <p className="text-slate-500 dark:text-slate-400">আমাদের সকল প্রোভাইডারদের ব্যাকগ্রাউন্ড এবং NID ভেরিফাই করা হয়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20  text-orange-600 dark:text-orange-400">
                <Clock className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">সময়মতো সার্ভিস</h3>
              <p className="text-slate-500 dark:text-slate-400">আপনার দেওয়া নির্ধারিত সময়ে প্রোভাইডার পৌঁছে যাবে আপনার দোরগোড়ায়।</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20  text-green-600 dark:text-green-400">
                <ThumbsUp className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">১০০% সন্তুষ্টি গ্যারান্টি</h3>
              <p className="text-slate-500 dark:text-slate-400">কাজের পর কোনো সমস্যা হলে আমরা বিনা খরচে সমাধান করে দেব।</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
