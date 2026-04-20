/**
 * MapView Component
 * A custom-projected, grid-based visualization of the construction site.
 * This component maps GPS coordinates (lat/lng) onto a 2D Cartesian plane 
 * using Framer Motion for fluid marker animations and real-time hazard alerts.
 */

import { Helmet, Alert } from '../types';
import { MapPin, HardHat, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapViewProps {
  helmets: Helmet[];     // Active helmet sensor data array
  alerts: Alert[];       // Real-time security alerts from the backend
  onHelmetClick: (helmet: Helmet) => void;
}

export function MapView({ helmets, alerts, onHelmetClick }: MapViewProps) {
  /**
   * Spatial Projection Logic:
   * Dynamically calculates map boundaries and center points to ensure 
   * all active helmets are automatically scaled within the viewing area.
   */
  const lats = helmets.map(h => h.location.lat);
  const lngs = helmets.map(h => h.location.lng);
  
  // Calculate geographical center of the active area
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  
  // Calculate coordinate span to determine zoom scale
  const latRange = Math.max(...lats) - Math.min(...lats) || 0.01;
  const lngRange = Math.max(...lngs) - Math.min(...lngs) || 0.01;
  
  /**
   * Coordinate-to-Pixel Projection:
   * Maps spherical GPS coordinates to percentage-based CSS positions.
   * Inverts the Y-axis to match standard screen coordinate systems.
   */
  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - centerLng) / lngRange) * 60 + 50; // Horizontal centering
    const y = ((centerLat - lat) / latRange) * 60 + 50; // Vertical centering + inversion
    return { x: `${x}%`, y: `${y}%` };
  };

  /**
   * Status Logic:
   * Cross-references active, unresolved alerts with specific helmet IDs.
   */
  const getHelmetStatus = (helmetId: string) => {
    const hasAlert = alerts.some(a => a.helmetId === helmetId && !a.resolved);
    return hasAlert ? 'alert' : 'active';
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-100">
      
      {/* Structural Backdrop: SVG Grid Pattern for site topography simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-200">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(148 163 184)" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Ambient Map Effects: Highlighting specific work zones */}
        <div className="absolute left-1/4 top-1/4 h-1/3 w-1/3 rounded-full bg-green-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-1/4 w-1/4 rounded-full bg-blue-100 opacity-30 blur-2xl"></div>
      </div>

      {/* Site Location Badge */}
      <div className="absolute left-4 top-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-semibold uppercase tracking-tight text-slate-700">KFU Construction Site</span>
        </div>
      </div>

      {/* Visual Legend: Safety Color Codes */}
      <div className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-slate-700">SAFE PERSONNEL</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
            <span className="text-slate-700">ACTIVE HAZARD</span>
          </div>
        </div>
      </div>

      {/* Dynamic Personnel Markers */}
      {helmets.map((helmet) => {
        const pos = getPosition(helmet.location.lat, helmet.location.lng);
        const status = getHelmetStatus(helmet.id);
        const isAlert = status === 'alert';

        return (
          <motion.div
            key={helmet.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 transform cursor-pointer"
            style={{ left: pos.x, top: pos.y }}
            onClick={() => onHelmetClick(helmet)}
            whileHover={{ scale: 1.2 }}
            animate={isAlert ? { scale: [1, 1.3, 1] } : {}}
            transition={isAlert ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <div className="group relative">
              {/* Personnel Hub Icon */}
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-colors
                  ${isAlert 
                    ? 'border-red-700 bg-red-500' 
                    : 'border-green-700 bg-green-500'
                  }
                `}
              >
                {isAlert ? (
                  <AlertTriangle className="h-5 w-5 text-white" />
                ) : (
                  <HardHat className="h-5 w-5 text-white" />
                )}
              </div>

              {/* Emergency Radar Animation: Pulsing ring for safety alerts */}
              {isAlert && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500 opacity-30"
                  animate={{ scale: [1, 2, 2.5], opacity: [0.3, 0.1, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* Contextual Information Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100">
                <div className="whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-[10px] leading-tight text-white shadow-2xl">
                  <div className="mb-1 border-b border-slate-700 pb-1 font-bold">{helmet.workerName}</div>
                  <div className="text-slate-400">ID: {helmet.id}</div>
                  <div className={`mt-1 font-black ${isAlert ? 'text-red-400' : 'text-green-400'}`}>
                    {isAlert ? '⚠ HAZARD DETECTED' : '✓ SECURE'}
                  </div>
                </div>
                {/* Tooltip Tail */}
                <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 transform border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Manual Zoom Controls: Functional placeholders for UI interaction */}
      <div className="absolute bottom-4 right-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <button className="block border-b border-slate-200 px-3 py-2 font-bold text-slate-700 transition-all hover:bg-slate-100">+</button>
        <button className="block px-3 py-2 font-bold text-slate-700 transition-all hover:bg-slate-100">−</button>
      </div>

      {/* Spatial Reference: Scale Indicator */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 shadow-sm backdrop-blur-sm">
        Grid Scale: 1:1000m
      </div>
    </div>
  );
}