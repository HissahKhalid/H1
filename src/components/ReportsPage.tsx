/**
 * Reports & Analytics Page Component
 * This module manages historical incident tracking, data visualization using Recharts,
 * and administrative reporting tasks such as data filtering and CSV exports.
 */

import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './Sidebar'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
// 🟢 1. استوردنا أيقونة السقوط (Activity)
import { 
  Filter, Download, AlertTriangle, CheckCircle2, Hammer, FileText, Search, Trash2, Activity
} from 'lucide-react';

const API_URL = 'https://Halm.pythonanywhere.com';

interface Alert {
  id: number;
  date: string;
  time: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  workerName?: string;
  worker_name?: string; 
  confidence?: number | string; 
}

export function ReportsPage({ onNavigate, onLogout }: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [dateFilter, setDateFilter] = useState<'7days' | '30days' | 'all'>('all');
  // 🟢 2. أضفنا خيار 'fall' للفلاتر
  const [alertTypeFilter, setAlertTypeFilter] = useState<'all' | 'sharp' | 'pothole' | 'fall'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // 🟢 3. أضفنا اللون البنفسجي للرسم البياني الدائري (رقم 3 في المصفوفة)
  const COLORS = ['#ef4444', '#f97316', '#a855f7', '#3b82f6'];
  const EMPTY_COLOR = '#e5e7eb';

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Report Sync Error: Unable to connect to Flask server.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = useMemo(() => {
    const now = new Date();
    const cutoffDate = new Date();
    
    if (dateFilter === '7days') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (dateFilter === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    }

    return alerts.filter(incident => {
      const incidentDate = new Date(incident.date);
      const dateMatch = dateFilter === 'all' || incidentDate >= cutoffDate;
      const typeMatch = alertTypeFilter === 'all' 
        ? true 
        : incident.type.toLowerCase().includes(alertTypeFilter);
      const isResolved = incident.status === 'Resolved';
      const statusMatch = statusFilter === 'all'
        ? true
        : statusFilter === 'resolved' ? isResolved : !isResolved; 
      
      return dateMatch && typeMatch && statusMatch;
    });
  }, [alerts, dateFilter, alertTypeFilter, statusFilter]);

  const handleClearHistory = async () => {
    const confirmDelete = window.confirm(
        "⚠️ WARNING: This will permanently delete ALL alert history from the database.\n\nAre you sure you want to proceed?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/alerts/clear`, { method: 'POST' });
      if (response.ok) {
          alert("Safety logs purged successfully.");
          fetchData(); 
      } else {
          alert("Authorization Error: Database maintenance failed.");
      }
    } catch (error) {
      console.error("Network Error: Could not execute clear command", error);
      alert("Error connecting to server.");
    }
  };

  const handleExportReport = () => {
    if (filteredIncidents.length === 0) {
        alert("Export Canceled: No data found within current filter parameters.");
        return;
    }

    const headers = ["ID", "Worker Name", "Type", "Date", "Time", "Confidence", "Status"];

    const rows = filteredIncidents.map(alert => {
        const workerName = alert.workerName || alert.worker_name || (alert.description?.includes('near') ? alert.description.split('near')[1].trim() : 'System Detection');
        const confidence = alert.confidence ? `${alert.confidence}%` : '98%';
        
        return [
            alert.id,
            `"${workerName}"`,
            alert.type,
            alert.date,
            alert.time,
            confidence,
            alert.status
        ];
    });

    const csvContent = [
        headers.join(","), 
        ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `safety_report_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🟢 4. أضفنا حساب السقوط هنا
  const stats = useMemo(() => {
    const active = filteredIncidents.filter(a => a.status !== 'Resolved');
    return {
      totalActive: active.length,
      resolved: filteredIncidents.filter(a => a.status === 'Resolved').length,
      activeSharpTools: active.filter(a => a.type.toLowerCase().includes('sharp')).length,
      activePotholes: active.filter(a => a.type.toLowerCase().includes('pothole')).length,
      activeFalls: active.filter(a => a.type.toLowerCase().includes('fall')).length,
    };
  }, [filteredIncidents]);

  const barData = useMemo(() => {
    const map = filteredIncidents.reduce((acc: any, curr) => {
        const dateKey = curr.date || 'Unknown';
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
    }, {});
    let data = Object.keys(map).map(date => ({ name: date, count: map[date] }));
    data.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    if (data.length === 0) return [{ name: 'No Data', count: 0 }];
    return data;
  }, [filteredIncidents]);

  // 🟢 5. أضفنا السقوط للرسم البياني الدائري
  const pieData = useMemo(() => {
    const data = [
        { name: 'Sharp Tools', value: stats.activeSharpTools },
        { name: 'Potholes', value: stats.activePotholes },
        { name: 'Fall Alerts', value: stats.activeFalls }, 
    ];
    if (data.every(d => d.value === 0)) return [{ name: 'No Data', value: 1, isEmpty: true }];
    return data.filter(d => d.value > 0);
  }, [stats]);


  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      
      <div className="z-50 h-full w-72 flex-shrink-0">
        <Sidebar currentPage="reports" onNavigate={onNavigate} onLogout={onLogout} />
      </div>

      <div className="scrollbar-thin scrollbar-thumb-slate-300 h-full flex-1 overflow-y-auto pb-10">
        
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-1 text-xl font-bold text-slate-900">Historical Reports & Analytics</h1>
                <p className="text-sm text-slate-600">Incident tracking and data visualization</p>
              </div>

              <div className="flex gap-3">
                <button 
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear History
                </button>
                
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportReport}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export CSV Report</span>
                </motion.button>
              </div>
            </div>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white/60 px-8 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-600" />
              <span className="text-sm text-slate-700">Filters:</span>
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
            
            {/* 🟢 6. أضفنا فئة السقوط في الفلتر */}
            <select
              value={alertTypeFilter}
              onChange={(e) => setAlertTypeFilter(e.target.value as any)}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Alert Types</option>
              <option value="sharp">Sharp Tools</option>
              <option value="pothole">Potholes</option>
              <option value="fall">Fall Detected</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Pending)</option>
              <option value="resolved">Resolved</option>
            </select>
            <div className="ml-auto text-sm text-slate-600">
              Showing <span className="font-bold text-slate-900">{filteredIncidents.length}</span> incidents
            </div>
          </div>
        </div>

        <main className="p-8">
          
          {/* 🟢 7. أضفنا كرت السقوط هنا ونسقناهم في صف واحد (flex) */}
          <div className="mb-6 flex w-full flex-row gap-4">
            <div className="min-w-0 flex-1">
              <StatsCard icon={<AlertTriangle className="h-5 w-5 text-red-600" />} bg="bg-red-100" label="Active Hazards" value={stats.totalActive} sub="Requires attention" subColor="text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<Hammer className="h-5 w-5 text-orange-600" />} bg="bg-orange-100" label="Sharp Tools" value={stats.activeSharpTools} sub="Localized objects" subColor="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<FileText className="h-5 w-5 text-blue-600" />} bg="bg-blue-100" label="Potholes" value={stats.activePotholes} sub="Ground hazards" subColor="text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<Activity className="h-5 w-5 text-purple-600" />} bg="bg-purple-100" label="Fall Incidents" value={stats.activeFalls} sub="Emergency events" subColor="text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} bg="bg-emerald-100" label="Total Resolved" value={stats.resolved} sub="Fixed issues" subColor="text-emerald-600" />
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Chronological Incident Trend (Bar Chart) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[500px] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Daily Incidents Count</h3>
              <div className="w-full flex-1" style={{ minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#64748b" style={{ fontSize: '12px' }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none' }}/>
                      <Bar dataKey="count" fill={barData[0].count === 0 ? EMPTY_COLOR : "#3b82f6"} radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Safety Risk Distribution (Pie Chart) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex min-h-[500px] flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-slate-900">Active Hazards Distribution</h3>
              <div className="w-full flex-1" style={{ minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} innerRadius={80} outerRadius={130} paddingAngle={5} dataKey="value">
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.isEmpty ? EMPTY_COLOR : COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Detailed Audit Log Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="font-bold text-slate-900">Detailed Activity Log</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Worker Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Hazard Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Confidence Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Search size={24} className="opacity-20" />
                                <span>No reports found matching filters.</span>
                            </div>
                        </td>
                     </tr>
                  ) : (
                    filteredIncidents.map((incident) => {
                        const displayWorkerName = incident.workerName || incident.worker_name || (incident.description?.includes('near') ? incident.description.split('near')[1].trim() : 'Unknown');
                        const confidenceStr = incident.confidence ? `${incident.confidence}%` : '98%';
                        const isResolved = incident.status === 'Resolved';

                        return (
                          <tr key={incident.id} className="transition-colors hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">#{incident.id}</td>
                            <td className="px-6 py-4 text-sm font-semibold capitalize text-slate-800">{displayWorkerName}</td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold uppercase tracking-wide text-slate-800">{incident.type}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">
                              {incident.date} <span className="mx-1 text-slate-300">|</span> {incident.time}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-blue-600">{confidenceStr}</td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${isResolved ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-red-200 bg-red-50 text-red-600'}`}>
                                  {isResolved ? 'Resolved' : 'Pending'}
                                </span>
                            </td>
                          </tr>
                        );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function StatsCard({ icon, bg, label, value, sub, subColor }: any) {
    return (
        <motion.div whileHover={{ y: -2 }} className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
            <div className={`h-10 w-10 ${bg} flex items-center justify-center rounded-lg`}>{icon}</div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
            </div>
            <div className="truncate text-2xl font-bold text-slate-900">{value}</div>
            <div className={`text-xs font-medium ${subColor} mt-1 truncate`}>{sub}</div>
        </motion.div>
    );
}