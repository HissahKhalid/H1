/**
 * Workers Management Component
 * This page provides a comprehensive interface for managing site personnel,
 * including adding new workers, updating profiles, and managing medical records.
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { Plus, Trash2, HeartPulse, Droplet, Briefcase, X, Pencil } from 'lucide-react';

const API_URL = 'https://Halm.pythonanywhere.com';

export function WorkersPage({ onNavigate, onLogout }: any) {
  /**
   * Component State:
   * workers: Array of worker objects fetched from the database.
   * showModal: Controls the visibility of the Add/Edit form.
   * editingId: Stores the ID of the worker currently being updated (null if adding new).
   * formData: Local state for form inputs synced with the backend schema.
   */
  const [workers, setWorkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', role: 'General Worker', age: '', blood_type: 'O+', medical_info: 'None'
  });

  /**
   * Data Fetching:
   * Retrieves the latest list of workers from the Flask API.
   */
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/workers`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  // Lifecycle: Fetch worker data on component mount
  useEffect(() => { fetchWorkers(); }, []);

  /**
   * UI Handlers:
   * handleAddClick: Resets the form for a new entry.
   * handleEditClick: Populates the form with existing worker data for updates.
   */
  const handleAddClick = () => {
    setFormData({ name: '', role: 'General Worker', age: '', blood_type: 'O+', medical_info: 'None' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditClick = (worker: any) => {
    setFormData({
      name: worker.name,
      role: worker.role,
      age: String(worker.age),
      blood_type: worker.blood_type,
      medical_info: worker.medical_info || 'None'
    });
    setEditingId(worker.id);
    setShowModal(true);
  };

  /**
   * Form Submission Logic:
   * Dynamically switches between POST (Add) and PUT (Edit) based on 'editingId'.
   * Synchronizes changes with the SQLite database via the Flask backend.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/api/workers/${editingId}` : `${API_URL}/api/workers`;

      const res = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        fetchWorkers();
        setFormData({ name: '', role: 'General Worker', age: '', blood_type: 'O+', medical_info: 'None' });
        alert(editingId ? "Worker profile updated successfully!" : "New worker added successfully!");
      } else {
        const errorData = await res.json();
        alert(`Storage Error: ${errorData.error || 'Check server logs.'}`);
      }
    } catch (e) {
      console.error("Connection Error:", e);
      alert("Backend Connection Failed: Ensure Flask server is active on port 5000.");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      {/* Navigation Sidebar */}
      <div className="z-50 h-full w-72 flex-shrink-0">
        <Sidebar currentPage="workers" onNavigate={onNavigate} onLogout={onLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        {/* Page Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Workers Management</h1>
            <p className="text-sm text-slate-500">Monitor and manage site personnel safety profiles</p>
          </div>
          <button 
            onClick={handleAddClick} 
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-purple-700"
          >
            <Plus size={20} /> Add New Worker
          </button>
        </header>

        {/* Workers Grid View */}
        <main className="grid flex-1 grid-cols-1 content-start gap-6 overflow-y-auto p-8 pb-20 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((w: any) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              key={w.id} 
              className="group relative h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              {/* Management Controls: Edit/Delete */}
              <div className="absolute right-4 top-4 flex items-center gap-3 opacity-60 transition-opacity group-hover:opacity-100">
                <button 
                  onClick={() => handleEditClick(w)} 
                  className="text-slate-400 transition-colors hover:text-blue-500"
                  title="Edit Profile"
                >
                  <Pencil size={18}/>
                </button>
                <button 
                  onClick={async () => { if(confirm("Permanently delete this worker profile?")) { await fetch(`${API_URL}/api/workers/${w.id}`, {method: 'DELETE'}); fetchWorkers(); } }} 
                  className="text-slate-400 transition-colors hover:text-red-500"
                  title="Remove Worker"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
              
              {/* Worker Profile Header */}
              <div className="mb-4 mt-1 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-xl font-bold text-purple-600">
                  {w.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{w.name}</h3>
                  <div className="flex items-center gap-1 text-xs italic text-slate-500">
                    <Briefcase size={12} /> {w.role}
                  </div>
                </div>
              </div>

              {/* Safety & Medical Information Section */}
              <div className="space-y-3">
                <div className="flex justify-between rounded-lg bg-slate-50 p-2 text-sm">
                    <span className="text-slate-500">Age</span>
                    <b className="text-slate-800">{w.age} Years</b>
                </div>
                <div className="flex justify-between rounded-lg bg-red-50 p-2 text-sm">
                    <span className="flex items-center gap-1 text-red-600"><Droplet size={14}/> Blood Type</span>
                    <b className="text-red-700">{w.blood_type}</b>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs">
                    <b className="mb-1 flex items-center gap-1 text-amber-700"><HeartPulse size={12}/> Medical Conditions:</b>
                    <p className="text-slate-600">{w.medical_info}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </main>
      </div>

      {/* CRUD Modal: Add/Edit Form Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingId ? 'Edit Site Worker' : 'Add New Site Worker'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); setEditingId(null); }} 
                className="rounded-full bg-slate-50 p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Inputs */}
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Full Name</label>
                <input 
                  value={formData.name}
                  placeholder="e.g. Ahmed Al-Salem" className="w-full rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-purple-500" 
                  onChange={e => setFormData({...formData, name: e.target.value})} required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Age</label>
                  <input 
                    type="number"
                    value={formData.age}
                    placeholder="28" className="w-full rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-purple-500" 
                    onChange={e => setFormData({...formData, age: e.target.value})} required 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Role</label>
                  <select 
                    value={formData.role}
                    className="w-full rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-purple-500" 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option>General Worker</option>
                    <option>Electrician</option>
                    <option>Supervisor</option>
                    <option>Security</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Blood Type</label>
                <select 
                  value={formData.blood_type}
                  className="w-full rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-purple-500" 
                  onChange={e => setFormData({...formData, blood_type: e.target.value})}
                >
                  <option>O+</option><option>O-</option><option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">Medical Info</label>
                <textarea 
                  value={formData.medical_info}
                  placeholder="e.g. Asthma or None" className="min-h-[100px] w-full rounded-xl border-2 border-slate-100 p-3 outline-none focus:border-purple-500" 
                  onChange={e => setFormData({...formData, medical_info: e.target.value})} 
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingId(null); }} className="flex-1 rounded-xl bg-slate-100 py-3.5 font-bold text-slate-600 transition-all hover:bg-slate-200">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-purple-600 py-3.5 font-bold text-white shadow-lg transition-all hover:bg-purple-700">
                  {editingId ? 'Update Worker' : 'Save Worker'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}