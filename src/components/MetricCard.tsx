import React from 'react';
import { TrendingUp, Fuel, Clock, Zap, DollarSign, Activity } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'cyan' | 'teal';
}

const colorConfig = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-700',
    IconComponent: Clock
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    text: 'text-green-700',
    IconComponent: TrendingUp
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    text: 'text-orange-700',
    IconComponent: Fuel
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    icon: 'bg-red-500',
    text: 'text-red-700',
    IconComponent: DollarSign
  },
  cyan: {
    gradient: 'from-cyan-500 to-cyan-600',
    bg: 'bg-cyan-50',
    icon: 'bg-cyan-500',
    text: 'text-cyan-700',
    IconComponent: Zap
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50',
    icon: 'bg-teal-500',
    text: 'text-teal-700',
    IconComponent: Activity
  }
};

export function MetricCard({ title, value, suffix = '', color = 'blue' }: MetricCardProps) {
  const config = colorConfig[color];
  const IconComponent = config.IconComponent;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`${config.bg} px-6 py-5 border-b border-gray-100`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
          <div className={`${config.icon} p-2 rounded-lg shadow-md`}>
            <IconComponent className="text-white" size={18} />
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="text-3xl font-bold text-gray-900">
          {value}
          {suffix && <span className="text-xl font-medium text-gray-500 ml-1">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}