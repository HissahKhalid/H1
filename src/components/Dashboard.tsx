/**
 * Dashboard Component - Safety Operations Center (SOC)
 * This is the primary functional hub of the Halm System. 
 * Responsibilities:
 * 1. Orchestrating real-time data synchronization with the Flask/SQLite backend.
 * 2. Managing the lifecycle of safety alerts and worker GPS coordinates.
 * 3. Controlling the visibility and state of the AI live camera feed.
 * 4. Aggregating system-wide statistics for the safety KPI cards.
 */
import * as ort from 'onnxruntime-web';
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
import { useState, useEffect, useRef } from 'react';
import { Helmet, Alert, Page } from '../types'; 
import { RealGoogleMap } from './RealGoogleMap';
import { AlertFeed } from './AlertFeed';
import { CriticalAlertModal } from './CriticalAlertModal';
import { Sidebar } from './Sidebar';
import { Users, AlertTriangle, Wifi, Hammer, CheckCircle2, Video, VideoOff, MapPin, Eye, EyeOff, Activity } from 'lucide-react';


// Central API Configuration
const API_URL = 'https://Halm.pythonanywhere.com';


interface DashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  /**
   * Application State:
   * helmets: Array of worker locations and statuses.
   * alerts: Collections of both active and resolved safety incidents.
   * UI State: Connectivity status, camera visibility, and modal management.
   */
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]); 
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]); 
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  // Camera State: Defaulted to false to ensure privacy and optimize bandwidth on startup
  const [showCamera, setShowCamera] = useState(false);
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastAlertSentTime = useRef<number>(0); // لمنع إرسال نفس التنبيه للسيرفر مئة مرة في الثانية

  // 🟢 2. عرفنا المتغير اللي بيحفظ آخر تنبيه طلعناه عشان ما يعلق البوب-أب كل ثانيتين
  const lastProcessedAlertId = useRef<string | number | null>(null);

  useEffect(() => {
  const loadModel = async () => {
    try {
      const sess = await ort.InferenceSession.create('/best.onnx', { 
        executionProviders: ['wasm'] 
      });
      setSession(sess);
      console.log("✅ ONNX Model Loaded in Browser");
    } catch (e) {
      console.error("❌ Model Load Error:", e);
    }
  };
  loadModel();
}, []);

  // Persistence: Track camera preference across sessions
  useEffect(() => {
    localStorage.setItem('cameraState', JSON.stringify(showCamera));
  }, [showCamera]);

  // Key Performance Indicators (KPI) State
  const [stats, setStats] = useState({
    totalWorkers: 0, 
    sharpToolAlerts: 0,
    potholeAlerts: 0,
    fallAlerts: 0,
    resolvedCount: 0 
  });

  const syncAlertWithServer = async (type: string, confidence: number) => {
    // 1. إنشاء تنبيه "لحظي" لعرضه فوراً أمام اللجنة
    const instantAlert: Alert = {
      id: Date.now(), // ID مؤقت
      helmetId: "AI-EDGE", // الكود اللي في fetchData راح يستخدم هذا الاسم عشان يثبت التنبيه
      workerName: "Live Operator",
      type: 'hazard',
      severity: 'critical',
      source: "AI Edge",
      timestamp: new Date(),
      description: `${type} Detected (Live)`, 
      resolved: false,
      message: type, // تأكدي إنه يطابق كلمة Sharp أو Pothole بالضبط
      time: new Date().toLocaleTimeString(),
      location: { lat: 25.3463, lng: 49.5937 }
    };

    // 🟢 تحديث المصفوفة فوراً (بيطلع الإشعار وتتحدث الـ KPIs في نفس اللحظة)
    setActiveAlerts(prev => [instantAlert, ...prev]);
    setAllAlerts(prev => [instantAlert, ...prev]);
    // 2. إرسال البيانات للسيرفر (PythonAnywhere) ليتم حفظها رسمياً
    try {
      await fetch(`${API_URL}/api/hardware/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type, // بيرسل Sharp أو Pothole
          confidence: confidence
        })
      });
      // نحدث البيانات من السيرفر للتأكد من المزامنة
      fetchData(); 
    } catch (error) {
      console.error("Server Sync Error:", error);
    }
  };


  const toggleCamera = async () => {
  const nextState = !showCamera;
  setShowCamera(nextState);

  if (nextState) {
    // ننتظر ميلي ثانية ليظهر عنصر الـ video في الصفحة ثم نربطه بالبث
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }, 100);
  } else {
    // إغلاق الكاميرا لتوفير الطاقة والخصوصية
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  }
  };
  
  /**
   * Data Synchronization Logic:
   * Fetches alerts and worker data simultaneously to maintain a consistent state.
   * Formats raw backend data into the structured 'Alert' and 'Helmet' types used by the UI.
   */
  const fetchData = async () => {
    try {
      const alertRes = await fetch(`${API_URL}/api/alerts`);
      const workerRes = await fetch(`${API_URL}/api/workers`);
      
      if (alertRes.ok && workerRes.ok) {
        const alertData = await alertRes.json();
        const workerData = await workerRes.json();
        setIsConnected(true);

        // 1. معالجة التنبيهات القادمة من السيرفر (PythonAnywhere)
        const processedAlerts: Alert[] = alertData.map((item: any) => ({
          id: item.id,
          helmetId: `H-${item.id}`,
          workerName: item.worker_name || 'Unknown',
          type: 'hazard',
          severity: 'critical',
          source: `AI Camera (${item.confidence || 0}%)`,
          timestamp: new Date(item.date),
          location: { lat: item.lat || 25.3463, lng: item.lng || 49.5937 },
          description: item.description,
          resolved: item.status === 'Resolved',
          message: item.type,
          time: item.time
        }));

        setAllAlerts(processedAlerts);
        
        // 🟢 التعديل الجوهري: دمج التنبيهات المحلية الحية مع تنبيهات السيرفر
        setActiveAlerts(prev => {
          // نحتفظ بالتنبيهات التي مصدرها الكاميرا الحالية فقط
          // 🟢 المنطق الجديد: نحذف التنبيه المحلي (AI-EDGE) إذا وصل تنبيه بنفس النوع من السيرفر
          const liveLocalAlerts = prev.filter(a => 
            a.helmetId === "AI-EDGE" && 
            !activeServerAlerts.some(s => s.message === a.message)
          );
          // نجلب التنبيهات غير المحلولة (Pending) من السيرفر
          const activeServerAlerts = processedAlerts.filter(a => !a.resolved);
          
          // دمج القائمتين
          const combined = [...liveLocalAlerts, ...activeServerAlerts];

          // منع التكرار بناءً على الوصف (Description) لضمان نظافة القائمة
          return combined.filter((v, i, a) => 
            a.findIndex(t => t.description === v.description) === i
          );
        });

        // 2. لوجيك الطوارئ: البوب-أب التلقائي للسقوط (كما هو)
        if (processedAlerts.length > 0) {
          const newestAlert = processedAlerts[0]; 

          if (!newestAlert.resolved) {
            const dismissedAlerts = JSON.parse(sessionStorage.getItem('dismissedFalls') || '[]');

            if (newestAlert.message && newestAlert.message.toLowerCase().includes('fall') && !dismissedAlerts.includes(newestAlert.id)) {
              if (newestAlert.id !== lastProcessedAlertId.current) {
                lastProcessedAlertId.current = newestAlert.id; 
                setSelectedAlert(newestAlert);
              }
            }
          }
        }

        // 3. معالجة بيانات العمال ومواقعهم على الخريطة
        const activeOnly = processedAlerts.filter(a => !a.resolved);
        const formattedHelmets: Helmet[] = workerData.map((w: any) => {
          const hasActiveAlert = activeOnly.some(alert => alert.workerName === w.name);
          const fixedOffset = (w.id * 0.002) % 0.01; 

          return {
            id: `H${w.id}`, 
            workerName: w.name,
            status: hasActiveAlert ? 'alert' : 'active',
            location: { 
              lat: 25.3463 + (w.id % 2 === 0 ? fixedOffset : -fixedOffset), 
              lng: 49.5937 + (w.id % 3 === 0 ? fixedOffset : -fixedOffset) 
            }
          };
        });

        setHelmets(formattedHelmets);
        setStats(prev => ({ ...prev, totalWorkers: workerData.length }));
      }
    } catch (error) {
      setIsConnected(false);
      console.error("Dashboard Sync Failure:", error);
    }
  };

  // Lifecycle: Initialize the 2-second polling interval (Heartbeat)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Statistic Aggregation:
   * Re-calculates totals whenever 'allAlerts' changes to update header cards.
   */
  useEffect(() => {
    const activeSharp = allAlerts.filter(a => !a.resolved && a.message?.toLowerCase().includes('sharp')).length;
    const activePothole = allAlerts.filter(a => !a.resolved && a.message?.toLowerCase().includes('pothole')).length;
    const activeFall = allAlerts.filter(a => !a.resolved && a.message?.toLowerCase().includes('fall')).length;
    const resolved = allAlerts.filter(a => a.resolved).length;

    setStats(prev => ({
        ...prev,
        sharpToolAlerts: activeSharp,
        potholeAlerts: activePothole,
        fallAlerts: activeFall,
        resolvedCount: resolved
    }));
  }, [allAlerts]);

  const handleDismissModal = () => {
    if (selectedAlert) {
      const dismissed = JSON.parse(sessionStorage.getItem('dismissedFalls') || '[]');
      if (!dismissed.includes(selectedAlert.id)) {
        dismissed.push(selectedAlert.id);
        sessionStorage.setItem('dismissedFalls', JSON.stringify(dismissed));
      }
    }
    setSelectedAlert(null); // قفل البوب-أب
  };
  
  /**
   * handleResolveAlert:
   * Commits an incident resolution to the backend and updates the UI state.
   */
  const handleResolveAlert = async (alertId: string | number) => {
    try {
      const response = await fetch(`${API_URL}/api/alerts/resolve/${alertId}`, { method: 'POST' });
      if (response.ok) {
        fetchData();
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error("Resolution Error: Failed to clear the alert.");
    }
  };

  /**
   * handleClearAll:
   * Administrative bulk-clear for the alert database.
   */
  const handleClearAll = async () => {
    if(!window.confirm("Perform administrative clear of all alert logs?")) return;
    try {
      const response = await fetch(`${API_URL}/api/alerts/clear`, { method: 'POST' });
      if (response.ok) fetchData();
    } catch (error) {
      console.error("Cleanup Error: Failed to reach purge endpoint.");
    }
  };



  const runInference = async () => {
  if (!session || !videoRef.current || !canvasRef.current || !showCamera) return;
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  if (!ctx || video.videoWidth === 0) return;

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640; tempCanvas.height = 640;
    tempCanvas.getContext('2d')?.drawImage(video, 0, 0, 640, 640);
    const imgData = tempCanvas.getContext('2d')?.getImageData(0, 0, 640, 640);
    
    if (imgData) {
      const input = new Float32Array(3 * 640 * 640);
      for (let i = 0; i < 640 * 640; i++) {
        input[i] = imgData.data[i * 4] / 255.0;
        input[i + 640*640] = imgData.data[i*4 + 1] / 255.0;
        input[i + 2*640*640] = imgData.data[i*4 + 2] / 255.0;
      }
      
      const tensor = new ort.Tensor('float32', input, [1, 3, 640, 640]);
      const outputs = await session.run({ images: tensor });
      const output = outputs[Object.keys(outputs)[0]].data as Float32Array;

      const numClasses = 3; 
      const numPredictions = output.length / (4 + numClasses);
      
      for (let i = 0; i < numPredictions; i++) {
        const scores = [output[4*numPredictions+i], output[5*numPredictions+i], output[6*numPredictions+i]];
        const maxConf = Math.max(...scores);
        const classId = scores.indexOf(maxConf);

        if (maxConf > 0.65) {
          const x = (output[i] - output[2*numPredictions+i]/2) * (canvas.width/640);
          const y = (output[numPredictions+i] - output[3*numPredictions+i]/2) * (canvas.height/640);
          const w = output[2*numPredictions+i] * (canvas.width/640);
          const h = output[3*numPredictions+i] * (canvas.height/640);

          let label = ""; let color = ""; let textColor = "#FFFFFF";
          if (classId === 0) { 
              // الفئة 0: Sharp Tools (أزرق)
              label = "Sharp Tool (Hazard)"; 
              color = "#0000FF"; 
          } 
          else if (classId === 1) { 
              // الفئة 1: Potholes (سماوي)
              label = "Pothole (Hazard)"; 
              color = "#00FFFF"; 
              textColor = "#000000"; // نص أسود عشان يوضح فوق السماوي
          } 
          else if (classId === 2) { 
              // الفئة 2: Handheld Tool (أبيض)
              label = "Handheld Tool (Safe)"; 
              color = "#FFFFFF"; 
              textColor = "#000000"; 
          }

          ctx.strokeStyle = color; ctx.lineWidth = 5;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = color;
          ctx.font = "bold 16px Arial";
          const txt = `${label} ${(maxConf * 100).toFixed(1)}%`;
          ctx.fillRect(x, y - 25, ctx.measureText(txt).width + 10, 25);
          ctx.fillStyle = textColor; ctx.fillText(txt, x + 5, y - 7);

          // 🟢 الربط مع السيرفر وتحديث المصفوفات الأصلية
          if (label.includes("(Hazard)") && (Date.now() - lastAlertSentTime.current > 8000)) {
            lastAlertSentTime.current = Date.now();
            syncAlertWithServer(label.split(' ')[0], Math.round(maxConf * 100));
          }
        }
      }
    }
  } catch (err) {}
  if (showCamera) requestAnimationFrame(runInference);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">
      
      {/* Permanent Navigation Sidebar */}
      <div className="z-50 h-full w-72 flex-shrink-0">
        <Sidebar currentPage="dashboard" onNavigate={(p: Page) => onNavigate(p)} onLogout={onLogout} />
      </div>

      <div className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-gray-50">
        
        {/* Dashboard Header: Controls and KPI Cards */}
        <header className="z-40 flex-shrink-0 border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">Safety Operations Center</h1>
            <div className="flex items-center gap-3">
               {/* Visibility Toggle for AI Video Feed */}
               <button
                  onClick={toggleCamera}
                  className={`flex h-9 items-center justify-center gap-2 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80 ${
                    showCamera ? 'border-gray-200 bg-gray-100 text-gray-600' : 'border-indigo-200 bg-indigo-50 text-indigo-600'
                  }`}
               >
                  {showCamera ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showCamera ? 'Hide Live Feed' : 'Show Live Feed'}
               </button>

               {/* Network Status Indicator */}
               <div className={`flex h-9 items-center justify-center gap-2 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                  isConnected ? 'border-green-200 bg-green-50 text-green-600' : 'border-red-200 bg-red-50 text-red-600'
               }`}>
                 <Wifi className={`h-3.5 w-3.5 ${isConnected ? 'animate-pulse' : ''}`} />
                 {isConnected ? 'System Online' : 'Connecting...'}
               </div>
            </div>
          </div>

          {/* Key Metric Overview Section */}
          <div className="flex w-full flex-row gap-3">
            <div className="min-w-0 flex-1">
              <StatsCard icon={<Users className="h-6 w-4 text-blue-600" />} bg="bg-blue-50" label="Total Workers" value={stats.totalWorkers} />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<Hammer className="h-6 w-4 text-orange-600" />} bg={stats.sharpToolAlerts > 0 ? "bg-red-100" : "bg-orange-50"} label="Sharp Tool Alerts" value={stats.sharpToolAlerts} isDanger={stats.sharpToolAlerts > 0} />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<AlertTriangle className="h-6 w-4 text-red-600" />} bg={stats.potholeAlerts > 0 ? "bg-red-100" : "bg-red-50"} label="Pothole Hazards" value={stats.potholeAlerts} isDanger={stats.potholeAlerts > 0} />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<Activity className="h-6 w-4 text-purple-600" />} bg={stats.fallAlerts > 0 ? "bg-red-100" : "bg-purple-50"} label="Fall Alerts" value={stats.fallAlerts} isDanger={stats.fallAlerts > 0} />
            </div>
            <div className="min-w-0 flex-1">
              <StatsCard icon={<CheckCircle2 className="h-6 w-4 text-green-600" />} bg="bg-green-50" label="Total Resolved" value={stats.resolvedCount} />
            </div>
          </div>
        </header>

        {/* Main Operational Area */}
        <main className="relative flex-1 overflow-hidden p-6">
          <div className="flex h-full w-full flex-row gap-6">
            
            {/* Visual Monitoring Column (Camera + Map) */}
            <div className="scrollbar-thin flex h-full min-w-0 flex-1 flex-col gap-6 overflow-y-auto pb-20 pr-2">
               {/* AI Camera Feed Panel */}
               {showCamera && (
              <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-sm" style={{ height: '400px' }}>
                <video 
                  ref={videoRef} 
                  autoPlay playsInline muted 
                  className="h-full w-full bg-black object-contain" 
                  onLoadedMetadata={runInference}
                />
                <canvas ref={canvasRef} className="pointer-events-none absolute left-0 top-0 h-full w-full" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <div className="flex animate-pulse items-center gap-2 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-white"></span> LIVE AI VISION
                  </div>
                  {!session && <div className="rounded bg-yellow-500 px-2 py-1 text-[10px] font-bold text-black">LOADING ENGINE...</div>}
                </div>
              </div>
            )}

               {/* Satellite GPS Tracking Panel */}
               <div className="relative flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                 style={{ height: showCamera ? '400px' : '100%', minHeight: '400px', flex: showCamera ? 'none' : '1' }}>
                    <div className="h-full w-full flex-1">
                        <RealGoogleMap
                          helmets={helmets}
                          selectedHelmetId={selectedAlert?.helmetId || null}
                          alerts={activeAlerts} 
                          onHelmetClick={() => {}}
                        />
                    </div>
               </div>
            </div>

            {/* Incident Management Column (Alert Feed) */}
            <div className="flex h-full flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ width: '420px', minWidth: '420px' }}>
              <AlertFeed alerts={activeAlerts} onAlertClick={(a: Alert) => setSelectedAlert(a)} onClearAll={handleClearAll} />
            </div>
          </div>
        </main>
      </div>

      {/* Critical Interaction Layer: Alert Detailed View */}
      {selectedAlert && (
        <CriticalAlertModal alert={selectedAlert} onClose={handleDismissModal} onResolve={handleResolveAlert} />      )}
    </div>
  );
}

/**
 * StatsCard Presentation Component:
 * Highlights critical safety data points with dynamic danger-state styling.
 */
function StatsCard({ icon, bg, label, value, isDanger = false }: any) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-300 ${isDanger ? 'border-red-200 bg-red-50 ring-1 ring-red-100' : 'border-gray-200 bg-white hover:shadow-md'}`}>
      <div className={`flex-shrink-0 rounded-xl p-3 ${bg}`}>{icon}</div>
      <div className="min-w-0">
        <div className={`mb-0.5 truncate text-xs font-extrabold uppercase tracking-wider ${isDanger ? 'text-red-700' : 'text-gray-400'}`}>{label}</div>
        <div className={`text-2xl font-bold leading-none ${isDanger ? 'text-red-700' : 'text-gray-800'}`}>{value}</div>
      </div>
    </div>
  );
}
