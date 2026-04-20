/**
 * CriticalAlertModal Component
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Clock, Activity, User, CheckCircle } from 'lucide-react';

export interface Alert {
  id: string | number;
  type?: string;
  message?: string;
  source?: string;
  workerName: string;
  location?: any; 
  lat?: number; // أضفنا هذي عشان تتطابق مع الفلاسك
  lng?: number; // أضفنا هذي عشان تتطابق مع الفلاسك
  date?: string;
  time?: string;
  confidence?: number | string;
}

export interface CriticalAlertModalProps {
  alert: Alert | null;
  onClose: () => void;
  onResolve: (id: string | number) => void;
}

export function CriticalAlertModal({ alert, onClose, onResolve }: CriticalAlertModalProps) {
  if (!alert) return null;

  const hazardType = alert.message || alert.type || 'Hazard Detected';
  const isPothole = hazardType.toLowerCase().includes("pothole");
  
  let confidenceLevel = "98%"; 
  if (alert.confidence) {
    confidenceLevel = String(alert.confidence).includes('%') 
      ? String(alert.confidence) 
      : `${alert.confidence}%`;
  } else if (alert.source) {
    const match = String(alert.source).match(/\d+(\.\d+)?%/);
    if (match) confidenceLevel = match[0];
  }

  const displayDate = alert.date || new Date().toLocaleDateString('en-GB'); 
  const displayTime = alert.time || 'Unknown Time';

  const themeColor = isPothole ? "text-yellow-500" : "text-red-500";
  const themeBg = isPothole ? "bg-yellow-100" : "bg-red-100";

  const handleResolveAndClose = () => {
    onResolve(alert.id);
    onClose(); 
  };

  // 🟢 [التعديل الذكي هنا]: سحبنا الإحداثيات من الفلاسك وجهزناها كرابط
  const alertLat = alert.lat || (alert.location && alert.location.lat);
  const alertLng = alert.lng || (alert.location && alert.location.lng);

  const locationDisplay = (alertLat && alertLng) ? (
    <a 
      href={`https://www.google.com/maps/search/?api=1&query=${alertLat},${alertLng}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="cursor-pointer text-blue-600 underline transition-colors hover:text-blue-800"
    >
      {Number(alertLat).toFixed(4)}, {Number(alertLng).toFixed(4)}
    </a>
  ) : (
    <span className="text-gray-500">N/A</span>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="relative z-50 w-96 overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full ${themeBg} ${themeColor} shadow-sm`}>
              <AlertTriangle size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase leading-tight text-gray-900">
                {hazardType}
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                Critical Alert
              </p>
            </div>
          </div>

          <div className="mb-6 flex items-center gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
              <User size={20} />
            </div>
            <div>
              <span className="mb-1 block text-xs font-bold uppercase text-gray-400">
                Reported By
              </span>
              <span className="block text-base font-bold text-gray-800">
                {alert.workerName || 'Unknown Worker'}
              </span>
            </div>
          </div>

          <div className="mb-8 space-y-2">
            {/* 🟢 تمرير الرابط المجهز للـ InfoRow */}
            <InfoRow 
              icon={<MapPin size={18} />} 
              label="Location" 
              value={locationDisplay} 
            />
            <InfoRow 
              icon={<Clock size={18} />} 
              label="Date & Time" 
              value={`${displayDate} • ${displayTime}`} 
            />
            <InfoRow 
              icon={<Activity size={18} />} 
              label="AI Confidence" 
              value={confidenceLevel} 
              valueClassName="text-blue-600"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleResolveAndClose}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-500 py-3.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-green-600"
            >
              <CheckCircle size={18} />
              Resolved
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/**
 * InfoRow Sub-component:
 */
function InfoRow({ 
  icon, 
  label, 
  value, 
  valueClassName = "text-gray-800" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: any; 
  valueClassName?: string;
}) {
  
  let displayValue: any = "N/A";
  
  // 🟢 [التعديل هنا]: سمحنا للدالة إنها تقرأ روابط الـ HTML اللي أرسلناها
  if (React.isValidElement(value)) {
    displayValue = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    displayValue = String(value);
  } else if (value && typeof value === 'object' && 'lat' in value && 'lng' in value) {
    displayValue = `${Number(value.lat).toFixed(4)}, ${Number(value.lng).toFixed(4)}`;
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0">
      <div className="flex items-center gap-3 text-gray-500">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className={`max-w-[160px] truncate text-right text-sm font-bold ${valueClassName}`}>
        {displayValue}
      </span>
    </div>
  );
}