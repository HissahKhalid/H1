import { useState } from 'react';
import { LayoutDashboard, FileText, Settings, LogOut, HardHat, User } from 'lucide-react';
import { motion } from 'motion/react';

// @ts-ignore
import halmLogo from '../assets/logo.png';

interface SidebarProps {
  currentPage: 'dashboard' | 'reports' | 'settings';
  onNavigate: (page: 'dashboard' | 'reports' | 'settings') => void;
  onLogout: () => void;
}

interface NavItem {
  id: 'dashboard' | 'reports' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white">
      
      {/* Logo Section */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-100 bg-white p-1 shadow-md"
          >
            {/* ✅ عرض اللوقو هنا */}
            <img 
              src={halmLogo} 
              alt="Halm System" 
              className="h-full w-full object-contain"
            />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Halm System</h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Safety AI</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.disabled;

          return (
            <motion.button
              key={item.id}
              onClick={() => !isDisabled && onNavigate(item.id)}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { x: 4 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-50 to-purple-100 font-medium text-purple-700 shadow-sm' 
                  : isDisabled
                  ? 'cursor-not-allowed text-slate-400'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-purple-600"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <Icon className={`h-5 w-5 ${isActive ? 'text-purple-700' : 'text-slate-500'}`} />

              {/* Label */}
              <span className="flex-1 text-left text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="h-2 w-2 rounded-full bg-green-500"
            />
            <span className="text-xs font-bold text-green-800">System Online</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-700">
            <HardHat className="h-3 w-3" />
            <span>8 Active Helmets</span>
          </div>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">Safety Officer</p>
            <p className="truncate text-xs text-slate-500">officer@kfu.edu.sa</p>
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