/**
 * Core Type Definitions for Halm Safety System
 * Optimized to include only active features used in the current version.
 */

/** * AlertType: Categorizes hazards detected by the IMU sensors or AI Camera.
 */
export type AlertType = 'fall' | 'sharp-tool' | 'hazard';

/** * AlertSeverity: Urgent levels for safety notifications.
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/** * AlertSource: The origin of the safety data.
 */
export type AlertSource = 'IMU' | 'Camera';

/** * Page: Navigation routes for the Sidebar and Main App controller.
 */
export type Page = 'dashboard' | 'reports' | 'workers' | 'settings';

/** * Location: Geographic coordinates for GPS tracking on Google Maps.
 */
export interface Location {
  lat: number;
  lng: number;
}

/** * User: System administrator profile.
 */
export interface User {
  id: number;
  username: string;
  email: string;
}

/** * Helmet: Smart hardware assigned to a specific worker.
 * Status 'alert' triggers the red pulsing animation on the map.
 */
export interface Helmet {
  id: string;
  workerName: string;
  location: Location;
  status: 'active' | 'alert' | 'offline';
  lastUpdate: Date;
  battery: number;
  contactInfo: string;
}

/** * Alert: Real-time incident data structure.
 * Fully synchronized with Flask API and SQLite database schema.
 */
export interface Alert {
  id: string | number;
  helmetId: string;
  workerName: string;
  type: AlertType | string; 
  severity: AlertSeverity;
  source: AlertSource | string;
  timestamp: Date | string;
  
  /* Fields received from Python Backend */
  date?: string;          
  time?: string;          
  confidence?: number;    

  location: Location | string;
  description: string;
  message?: string;
  resolved: boolean;
}

/** * HistoricalIncident: Archived alert data used for chart generation.
 */
export interface HistoricalIncident {
  id: string;
  workerId: string;
  workerName: string;
  alertType: AlertType;
  timestamp: Date;
  location: string;
  severity: AlertSeverity;
  resolved: boolean;
}