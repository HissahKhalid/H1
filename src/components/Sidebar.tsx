/**
 * Sidebar Component
 * This component handles the primary navigation for the Halm Safety System.
 * It also monitors real-time system status by fetching worker counts and
 * displays the active session's user profile.
 */

import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, HardHat, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
// @ts-ignore
import halmLogo from '../assets/logo.png';

// Backend Configuration
const API_URL = 'https://Halm.pythonanywhere.com';

interface SidebarProps {
  currentPage: 'dashboard' | 'reports' | 'workers' | 'settings';
  onNavigate: (page: 'dashboard' | 'reports' | 'workers' | 'settings') => void;
  onLogout: () => void;
}

interface NavItem {
  id: 'dashboard' | 'reports' | 'workers' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

/**
 * Navigation Mapping:
 * Centralized array to manage sidebar links and icons.
 */
const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'workers', label: 'Workers', icon: Users }, 
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  // Navigation Hover State
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  /**
   * Application Identity States:
   * userName & userEmail: Displayed at the bottom of the sidebar.
   * activeWorkers: Fetched dynamically to show real-time system load.
   */
  const [userName, setUserName] = useState('Safety Officer');
  const [userEmail, setUserEmail] = useState('officer@kfu.edu.sa');
  const [activeWorkers, setActiveWorkers] = useState(0);

  /**
   * Initial Data Load & Polling Logic:
   * 1. Hydrates user info from local storage (set during login).
   * 2. Fetches current worker count from the Flask API.
   * 3. Sets up a 10-second polling interval to keep status metrics fresh.
   */
  useEffect(() => {
    // Sync UI with authenticated session data
    const storedName = localStorage.getItem('officerName');
    const storedEmail = localStorage.getItem('officerEmail');
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);

    const fetchWorkerCount = async () => {
        try {
            const response = await fetch(`${API_URL}/api/workers`);
            if (response.ok) {
                const workers = await response.json();
                setActiveWorkers(workers.length);
            }
        } catch (error) {
            console.error("Sidebar Sync Error: Failed to fetch worker metrics.");
        }
    };

    fetchWorkerCount();
    
    // Establishing real-time heartbeat for worker count
    const interval = setInterval(fetchWorkerCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      
      {/* Branding Section */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-md"
          >
            <img 
              src={halmLogo} 
              alt="Halm Brand" 
              className="h-full w-full object-contain"
            />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Halm System</h1>
          </div>
        </div>
      </div>

      {/* Main Navigation: Iterating through navItems */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-50 to-purple-100 font-medium text-purple-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {/* Active Tab Indicator (Animated Line) */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-purple-600"
                />
              )}
              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-700' : 'text-slate-500'}`} />
              <span className="flex-1 text-left text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Real-time System Health: Dynamic Status Indicator */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            {/* Pulsing online indicator */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
            <span className="text-xs font-bold text-green-800">System Online</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <HardHat className="h-3 w-3" />
            <span>{activeWorkers} Active Site Helmets</span>
          </div>
        </div>
      </div>

      {/* Footer: User Context & Logout Functionality */}
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
            <p className="truncate text-xs text-slate-500">{userEmail}</p>
          </div>
        </div>

        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-red-600 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}