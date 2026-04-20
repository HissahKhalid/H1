/**
 * SettingsPage Component - Halm System
 * * This page serves as the administrative hub for the Safety Officer.
 * It manages:
 * 1. User Profile Identity (Linked to SQLite DB)
 * 2. Notification Channels 
 * 3. System Preferences 
 * 4. Security Protocols (Two-Factor Auth/Danger Zone)
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar'; 
import { motion } from 'framer-motion'; 
import {
  Bell, Shield, User, Palette, Key, Mail, Phone, Save,
  AlertTriangle, CheckCircle2, Monitor, Volume2, Clock, MapPin, Zap, Building
} from 'lucide-react';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const API_URL = 'https://Halm.pythonanywhere.com';

interface SettingsPageProps {
  onNavigate: (page: 'dashboard' | 'reports' | 'workers' | 'settings') => void;
  onLogout: () => void;
}

export function SettingsPage({ onNavigate, onLogout }: SettingsPageProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- Local Preferences (LocalStorage Persistence) ---
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('emailNotifications') === 'true');
  const [smsNotifications, setSmsNotifications] = useState(() => localStorage.getItem('smsNotifications') === 'true');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mapProvider, setMapProvider] = useState(() => localStorage.getItem('mapProvider') || 'google');
  const [theme, setTheme] = useState('light');
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  // --- Officer Profile State ---
  const [officerName, setOfficerName] = useState(() => localStorage.getItem('officerName') || '');
  const [officerEmail, setOfficerEmail] = useState(() => localStorage.getItem('officerEmail') || '');
  const [officerPhone, setOfficerPhone] = useState('');
  const [department, setDepartment] = useState('');

  /**
   * Sync User Data with Database
   */
  useEffect(() => {
    const fetchUserData = async () => {
        const currentEmail = localStorage.getItem('officerEmail'); 
        if (!currentEmail) return;

        try {
            const response = await fetch(`${API_URL}/api/user/info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.username) setOfficerName(data.username);
                if (data.email) setOfficerEmail(data.email);
                if (data.phone) setOfficerPhone(data.phone);
                if (data.department) setDepartment(data.department);
            }
        } catch (error) {
            console.error("Failed to sync profile data from DB.");
        }
    };
    fetchUserData();
  }, []);

  /**
   * Update Profile & Preferences
   */
  const handleSave = async () => {
    setIsSaving(true);
    const currentEmailKey = localStorage.getItem('officerEmail'); 

    try {
        const response = await fetch(`${API_URL}/api/user/update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                current_email: currentEmailKey, 
                username: officerName,
                email: officerEmail,
                phone: officerPhone,
                department: department
            })
        });

        if (response.ok) {
            localStorage.setItem('officerName', officerName);
            localStorage.setItem('officerEmail', officerEmail); 
            localStorage.setItem('mapProvider', mapProvider);
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }
    } catch (error) {
        console.error("Save failed:", error);
    } finally {
        setIsSaving(false);
    }
  };

  /**
   * Database Purge Protocol
   */
  const handleClearDatabase = async () => {
    if(!confirm("⚠️ DANGER ZONE: This will permanently delete ALL alert history. Proceed?")) return;
    try {
        await fetch(`${API_URL}/api/alerts/clear`, { method: 'POST' });
        alert("Database Purged Successfully.");
    } catch (error) {
        alert("Network communication error.");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <div className="z-50 h-full w-72 flex-shrink-0">
        <Sidebar currentPage="settings" onNavigate={onNavigate} onLogout={onLogout} />
      </div>

      <div className="relative flex h-full min-w-0 flex-1 flex-col bg-gradient-to-br from-slate-50 to-slate-100">
        
        {/* Page Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 px-8 py-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="mt-1 text-sm text-slate-500">Configure your professional dashboard identity</p>
              </div>

              <motion.button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                  saveSuccess ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isSaving ? "Syncing..." : saveSuccess ? "Saved Successfully" : "Apply Changes"}
              </motion.button>
            </div>
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <Tabs defaultValue="profile" className="space-y-8">
              
              {/* Tabs Navigation */}
              <TabsList className="inline-flex h-auto w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm md:w-auto">
                <TabsTrigger value="profile" className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"><User className="h-4 w-4" /> Profile</TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"><Monitor className="h-4 w-4" /> System</TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"><Shield className="h-4 w-4" /> Security</TabsTrigger>
              </TabsList>

              {/* 1. Profile Section */}
              <TabsContent value="profile" className="focus:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center gap-5 border-b border-slate-100 pb-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Update your officer profile details</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
                    
                    {/* Full Name */}
                    <div className="flex flex-col gap-2">
                      <label className="ml-0.5 text-sm font-semibold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        value={officerName} 
                        onChange={(e) => setOfficerName(e.target.value)} 
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-purple-500/10" 
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-between px-0.5 text-sm font-semibold text-slate-700">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        value={officerEmail} 
                        onChange={(e) => setOfficerEmail(e.target.value)} 
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-purple-500/10" 
                      />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-between px-0.5 text-sm font-semibold text-slate-700">
                        Department 
                      </label>
                      <div className="relative max-w-md"> 
                        <input 
                          type="text" 
                          value={department} 
                          onChange={(e) => setDepartment(e.target.value)} 
                          placeholder="Safety Dept"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-11 pr-4 outline-none transition-all focus:ring-2 focus:ring-purple-500/10" 
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center justify-between px-0.5 text-sm font-semibold text-slate-700">
                        Phone Number 
                      </label>
                      <input 
                        type="tel" 
                        value={officerPhone} 
                        onChange={(e) => setOfficerPhone(e.target.value)} 
                        placeholder="+966..." 
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-purple-500/10" 
                      />
                    </div>

                  </div>
                </motion.div>
              </TabsContent>

              {/* 2. Notifications Section */}
              <TabsContent value="notifications" className="focus:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center gap-5 border-b border-slate-100 pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"><Bell className="h-8 w-8 text-amber-600" /></div>
                    <div><h3 className="text-xl font-bold text-slate-900">Alert Preferences</h3><p className="text-sm text-slate-500">Define how you receive site hazards alerts</p></div>
                  </div>
                  <div className="space-y-4">
                    <NotificationItem icon={<Mail className="h-5 w-5" />} label="Email Alerts" sub="Send summary reports to inbox" checked={emailNotifications} onChange={setEmailNotifications} />
                    <NotificationItem icon={<Phone className="h-5 w-5" />} label="SMS Alerts" sub="Text message for critical hazards" checked={smsNotifications} onChange={setSmsNotifications} />
                    <NotificationItem icon={<Volume2 className="h-5 w-5" />} label="Sound Cues" sub="Play hazard chime in dashboard" checked={soundAlerts} onChange={setSoundAlerts} />
                  </div>
                </motion.div>
              </TabsContent>

              {/* 3. System Section */}
              <TabsContent value="system" className="focus:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center gap-5 border-b border-slate-100 pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"><Monitor className="h-8 w-8 text-emerald-600" /></div>
                    <div><h3 className="text-xl font-bold text-slate-900">Dashboard Configuration</h3><p className="text-sm text-slate-500">Adjust spatial and visual telemetry</p></div>
                  </div>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="flex flex-col gap-2"><label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><MapPin className="h-4 w-4" /> Map Engine</label><select value={mapProvider} onChange={(e) => setMapProvider(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"><option value="google">Google Maps (Satellite)</option><option value="openstreet">OpenStreetMap (Standard)</option></select></div>
                    <div className="flex flex-col gap-2"><label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Palette className="h-4 w-4" /> Visual Theme</label><select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"><option value="light">Daylight (Light)</option><option value="dark">Stealth (Dark)</option></select></div>
                  </div>
                </motion.div>
              </TabsContent>

              {/* 4. Security Section (The Danger Zone) */}
              <TabsContent value="security" className="focus:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center gap-5 border-b border-slate-100 pb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl"><Shield className="h-8 w-8 text-blue-600" /></div>
                    <div><h3 className="text-xl font-bold text-slate-900">Account Protection</h3><p className="text-sm text-slate-500">Secure your session and database access</p></div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-4"><div className="rounded-lg border border-slate-200 bg-white p-2"><Key className="h-5 w-5 text-slate-600" /></div><div><p className="text-sm font-bold">Two-Factor Auth</p><p className="text-xs text-slate-400">Additional identity verification</p></div></div>
                      <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                    </div>
                    <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl border-2 border-dashed border-red-200 bg-red-50 p-6 md:flex-row">
                      <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="rounded-full bg-red-100 p-3 text-red-600"><AlertTriangle className="h-8 w-8" /></div>
                        <div><h3 className="text-sm font-black uppercase text-red-900">Danger Zone</h3><p className="text-xs text-red-700">Wipe all safety logs. This cannot be undone.</p></div>
                      </div>
                      <button onClick={handleClearDatabase} className="w-full rounded-xl bg-red-600 px-8 py-3 font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 md:w-auto">Wipe Database</button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

// Reusable Sub-component for Notifications
function NotificationItem({ icon, label, sub, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-5">
      <div className="flex items-center gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600">{icon}</div>
        <div><p className="text-sm font-bold text-slate-900">{label}</p><p className="text-xs text-slate-500">{sub}</p></div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}