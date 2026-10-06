import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Wrench, Search, Star, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/ui/PriceDisplay';

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Real stats
  const [totalProviders, setTotalProviders] = useState(0);
    const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { data: catData } = await supabase.from('categories').select('*').is('archived_at', null);
      if (catData) setCategories(catData);

      const { data: srvData } = await supabase.from('services').select('*').is('archived_at', null);
      if (srvData) setServices(srvData);
      
            
      const { count: provCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'provider');
      if (provCount) setTotalProviders(provCount);
      
      const { count: jobCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      if (jobCount) setTotalCompleted(jobCount);
    }
    fetchData();
  }, []);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Premium Hero Section */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] dark:from-[#0F172A] dark:to-[#1E293B] pt-20 lg:pt-32 pb-24 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-[bottom_1px_center]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black)' }}></div>
        <div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-[1.15] mb-8">
                প্রয়োজন বিশ্বস্ত টেকনিশিয়ান? <span className="text-blue-600 dark:text-blue-400">কাজবন্ধু</span> আছে আপনার পাশে।
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                এসি রিপেয়ার, প্লাম্বিং থেকে শুরু করে হোম ক্লিনিং—ভেরিফাইড প্রফেশনালদের মাধ্যমে যেকোনো কাজ করান নিশ্চিন্তে।
              </p>
              
              {/* Search Bar - Premium Style */}
              <div className="relative max-w-xl shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/20 rounded-2xl bg-white dark:bg-slate-800 p-2 flex items-center border border-slate-200 dark:border-slate-700">
                <Search className="w-6 h-6 text-slate-400 ml-4 mr-2 hidden sm:block" />
                <Input 
                  placeholder="কোন সার্ভিসটি খুঁজছেন?" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if(e.key === "Enter") document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}
                  className="border-0 focus-visible:ring-0 text-lg h-14 bg-transparent dark:text-slate-50 shadow-none px-2 sm:px-0"
                />
                <Button onClick={() => { document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }} className="h-14 px-6 sm:px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 font-bold text-base sm:text-lg transition-transform active:scale-95 shrink-0">
                  সার্চ করুন
                </Button>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> ভেরিফাইড প্রোভাইডার
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                  <Star className="w-4 h-4 text-amber-500" /> টপ রেটেড সার্ভিস
                </div>
              </div>
            </div>

            {/* Right Content - Animated Hero Visual */}
            <div className="relative mt-12 lg:mt-0 h-[350px] sm:h-[450px] lg:h-[520px] w-full max-w-[320px] sm:max-w-md mx-auto lg:max-w-none flex-shrink-0 flex items-center justify-center lg:justify-end pr-0 lg:pr-12">
              
              {/* Animated Glowing Orbs Background */}
              <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-blue-500/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
              <div className="absolute top-1/2 left-1/2 lg:left-2/3 -translate-x-1/3 -translate-y-2/3 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite_alternate]"></div>

              {/* Main Center Piece - Glassmorphism Sphere/Card */}
              <div className="relative z-10 w-[260px] sm:w-[320px] lg:w-[360px] aspect-square rounded-full border-[8px] border-white/60 dark:border-slate-800/60 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.15)] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl flex flex-col items-center justify-center transform transition-transform duration-700 hover:scale-[1.02]">
                
                {/* Inner Animated Rings */}
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 dark:border-blue-400/10 border-dashed animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-indigo-400/30 dark:border-indigo-400/10 animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* Center Content */}
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/30 transform rotate-12 transition-all duration-500 hover:rotate-0 hover:scale-110 mb-4 sm:mb-6">
                    <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center leading-none">
                    Trusted<br/>Team
                  </h3>
                  <div className="mt-3 sm:mt-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-800/50 px-3 sm:px-4 py-1.5 rounded-full shadow-sm">
                    <p className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300">
                      50+ Expert Professionals
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 - Top Left */}
              <div className="absolute z-20 top-[5%] sm:top-[10%] left-[-5%] sm:left-[5%] lg:-left-[10%] animate-[bounce_4s_ease-in-out_infinite]">
                <div className="bg-white/90 dark:bg-slate-800/90 p-2 sm:p-3 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-3 backdrop-blur-xl">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 sm:p-3 rounded-xl shadow-lg shadow-green-500/20">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="pr-2 sm:pr-4">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Verified</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 leading-none">100% Secure</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 2 - Bottom Right */}
              <div className="absolute z-20 bottom-[10%] sm:bottom-[15%] right-[-5%] sm:right-[5%] lg:-right-[5%] animate-[bounce_5s_ease-in-out_infinite_alternate]">
                <div className="bg-white/90 dark:bg-slate-800/90 p-2 sm:p-3 rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 flex items-center gap-3 backdrop-blur-xl">
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 sm:p-3 rounded-xl shadow-lg shadow-amber-500/20">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20" />
                  </div>
                  <div className="pr-2 sm:pr-4">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Top Rated</p>
                    <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-50 leading-none">4.9/5 Rating</p>
                  </div>
                </div>
              </div>

              {/* Floating Element 3 - Bottom Left (Small icon) */}
              <div className="absolute z-10 bottom-[0%] sm:bottom-[5%] left-[5%] sm:left-[15%] lg:left-[0%] animate-[bounce_6s_ease-in-out_infinite]">
                <div className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center transform -rotate-12">
                  <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Floating Element 4 - Top Right (Small tag) */}
              <div className="absolute z-10 top-[15%] sm:top-[20%] right-[0%] sm:right-[10%] lg:right-[5%] animate-[bounce_3s_ease-in-out_infinite_alternate]">
                <div className="bg-slate-900 dark:bg-blue-600 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-xl shadow-slate-900/20 dark:shadow-blue-600/20 flex items-center justify-center transform rotate-6 border border-slate-700 dark:border-blue-500">
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide">24/7 Service</span>
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </motion.section>

      {/* Real Statistics / Trust Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="py-20 lg:py-32 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 max-w-2xl leading-tight">
              হাজারো পরিবারের আস্থার প্রতীক।
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md md:text-right leading-relaxed font-medium">
              দীর্ঘদিন ধরে আমরা নির্ভরযোগ্য প্রফেশনালদের মাধ্যমে দৈনন্দিন সার্ভিস প্রদান করে জীবনকে সহজ করে আসছি।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FEF9C3] dark:bg-amber-900/20 p-8 rounded-[2.5rem] min-h-[220px] flex flex-col justify-between border border-amber-100 dark:border-amber-800/30 transition-transform hover:-translate-y-2 duration-300">
              <div>
                <h3 className="text-5xl font-extrabold text-slate-900 dark:text-amber-400 mb-2">{totalCompleted > 0 ? `${totalCompleted}+` : '100+'}</h3>
                <p className="text-amber-900/80 dark:text-amber-200/80 font-bold">Jobs Completed</p>
              </div>
              <p className="text-sm text-amber-900/60 dark:text-amber-200/50 font-medium mt-6">Across Dhaka City</p>
            </div>
            
            <div className="bg-[#FCE7F3] dark:bg-pink-900/20 p-8 rounded-[2.5rem] min-h-[220px] flex flex-col justify-between border border-pink-100 dark:border-pink-800/30 transition-transform hover:-translate-y-2 duration-300">
              <div>
                <h3 className="text-5xl font-extrabold text-slate-900 dark:text-pink-400 mb-2">{totalProviders > 0 ? totalProviders : '50+'}</h3>
                <p className="text-pink-900/80 dark:text-pink-200/80 font-bold">Verified Partners</p>
              </div>
              <p className="text-sm text-pink-900/60 dark:text-pink-200/50 font-medium mt-6">Skilled & Background-Checked</p>
            </div>
            
            <div className="bg-[#E0F2FE] dark:bg-blue-900/20 p-8 rounded-[2.5rem] min-h-[220px] flex flex-col justify-between border border-blue-100 dark:border-blue-800/30 transition-transform hover:-translate-y-2 duration-300 lg:col-span-2">
              <div>
                <h3 className="text-5xl font-extrabold text-slate-900 dark:text-blue-400 mb-2">98%</h3>
                <p className="text-blue-900/80 dark:text-blue-200/80 font-bold">Customer Satisfaction</p>
              </div>
              <p className="text-sm text-blue-900/60 dark:text-blue-200/50 font-medium mt-6">Based on real post-service ratings and reviews</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Services Catalog - Modern Grid */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} id="services" className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-6">জনপ্রিয় সার্ভিস সমূহ</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              অভিজ্ঞ টেকনিশিয়ান দিয়ে আপনার ঘরের যেকোনো কাজ করিয়ে নিন নিশ্চিন্তে।
            </p>
          </div>

          {search && filteredServices.length === 0 && (
            <div className="text-center py-24 text-slate-500 dark:text-slate-400">
              <Search className="w-20 h-20 mx-auto mb-6 opacity-20" />
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">কোনো সার্ভিস পাওয়া যায়নি!</p>
            </div>
          )}

          {categories.map((category) => {
            const catServices = search 
              ? filteredServices.filter(s => s.category_id === category.id)
              : services.filter(s => s.category_id === category.id);
              
            if (catServices.length === 0) return null;

            return (
              <div key={category.id} className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-12">
                  <div className="text-5xl bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">{category.icon_url}</div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {catServices.map(service => (
                    <Card key={service.id} className="group border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-full">
                      <CardContent className="p-8 flex flex-col h-full">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-[1.5rem] flex items-center justify-center text-slate-900 dark:text-slate-50 mb-8 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors duration-300 shadow-sm border border-slate-100 dark:border-slate-600">
                          <Wrench className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-extrabold mb-3 text-slate-900 dark:text-slate-50 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-grow">{service.description}</p>
                        
                        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700/50">
                          <PriceDisplay 
                            amountPoisha={service.base_price} 
                            pricingModel={service.pricing_model} 
                            discountPercentage={service.discount_percentage}
                            size="lg"
                            className="mb-6"
                          />
                          <Link to={`/book/${service.id}`} className="block w-full">
                            <Button className="w-full h-14 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 font-bold text-base transition-transform active:scale-95 shadow-md">
                              Get Started
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
        </div>
      </motion.section>

      {/* How it Works / Why Us Split Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} id="how-it-works" className="py-24 lg:py-32 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left: Graphic */}
            <div className="relative bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 overflow-hidden group shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent dark:from-blue-900/20"></div>
              <div className="relative flex flex-col justify-center px-6 py-16 md:p-12 lg:p-16 h-full min-h-[500px] lg:min-h-[650px]">
                <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-10 leading-tight">The Reasons People Count On Us</h3>
                <div className="space-y-6">
                  {[
                    { icon: Shield, title: 'Verified & Skilled Professionals' },
                    { icon: CheckCircle2, title: 'Transparent Pricing, No Hidden Costs' },
                    { icon: Clock, title: 'On-Time Service Guarantee' },
                    { icon: UserCheck, title: '24/7 Customer Support' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white/80 dark:bg-slate-900/80 p-4 rounded-2xl backdrop-blur-md border border-white/20 dark:border-slate-700/50 shadow-sm transition-transform hover:translate-x-2">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full shrink-0"><item.icon className="w-5 h-5" /></div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-50">{item.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Steps */}
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 leading-tight">কীভাবে কাজ করে</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">মাত্র কয়েকটি ক্লিকেই পেয়ে যান আপনার কাঙ্ক্ষিত সার্ভিস।</p>
              
              <div className="space-y-12 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {[
                  { num: '01', title: 'সার্ভিস নির্বাচন করুন', desc: 'আপনার প্রয়োজনীয় সার্ভিসটি ক্যাটাগরি থেকে বেছে নিন।' },
                  { num: '02', title: 'বুকিং কনফার্ম করুন', desc: 'আপনার ঠিকানা এবং সুবিধাজনক সময় দিয়ে বুকিং সম্পন্ন করুন।' },
                  { num: '03', title: 'টেকনিশিয়ান পৌঁছাবে', desc: 'ম্যাচ হওয়া প্রোভাইডার আপনার দেওয়া সময়ে চলে আসবে।' },
                  { num: '04', title: 'কাজ শেষে পেমেন্ট', desc: 'কাজ সন্তোষজনক হলে নির্ধারিত মূল্য পেমেন্ট করুন।' }
                ].map((step, idx) => (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-900 dark:bg-blue-600 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold text-lg transition-transform group-hover:scale-110">
                      {step.num}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors">
                      <h4 className="font-extrabold text-xl text-slate-900 dark:text-slate-50 mb-3">{step.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* Final CTA / Provider Section */}
      <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="py-24 lg:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-[#F8FAFC] dark:bg-slate-800 rounded-[3rem] p-12 md:p-24 text-center shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/10 opacity-50"></div>
             <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
                  Need Help Today? <br/> We're Just A Click Away.
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                  Order Now And Experience Delivery The Way It Should Be - Fast, Safe, And Simple.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link to="/#services" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-lg font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.2)] dark:shadow-[0_20px_40px_rgb(37,99,235,0.2)] transition-all hover:-translate-y-1 hover:scale-105">
                      Book A Service Now
                    </Button>
                  </Link>
                  <Link to="/apply" className="w-full sm:w-auto mt-4 sm:mt-0">
                     <p className="text-slate-500 font-bold hover:text-blue-600 underline underline-offset-4">or Become a Partner</p>
                  </Link>
                </div>
             </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
