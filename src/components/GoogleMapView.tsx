/**
 * GoogleMapView Demo Component
 * A high-fidelity simulated tracking interface used for visual demonstrations.
 * Key Features:
 * 1. High-resolution satellite backdrop using ArcGIS tiles.
 * 2. Radar-scanning animations to simulate sensor signaling.
 * 3. Radial distribution logic for worker markers around a central gateway.
 * 4. Interactive tooltips and status indicators.
 */

import { motion } from 'motion/react';
import { MapPin, Navigation, Layers, Plus, Minus, ShieldCheck, Maximize } from 'lucide-react';
import { Helmet } from '../types';

interface GoogleMapViewProps {
  helmets: Helmet[];
  onHelmetClick?: (helmet: Helmet) => void;
}

export default function GoogleMapView({ helmets, onHelmetClick }: GoogleMapViewProps) {
  /**
   * Technical Note: 
   * This version is optimized for performance and works without an API Key.
   * It uses ArcGIS imagery to represent the work site environment.
   */
  
  return (
    <div className="w-full h-full relative bg-slate-900 rounded-2xl overflow-hidden shadow-inner group">
      
      {/* 1. Map Foundation: High-quality satellite imagery tile */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-105"
        style={{ 
          // Aerial imagery showing buildings to simulate a construction site context
          backgroundImage: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/17/54460/82545')",
          filter: "brightness(0.8) contrast(1.2)"
        }}
      />
      
      {/* Visual Overlay: Geometric noise texture for a professional digital feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

      {/* 2. Sensor Radar Effect: Simulates active scanning for LoRaWAN signals */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[600px] h-[600px] rounded-full border border-blue-500/10 animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-0 w-[400px] h-[400px] m-auto rounded-full border border-blue-500/20 animate-pulse"></div>
      </div>

      {/* 3. Simulated UI Controls: Mimics standard Google Maps UI elements */}
      <div className="absolute right-4 bottom-8 flex flex-col gap-2 z-20">
        <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700 transition-colors">
          <Plus size={20} />
        </button>
        <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700 transition-colors">
          <Minus size={20} />
        </button>
        <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700 transition-colors mt-2">
          <Maximize size={20} />
        </button>
      </div>
      
      <div className="absolute right-4 top-4 z-20">
        <button className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 text-gray-700">
          <Layers size={20} />
        </button>
      </div>

      {/* 4. Personnel Markers: Dynamic placement for active safety helmets */}
      <div className="absolute inset-0 z-10">
        
        {/* Central Gateway Station (Main LoRa Hub) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative group/hq cursor-help">
              {/* Pinging heartbeat animation */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-40"></span>
              <div className="relative bg-blue-600 text-white p-2.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border-2 border-white/80">
                <Navigation size={22} className="transform rotate-45" />
              </div>
              
              {/* Gateway Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover/hq:opacity-100 transition-opacity">
                <div className="bg-slate-900/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 whitespace-nowrap shadow-xl">
                  Main Gateway (Online)
                </div>
                <div className="w-2 h-2 bg-slate-900/90 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
            </div>
        </div>

        {/* Individual Worker Pins: Radius-based distribution logic */}
        {helmets.map((helmet, index) => {
          // Calculate radial coordinates to distribute markers around the hub
          const angle = (index / helmets.length) * 2 * Math.PI;
          const radius = 120 + (index % 2) * 60; 
          const xOffset = Math.cos(angle) * radius;
          const yOffset = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={helmet.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
              className="absolute top-1/2 left-1/2 cursor-pointer group/marker"
              style={{ marginLeft: xOffset, marginTop: yOffset }}
              onClick={() => onHelmetClick?.(helmet)}
            >
              <div className="relative flex flex-col items-center">
                {/* Visual Pin: Colors vary based on helmet safety status */}
                <div className="relative transition-transform duration-300 group-hover/marker:-translate-y-2">
                  <MapPin 
                    size={40}
                    className={`drop-shadow-xl ${
                      helmet.status === 'alert' ? 'text-red-500 fill-red-500/20' : 
                      helmet.status === 'offline' ? 'text-slate-400 fill-slate-400/20' : 
                      'text-emerald-500 fill-emerald-500/20'
                    }`} 
                  />
                  {/* Central focus point within the pin */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                </div>
                
                {/* Personnel Context Tooltip */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover/marker:opacity-100 transition-all transform translate-y-2 group-hover/marker:translate-y-0">
                  <div className="bg-white px-3 py-2 rounded-xl shadow-xl border border-slate-100 text-left min-w-[120px]">
                    <div className="font-bold text-slate-800 text-sm">{helmet.workerName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
                      ID: {helmet.id}
                    </div>
                    {/* Dynamic Status Badge */}
                    <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded w-fit ${
                      helmet.status === 'alert' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {helmet.status === 'alert' ? '⚠️ CRITICAL' : '● ACTIVE'}
                    </div>
                  </div>
                  {/* Pointer arrow for the tooltip */}
                  <div className="w-3 h-3 bg-white rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1.5 border-b border-r border-slate-100"></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 5. Live Coordinates Overlay: Provides specific GPS data points */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl border border-white/50 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Site Vision™</h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase">GPS + LoRaWAN Telemetry</p>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] border-b border-slate-100 pb-1">
              <span className="text-slate-500">Live Latitude</span>
              <span className="font-mono text-slate-700 font-bold">26.3089° N</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Live Longitude</span>
              <span className="font-mono text-slate-700 font-bold">50.1441° E</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}