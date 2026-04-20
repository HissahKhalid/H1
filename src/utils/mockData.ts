/**
 * Mock Data Utilities for Halm System
 * This file provides simulated data for helmets, alerts, and historical incidents.
 * Useful for development testing and populating the Reports dashboard when 
 * live database data is insufficient.
 */

import { Helmet, Alert, HistoricalIncident, AlertType, AlertSeverity, AlertSource } from '../types';

/**
 * Generates a list of simulated helmets with locations centered around 
 * King Faisal University, Al-Ahsa.
 */
export const generateMockHelmets = (): Helmet[] => {
  const baseLocation = { lat: 25.3405, lng: 49.5999 }; 
  
  const workers = [
    { id: 'H001', name: 'Ahmed Al-Salem', contact: '+966-50-123-4567' },
    { id: 'H002', name: 'Mohammed Hassan', contact: '+966-50-234-5678' },
    { id: 'H003', name: 'Khalid Abdullah', contact: '+966-50-345-6789' },
    { id: 'H004', name: 'Fahad Al-Qarni', contact: '+966-50-456-7890' },
  ];

  return workers.map((worker) => ({
    id: worker.id,
    workerName: worker.name,
    location: {
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.01,
    },
    status: 'active' as const,
    lastUpdate: new Date(),
    battery: 65 + Math.random() * 35,
    contactInfo: worker.contact,
  }));
};

/**
 * Generates a random simulated alert for a specific helmet.
 * Used to test real-time notification components.
 */
export const generateMockAlert = (helmet: Helmet): Alert => {
  const alertTypes: { type: AlertType; desc: string; source: AlertSource }[] = [
    { type: 'fall', desc: 'Fall detected via IMU sensors', source: 'IMU' },
    { type: 'sharp-tool', desc: 'Sharp tool localized in hazard zone', source: 'Camera' },
  ];

  const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];

  return {
    id: `A-${Date.now()}-${helmet.id}`,
    helmetId: helmet.id,
    workerName: helmet.workerName,
    type: randomAlert.type,
    severity: 'critical',
    source: randomAlert.source,
    timestamp: new Date(),
    location: helmet.location,
    description: randomAlert.desc,
    resolved: false,
  };
};

/**
 * Creates a collection of historical incidents spanning the last 30 days.
 * Primarily used to populate the Recharts components in the ReportsPage.
 */
export const generateHistoricalIncidents = (): HistoricalIncident[] => {
  const incidents: HistoricalIncident[] = [];
  const alertTypes: AlertType[] = ['fall', 'sharp-tool'];
  const workers = ['Ahmed Al-Salem', 'Mohammed Hassan', 'Khalid Abdullah', 'Fahad Al-Qarni'];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);

    incidents.push({
      id: `INC-${1000 + i}`,
      workerId: `H${String(Math.floor(Math.random() * 4) + 1).padStart(3, '0')}`,
      workerName: workers[Math.floor(Math.random() * workers.length)],
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      timestamp,
      location: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      severity: Math.random() > 0.3 ? 'critical' : 'warning',
      resolved: Math.random() > 0.1,
    });
  }

  return incidents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * UI Helper: Returns a human-readable label for different alert types.
 * @param type - The AlertType to be converted to a label.
 * @returns A descriptive string for the user interface.
 */
export const getAlertTypeLabel = (type: AlertType): string => {
  const labels: Record<AlertType, string> = {
    fall: 'Fall Detected',
    'sharp-tool': 'Sharp Tool Localized',
    hazard: 'General Hazard', // Added to resolve the missing property error
  };
  return labels[type];
};

/**
 * UI Helper: Returns Tailwind CSS classes for styling alerts based on their type.
 * @param type - The AlertType used to determine the color scheme.
 * @returns A string of Tailwind CSS classes for background, text, and border.
 */
export const getAlertTypeColor = (type: AlertType): string => {
  const colors: Record<AlertType, string> = {
    fall: 'bg-red-100 text-red-800 border-red-300',
    'sharp-tool': 'bg-orange-100 text-orange-800 border-orange-300',
    hazard: 'bg-amber-100 text-amber-800 border-amber-300', 
  };
  return colors[type];
};