import React from 'react';
import { Clock, Search, CheckCircle, PlayCircle, XCircle, AlertCircle, CreditCard, CheckCircle2, ShieldCheck, Banknote } from 'lucide-react';

interface PriceDisplayProps {
  amountPoisha: number;
  pricingModel?: string; // 'fixed', 'hourly', 'starting_at'
  discountPercentage?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export function formatBDT(poisha: number): string {
  return `৳${(poisha / 100).toLocaleString('bn-BD')}`;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amountPoisha,
  pricingModel = 'fixed',
  discountPercentage = 0,
  className = '',
  size = 'md',
  showLabel = true
}) => {
  const originalPrice = amountPoisha;
  const currentPrice = discountPercentage > 0 
    ? originalPrice - (originalPrice * (discountPercentage / 100)) 
    : originalPrice;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const textClass = `${sizeClasses[size]} font-bold ${className}`;

  let prefix = '';
  let suffix = '';
  let label = '';

  if (pricingModel === 'starting_at') {
    prefix = 'শুরু ';
    suffix = '+';
    label = 'বেস প্রাইস';
  } else if (pricingModel === 'hourly') {
    suffix = '/ঘণ্টা';
    label = 'ঘণ্টা প্রতি';
  } else {
    label = 'ফিক্সড প্রাইস';
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {showLabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <span className={`${textClass} text-slate-900 dark:text-slate-50 tracking-tight`}>
          {prefix}{formatBDT(currentPrice)}{suffix}
        </span>
        {discountPercentage > 0 && (
          <span className="text-sm text-slate-400 dark:text-slate-500 line-through font-medium">
            {formatBDT(originalPrice)}
          </span>
        )}
      </div>
      {discountPercentage > 0 && (
        <span className="inline-flex mt-1">
          <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-wider dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
            {discountPercentage}% ছাড়
          </span>
        </span>
      )}
    </div>
  );
};

export const StatusBadge: React.FC<{ status: string, type?: 'booking' | 'payment', detailed?: boolean }> = ({ status, type = 'booking', detailed = false }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let label = status;
  let Icon = AlertCircle;
  let description = '';

  if (type === 'booking') {
    switch (status) {
      case 'pending': 
        bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'; 
        label = 'অপেক্ষমাণ'; 
        Icon = Clock;
        description = 'আপনার বুকিংটি গ্রহণ করার জন্য অপেক্ষা করা হচ্ছে';
        break;
      case 'matching': 
        bg = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'; 
        label = 'প্রোভাইডার খোঁজা হচ্ছে'; 
        Icon = Search;
        description = 'আপনার কাজের জন্য সঠিক প্রোভাইডার খোঁজা হচ্ছে';
        break;
      case 'accepted': 
        bg = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'; 
        label = 'কাজটি গৃহীত'; 
        Icon = ShieldCheck;
        description = 'প্রোভাইডার আপনার কাজটি গ্রহণ করেছেন';
        break;
      case 'ongoing': 
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'; 
        label = 'চলমান'; 
        Icon = PlayCircle;
        description = 'প্রোভাইডার বর্তমানে কাজ করছেন';
        break;
      case 'completed': 
        bg = 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'; 
        label = 'সম্পূর্ণ'; 
        Icon = CheckCircle2;
        description = 'কাজটি সফলভাবে সম্পন্ন হয়েছে';
        break;
      case 'cancelled': 
        bg = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'; 
        label = 'বাতিল'; 
        Icon = XCircle;
        description = 'বুকিংটি বাতিল করা হয়েছে';
        break;
    }
  } else {
    switch (status) {
      case 'pending': 
        bg = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'; 
        label = 'পেমেন্ট অপেক্ষমাণ'; 
        Icon = CreditCard;
        break;
      case 'authorized': 
        bg = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'; 
        label = 'অথোরাইজড'; 
        Icon = ShieldCheck;
        break;
      case 'paid': 
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'; 
        label = 'পরিশোধিত'; 
        Icon = Banknote;
        break;
      case 'failed': 
        bg = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'; 
        label = 'পেমেন্ট ব্যর্থ'; 
        Icon = XCircle;
        break;
      case 'refunded': 
        bg = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'; 
        label = 'রিফান্ডেড'; 
        Icon = ShieldCheck;
        break;
    }
  }

  if (detailed) {
    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border shadow-sm ${bg}`}>
        <Icon className="w-5 h-5 mt-0.5 opacity-80" />
        <div>
          <p className="font-bold text-sm">{label}</p>
          {description && <p className="text-xs mt-0.5 opacity-90">{description}</p>}
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};
