/**
 * Real-Time GPS Tracking Map Component
 * This component integrates Leaflet.js to display worker locations on a satellite map.
 * It features dynamic marker updates, automated camera panning (FlyTo), 
 * and visual hazard indicators (pulsing red markers) linked to the backend alert system.
 */

import { useEffect, useRef, useState } from 'react';
import { Helmet, Alert } from '../types';
import { Loader2, MapPin } from 'lucide-react';

interface RealGoogleMapProps {
  helmets: Helmet[]; // Synchronized array of worker/helmet data from the database
  selectedHelmetId?: string | null;
  onHelmetClick?: (helmet: Helmet) => void;
  alerts?: Alert[];
}

// Global declaration for Leaflet library (loaded via CDN)
declare global { interface Window { L: any; } }

export function RealGoogleMap({ helmets, selectedHelmetId, onHelmetClick, alerts }: RealGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Geographical center for the initial map view (King Faisal University)
  const KFU_CENTER = [25.3463, 49.5937];

  /**
   * Library Injection:
   * Dynamically loads the Leaflet CSS and JS files from a CDN to keep the bundle size small.
   */
  useEffect(() => {
    if (window.L) { setIsLoading(false); return; }
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; script.async = true;
    script.onload = () => setIsLoading(false); document.head.appendChild(script);
  }, []);

  /**
   * Map Initialization:
   * Sets up the map instance using ArcGIS World Imagery (Satellite view) 
   * once the Leaflet script has successfully loaded.
   */
  useEffect(() => {
    if (isLoading || !mapRef.current || !window.L || leafletMapRef.current) return;
    const map = window.L.map(mapRef.current, { center: KFU_CENTER, zoom: 17, zoomControl: false, attributionControl: false });
    window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }).addTo(map);
    leafletMapRef.current = map;
    
    // Fix for Leaflet tile rendering issues in hidden/flex containers
    setTimeout(() => map.invalidateSize(), 200); 
  }, [isLoading]);

  /**
   * Marker Synchronization Logic:
   * This effect handles the real-time "Heartbeat" of the map.
   * It creates, updates, or removes markers based on the current helmet array 
   * and cross-references active alerts to change marker colors to red/green.
   */
  useEffect(() => {
    if (!leafletMapRef.current || !window.L) return;
    
    // UI Assets (SVG Icons for Popups)
    const alertTriangleSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    const shieldCheckSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`;
    const clockSvg = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
    const userSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

    // Cleanup: Remove markers for workers no longer present in the database
    const currentHelmetIds = new Set(helmets.map(h => h.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentHelmetIds.has(id)) {
        leafletMapRef.current.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Update or Create Markers for each active helmet
    helmets.forEach((helmet) => {
      if (!helmet.location || !helmet.location.lat || !helmet.location.lng) return;

      /**
       * Hazard Cross-referencing:
       * Checks the 'alerts' array to see if the current worker has an unresolved safety incident.
       */
      const alertInfo = alerts?.find(a => a.workerName === helmet.workerName && !a.resolved);
      const isAlert = !!alertInfo;
      const color = isAlert ? '#ef4444' : '#10b981'; // Danger Red vs. Safety Green
      
      const hazardText = alertInfo ? (alertInfo.message || alertInfo.type) : 'SECURE ENVIRONMENT';
      const displayTime = alertInfo ? alertInfo.time || new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : 'Active Now';
      const alertSource = alertInfo ? alertInfo.source || `AI Camera (${alertInfo.confidence || 98}%)` : 'Live GPS Tracker';
      const displayWorkerName = helmet.workerName;

      // Custom HTML Marker with pulsing animation for active hazards
      const iconHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          ${isAlert ? `<div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 34px; height: 34px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px; z-index:10; font-family: sans-serif;">
            ${helmet.id} 
          </div>
        </div>`;  

      const customIcon = window.L.divIcon({ html: iconHtml, className: 'custom-marker', iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -20] });
      
      // Detailed info window displayed when a marker is clicked
      const popupContent = `
        <div style="font-family: ui-sans-serif, system-ui, sans-serif; width: 260px; padding: 2px;">
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <div style="width: 40px; height: 40px; background-color: ${isAlert ? '#fef2f2' : '#ecfdf5'}; border: 1px solid ${isAlert ? '#fee2e2' : '#d1fae5'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${isAlert ? '#dc2626' : '#059669'}; flex-shrink: 0;">
              ${isAlert ? alertTriangleSvg : shieldCheckSvg}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 900; color: ${isAlert ? '#b91c1c' : '#047857'}; text-transform: uppercase;">
                  ${hazardText}
                </span>
                <span style="font-size: 10px; color: #94a3b8; display: flex; align-items: center; gap: 4px;">
                  ${clockSvg} ${displayTime}
                </span>
              </div>
              <h4 style="font-weight: 700; color: #0f172a; font-size: 14px; margin: 0 0 4px 0; display: flex; align-items: center; gap: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                <span style="color: #94a3b8; display: flex; align-items: center;">${userSvg}</span> 
                ${displayWorkerName}
              </h4>
              <p style="font-size: 11px; color: #64748b; margin: 0; font-style: italic; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${isAlert ? `Detected via ${alertSource}` : 'Tracking active & secure'}
              </p>
            </div>
          </div>
        </div>`;

      // Update existing marker position/icon or create a new one
      if (markersRef.current[helmet.id]) {
        const marker = markersRef.current[helmet.id];
        marker.setLatLng([helmet.location.lat, helmet.location.lng]);
        marker.setIcon(customIcon);
        const popup = marker.getPopup();
        if (popup) popup.setContent(popupContent);
      } else {
        const marker = window.L.marker([helmet.location.lat, helmet.location.lng], { icon: customIcon }).addTo(leafletMapRef.current);
        marker.bindPopup(popupContent, { closeButton: false, className: 'feed-style-popup' });
        marker.on('click', () => onHelmetClick?.(helmet));
        markersRef.current[helmet.id] = marker;
      }
    });
  }, [helmets, isLoading, alerts]);

  /**
   * Camera Movement Logic:
   * Smoothly pans the map to the selected helmet when a user clicks a list item 
   * in the Dashboard or a specific notification.
   */
  useEffect(() => {
    if (!selectedHelmetId || !leafletMapRef.current || !markersRef.current) return;
    const marker = markersRef.current[selectedHelmetId];
    if (marker) {
      leafletMapRef.current.flyTo(marker.getLatLng(), 19, { animate: true, duration: 1.5 });
      setTimeout(() => marker.openPopup(), 1500);
    }
  }, [selectedHelmetId]);

  // Loading state placeholder
  if (isLoading) return <div className="flex h-full w-full items-center justify-center bg-gray-900"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-900">
      {/* Map DOM Element */}
      <div ref={mapRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
      
      {/* Map Header Overlay */}
      <div className="absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
         <MapPin size={16} className="text-blue-600" />
         <span className="text-[11px] font-black uppercase tracking-wider text-gray-800">Live Site GPS Feed</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[400] space-y-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold shadow-xl">
        <div className="flex items-center gap-3 text-gray-700">
          <span className="h-3 w-3 rounded-full border border-white bg-green-500 shadow-sm ring-2 ring-green-100"></span> 
          <span>Personnel Safe</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <span className="h-3 w-3 animate-pulse rounded-full border border-white bg-red-500 shadow-sm ring-2 ring-red-100"></span> 
          <span>AI Detection Hazard</span>
        </div>
      </div>
    </div>
  );
}