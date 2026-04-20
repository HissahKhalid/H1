
/**
 * AlertFeed Component
 * This component provides a live, scrollable list of active safety hazards.
 * It visualizes real-time data from the AI camera and sensors, allowing the 
 * Safety Officer to quickly identify who is at risk and the nature of the hazard.
 */

// 🟢 1. أضفنا استيراد الأيقونات الناقصة (Hammer للحادة، AlertCircle لغير المعروف)
import { AlertTriangle, Clock, Activity, MapPin, ChevronRight, User, ShieldCheck, Hammer, AlertCircle } from 'lucide-react';
import { Alert } from '../types';

interface AlertFeedProps {
  alerts: Alert[]; // Array of active, unresolved safety alerts
  onAlertClick?: (alert: Alert) => void; // Trigger for opening the CriticalAlertModal
  onClearAll?: () => void; // Bulk resolution action for the database
}

export function AlertFeed({ alerts = [], onAlertClick, onClearAll }: AlertFeedProps) {
  
  // ==========================================
  // 🟢 2. الدالة الذكية لتحديد الألوان والأيقونات بناءً على نوع الخطر
  // ==========================================
  const getHazardStyle = (message?: string) => {
    const text = (message || '').toLowerCase();
    
    if (text.includes('sharp')) {
      return {
        icon: <Hammer className="h-5 w-5" />,
        colorText: 'text-orange-600',
        bgIcon: 'bg-orange-50',
        borderIcon: 'border-orange-100',
        sideBar: 'bg-orange-500',
        textTitle: 'text-orange-700',
        hoverBorder: 'hover:border-orange-300'
      };
    }
    if (text.includes('pothole')) {
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        colorText: 'text-red-600',
        bgIcon: 'bg-red-50',
        borderIcon: 'border-red-100',
        sideBar: 'bg-red-500',
        textTitle: 'text-red-700',
        hoverBorder: 'hover:border-red-300'
      };
    }
    if (text.includes('fall')) {
      return {
        icon: <Activity className="h-5 w-5" />,
        colorText: 'text-purple-600',
        bgIcon: 'bg-purple-50',
        borderIcon: 'border-purple-100',
        sideBar: 'bg-purple-500',
        textTitle: 'text-purple-700',
        hoverBorder: 'hover:border-purple-300'
      };
    }
    
    // اللون الافتراضي لأي خطر غير محدد
    return {
      icon: <AlertCircle className="h-5 w-5" />,
      colorText: 'text-gray-600',
      bgIcon: 'bg-gray-50',
      borderIcon: 'border-gray-100',
      sideBar: 'bg-gray-500',
      textTitle: 'text-gray-700',
      hoverBorder: 'hover:border-gray-300'
    };
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-slate-200 bg-slate-50 font-sans">
      
      {/* Header Section: Real-time Status Monitoring */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-slate-800">
            <Activity className="h-4 w-4 text-purple-600" />
            Safety Live Feed
          </h3>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs font-bold ${alerts.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {alerts.length > 0 ? `${alerts.length} Active Hazards` : 'All Systems Safe'}
            </span>
          </div>
        </div>
        
        {alerts.length > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClearAll?.(); }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-400 transition-all hover:border-red-200 hover:text-red-600"
          >
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Alerts List: Chronological Container */}
      <div className="scrollbar-thin scrollbar-thumb-slate-300 flex-1 space-y-3 overflow-y-auto p-4">
        
        {alerts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <h4 className="font-bold text-slate-800">Secure Environment</h4>
            <p className="mt-1 text-xs text-slate-400">No active hazards detected.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            // 🟢 3. نستدعي الدالة لكل تنبيه عشان نحدد الستايل حقه
            const style = getHazardStyle(alert.message);

            return (
              <div 
                key={alert.id} 
                onClick={() => onAlertClick?.(alert)}
                // 🟢 غيرنا تأثير الـ Hover عشان يطابق لون الخطر
                className={`group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md ${style.hoverBorder}`}
              >
                {/* 🟢 الخط الجانبي يعكس لون الخطر */}
                <div className={`absolute bottom-0 left-0 top-0 w-1 ${style.sideBar}`}></div>
                
                <div className="flex gap-3 p-4">
                  {/* 🟢 الأيقونة وخلفيتها تعكس الخطر */}
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border ${style.borderIcon} ${style.bgIcon} ${style.colorText}`}>
                    {style.icon}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      {/* 🟢 لون عنوان الخطر */}
                      <span className={`text-[10px] font-black uppercase ${style.textTitle}`}>{alert.message}</span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={10} /> {alert.time}
                      </span>
                    </div>
                    
                    <h4 className="flex items-center gap-2 truncate text-sm font-bold text-slate-900">
                      <User size={12} className="text-slate-400" /> {alert.workerName}
                    </h4>
                    
                    <p className="mt-1 line-clamp-1 text-[11px] italic text-slate-500">
                      Detected with {alert.source}
                    </p>
                  </div>

                  <ChevronRight size={16} className={`self-center text-slate-300 transition-colors ${style.colorText.replace('text-', 'group-hover:text-')}`} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}