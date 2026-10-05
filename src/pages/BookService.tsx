import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { PriceDisplay, formatBDT } from '@/components/ui/PriceDisplay';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function LocationPicker({ position, setPosition, setAddress }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        .then(res => res.json())
        .then(data => {
          if (data.display_name) setAddress(data.display_name);
        });
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [position, setPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchService() {
      const { data } = await supabase.from('services').select('*').eq('id', id).single();
      if (data) setService(data);
    }
    fetchService();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setPosition({ lat: 23.8103, lng: 90.4125 })
      );
    }
  }, [id]);

  const handleBooking = async () => {
    if (!address || !date || !position) {
      alert('অনুগ্রহ করে তারিখ এবং ম্যাপ থেকে ঠিকানা নির্বাচন করুন।');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('বুকিং করতে লগইন করুন');
      navigate('/login');
      return;
    }

    const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
    if (roleData?.role !== 'customer') {
      alert('শুধুমাত্র গ্রাহকরা বুকিং করতে পারবেন।');
      setLoading(false);
      return;
    }

    const currentPrice = service.discount_percentage > 0 
      ? service.base_price - (service.base_price * (service.discount_percentage / 100)) 
      : service.base_price;

    const { error } = await supabase.from('bookings').insert({
      customer_id: user.id,
      service_id: service.id,
      address,
      lat: position.lat,
      lng: position.lng,
      scheduled_at: new Date(date).toISOString(),
      total_price: currentPrice,
      status: 'pending'
    });

    setLoading(false);

    if (error) {
      alert('বুকিং ব্যর্থ হয়েছে: ' + error.message);
    } else {
      alert('আপনার বুকিং সফলভাবে গ্রহণ করা হয়েছে!');
      navigate('/dashboard');
    }
  };

  if (!service) return <div className="p-8 text-center dark:text-slate-400">লোড হচ্ছে...</div>;

  const originalPrice = service.base_price;
  const currentPrice = service.discount_percentage > 0 
    ? originalPrice - (originalPrice * (service.discount_percentage / 100)) 
    : originalPrice;

  return (
    <div className="container mx-auto p-4 max-w-4xl mt-8 mb-20">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header section */}
        <div className="bg-blue-600 dark:bg-blue-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">{service.name}</h1>
          <p className="text-blue-50 mb-6 max-w-2xl">{service.description}</p>
          <div className="bg-white/10 rounded-xl p-4 inline-block">
            <PriceDisplay 
              amountPoisha={service.base_price} 
              pricingModel={service.pricing_model} 
              discountPercentage={service.discount_percentage}
              size="lg"
              className="text-white"
            />
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">আপনার বুকিং বিস্তারিত</h3>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">কবে এবং কখন সার্ভিসটি চাচ্ছেন?</label>
              <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" type="datetime-local" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ম্যাপে আপনার সঠিক লোকেশন পিন করুন</label>
              <div className="h-64 rounded-xl overflow-hidden border-2 border-blue-100 dark:border-slate-700 z-10 relative">
                {position && (
                  <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={position} setPosition={setPosition} setAddress={setAddress} />
                  </MapContainer>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">আপনার সম্পূর্ণ ঠিকানা (ম্যাপ থেকে স্বয়ংক্রিয়ভাবে আসতে পারে)</label>
              <Input className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50" type="text" 
                placeholder="যেমন: বাসা-১০, রোড-২, মিরপুর, ঢাকা" 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
                
              />
            </div>
          </div>
        </div>
        
        {/* Checkout Summary */}
        <div className="bg-slate-50 dark:bg-slate-800 p-8 border-t border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-50">পেমেন্ট সামারি</h4>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{service.pricing_model === 'starting_at' ? 'বেস সার্ভিস ফি' : 'সার্ভিস ফি'}</span>
              <span>{formatBDT(originalPrice)}</span>
            </div>
            {service.discount_percentage > 0 && (
              <div className="flex justify-between text-red-600 dark:text-red-400 font-medium">
                <span>ডিসকাউন্ট ({service.discount_percentage}%)</span>
                <span>- {formatBDT(originalPrice - currentPrice)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 text-sm italic">
              <span>প্ল্যাটফর্ম ফি (সার্ভিস ফি এর অন্তর্ভুক্ত)</span>
              <span>প্রযোজ্য</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-4 border-t border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-50">
              <span>সর্বমোট {service.pricing_model === 'starting_at' ? '(আনুমানিক)' : ''}</span>
              <span>{formatBDT(currentPrice)}</span>
            </div>
            {service.pricing_model === 'starting_at' && (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1">
                * প্রয়োজনীয় মেটেরিয়াল এবং অতিরিক্ত কাজের উপর নির্ভর করে মূল ফি পরিবর্তন হতে পারে
              </p>
            )}
          </div>
          
          <Button 
            className="w-full h-14 text-lg rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-all" 
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? 'প্রসেসিং...' : 'বুকিং নিশ্চিত করুন'}
          </Button>
        </div>
      </div>
    </div>
  );
}
