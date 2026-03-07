import React, { useState, useEffect, useRef } from 'react';
import { Settings, Zap, RotateCw, Activity, Info, HelpCircle, QrCode, X, Share2, LineChart as ChartIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  // Deterministic physical simulation (fully local, no AI calls)
  const [voltage, setVoltage] = useState(12); // V
  const [magneticField, setMagneticField] = useState(1); // Tesla factor
  const [load, setLoad] = useState(0.1); // Nm
  const [mode, setMode] = useState('motor'); // 'motor' | 'dynamo'
  const [angle, setAngle] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState('sim');
  const [showQR, setShowQR] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isFlashing, setIsFlashing] = useState(false);

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const speedRef = useRef(0);
  const currentRef = useRef(0);

  // Update refs for chart
  useEffect(() => {
    speedRef.current = speed;
    currentRef.current = current;
  }, [speed, current]);

  // Flash effect on mode change
  useEffect(() => {
    setIsFlashing(true);
    const timer = setTimeout(() => setIsFlashing(false), 500);
    return () => clearTimeout(timer);
  }, [mode]);

  // Constants for simulation
  const R = 2; // Resistance of armature (Ohms)
  const K = 0.5; // Machine constant

  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current !== undefined) {
        const deltaTime = (time - lastTimeRef.current) / 1000;

        let calculatedSpeed = speed;
        let calculatedCurrent = current;

        if (mode === 'motor') {
          // Motor equations
          // U = Ei + I*R => I = (U - Ei) / R
          // Ei = K * Phi * omega
          const inducedEMF = K * magneticField * (speed * (Math.PI / 30));
          calculatedCurrent = (voltage - inducedEMF) / R;
          
          // Torque = K * Phi * I
          const motorTorque = K * magneticField * calculatedCurrent;
          const netTorque = motorTorque - load - (speed * 0.01); // with friction
          
          // Speed acceleration (simplified physics)
          const acceleration = netTorque * 50; 
          calculatedSpeed += acceleration * deltaTime;
          if (calculatedSpeed < 0) calculatedSpeed = 0;
        } else {
          // Dynamo mode (User forces rotation)
          calculatedSpeed = voltage * 10; // In dynamo mode, we use "voltage" slider as input speed
          const inducedEMF = K * magneticField * (calculatedSpeed * (Math.PI / 30));
          calculatedCurrent = inducedEMF / (R + 10); // Connected to 10 Ohm load
        }

        setSpeed(calculatedSpeed);
        setCurrent(calculatedCurrent);
        setAngle((prev) => (prev + calculatedSpeed * deltaTime * 6) % 360);
      }
      lastTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [voltage, magneticField, load, mode, speed, current]);

  const getDiagnostics = () => {
    let pIn = 0;
    let pOut = 0;
    let torque = 0;

    if (mode === 'motor') {
      // Motor: Input is Electrical, Output is Mechanical
      pIn = voltage * current; // User: U * I
      torque = K * magneticField * current;
      pOut = torque * (speed * Math.PI / 30);
    } else {
      // Dynamo: Input is Mechanical, Output is Electrical
      // User specifically requested "Příkon" for dynamo to be I * U_load
      const uLoad = current * 10; // Load resistance is 10 Ohm
      pIn = current * uLoad; 
      
      // Physical mechanical input for efficiency calculation
      torque = K * magneticField * current + (speed * 0.01);
      pOut = torque * (speed * Math.PI / 30); // This is the mechanical input
      
      // In dynamo mode, efficiency is Electrical Output / Mechanical Input
      // Since user wants "Příkon" to be the electrical part, we'll show it as requested
      // but calculate efficiency correctly: P_elec / P_mech
      const efficiency = pOut > 0 ? Math.min(100, (pIn / pOut) * 100) : 0;
      return { pIn, pOut, efficiency, torque };
    }
    
    const efficiency = pIn > 0 ? Math.min(100, (pOut / pIn) * 100) : 0;
    return { pIn, pOut, efficiency, torque };
  };

  const { pIn, pOut, efficiency, torque } = getDiagnostics();

  // Update chart data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
          speed: Math.round(speedRef.current),
          current: Number(currentRef.current.toFixed(2))
        }];
        // Keep only the last 30 data points
        return newData.slice(-30);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

   const renderMotorSVG = () => {
    const isCommutating = Math.abs(Math.sin((angle * Math.PI) / 180)) < 0.15;
    const currentDirection = Math.cos((angle * Math.PI) / 180) > 0 ? 1 : -1;

    return (
      <svg viewBox="0 0 400 300" className="w-full h-64 md:h-80 bg-slate-900 rounded-xl shadow-inner border border-slate-700 overflow-hidden">
        <defs>
          <filter id="rotorBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={Math.min(speed / 150, 4)} />
          </filter>
          <radialGradient id="sparkGradient">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Stator - Magnets */}
        <path d="M 50 150 A 100 100 0 0 1 150 50 L 150 250 A 100 100 0 0 1 50 150" fill="#ef4444" opacity="0.8" />
        <text x="80" y="155" fill="white" className="font-bold text-2xl select-none">N</text>
        
        <path d="M 350 150 A 100 100 0 0 0 250 50 L 250 250 A 100 100 0 0 0 350 150" fill="#3b82f6" opacity="0.8" />
        <text x="300" y="155" fill="white" className="font-bold text-2xl select-none">S</text>

        {/* Magnetic Field Lines */}
        {[80, 110, 140, 170, 200, 220].map((y) => (
          <line key={y} x1="160" y1={y} x2="240" y2={y} stroke="white" strokeDasharray="4" opacity="0.15" />
        ))}

        {/* Rotor Core */}
        <g transform={`rotate(${angle}, 200, 150)`}>
          {/* Motion blur ghosting for high speed */}
          {speed > 300 && (
            <g opacity="0.3" transform="rotate(-5, 200, 150)" filter="url(#rotorBlur)">
              <circle cx="200" cy="150" r="60" fill="#475569" />
            </g>
          )}
          
          <g filter={speed > 150 ? "url(#rotorBlur)" : ""}>
            <circle cx="200" cy="150" r="60" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
            {/* Commutator segments */}
            <rect x="195" y="100" width="10" height="100" rx="2" fill="#b45309" />
            <line x1="200" y1="140" x2="200" y2="160" stroke="#000" strokeWidth="1" />
            
            {/* Coil indicator */}
            <circle cx="200" cy="110" r="8" fill={currentDirection > 0 ? "#facc15" : "#64748b"} stroke="white" />
            <circle cx="200" cy="190" r="8" fill={currentDirection < 0 ? "#facc15" : "#64748b"} stroke="white" />
            <text x="196" y="114" fontSize="10" fill="black" className="font-bold select-none">{currentDirection > 0 ? "•" : "×"}</text>
            <text x="196" y="194" fontSize="10" fill="black" className="font-bold select-none">{currentDirection < 0 ? "•" : "×"}</text>
          </g>

          {/* Speed lines for visual effect */}
          {speed > 100 && (
            <g opacity={Math.min(speed / 500, 0.8)}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                <line 
                  key={deg}
                  x1="200" y1="70" x2="200" y2="50" 
                  stroke="white" strokeWidth="1" 
                  transform={`rotate(${deg}, 200, 150)`}
                  opacity={speed > 300 ? 0.6 : 0.3}
                />
              ))}
            </g>
          )}
        </g>

        {/* Brushes */}
        <rect x="192" y="75" width="16" height="12" fill="#1e293b" />
        <rect x="192" y="213" width="16" height="12" fill="#1e293b" />
        
        {/* Commutation Sparks */}
        {isCommutating && speed > 50 && (
          <g>
            <circle cx="200" cy="85" r={Math.random() * 5 + 2} fill="url(#sparkGradient)" opacity="0.8" />
            <circle cx="200" cy="215" r={Math.random() * 5 + 2} fill="url(#sparkGradient)" opacity="0.8" />
          </g>
        )}

        {/* Connection lines */}
        <line x1="200" y1="75" x2="200" y2="40" stroke="#4ade80" strokeWidth="2" />
        <line x1="200" y1="225" x2="200" y2="260" stroke="#ef4444" strokeWidth="2" />
        
        {/* Speed streaks (outer) */}
        <g transform={`translate(200, 150)`}>
           <circle cx="0" cy="0" r="85" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="30 150" opacity={Math.min(speed / 400, 0.6)}>
             <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${Math.max(0.05, 120 / Math.max(speed, 1))}s`} repeatCount="indefinite" />
           </circle>
           <circle cx="0" cy="0" r="90" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="10 170" opacity={Math.min(speed / 800, 0.4)}>
             <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur={`${Math.max(0.05, 180 / Math.max(speed, 1))}s`} repeatCount="indefinite" />
           </circle>
        </g>
      </svg>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        backgroundColor: mode === 'motor' ? '#f8fafc' : '#fffbeb'
      }}
      transition={{ duration: 0.8 }}
      className="flex flex-col min-h-screen p-4 md:p-8 relative overflow-hidden"
    >
      {/* Mode Transition Flash */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] pointer-events-none ${mode === 'motor' ? 'bg-indigo-400' : 'bg-amber-400'}`}
          />
        )}
      </AnimatePresence>

      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <h1 className="text-3xl font-bold text-slate-800">Virtuální Laborka: SS Stroje</h1>
          <p className="text-slate-500 italic">Pochopte motor a dynamo v praxi</p>
        </motion.div>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 mr-4 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setMode('motor')}
              className={`relative px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${mode === 'motor' ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {mode === 'motor' && (
                <motion.div 
                  layoutId="mode-bg" 
                  className="absolute inset-0 bg-indigo-600 rounded-lg shadow-md" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Motor</span>
            </button>
            <button 
              onClick={() => setMode('dynamo')}
              className={`relative px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${mode === 'dynamo' ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {mode === 'dynamo' && (
                <motion.div 
                  layoutId="mode-bg" 
                  className="absolute inset-0 bg-amber-500 rounded-lg shadow-md" 
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">Dynamo</span>
            </button>
          </div>
          <button 
            onClick={() => setShowQR(!showQR)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition relative"
            title="Sdílet aplikaci"
          >
            <QrCode className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full text-center relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition">
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <QRCodeSVG value={window.location.href} size={200} level="H" includeMargin={true} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Sdílet se studenty</h3>
              <p className="text-slate-500 text-sm mb-6">Naskenujte kód pro rychlý přístup k simulaci na mobilním zařízení.</p>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono text-slate-600 break-all">
                <Share2 className="w-4 h-4 flex-shrink-0" />
                {window.location.href}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Control Panel */}
        <motion.div 
          layout
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center gap-2 border-b pb-2 mb-4">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-lg">Nastavení parametrů</h2>
          </div>

          <div className="space-y-4">
            <motion.div layout>
              <div className="flex justify-between mb-2">
                <motion.label 
                  key={mode}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-slate-700"
                >
                  {mode === 'motor' ? 'Napětí zdroje (U)' : 'Vstupní otáčky'}
                </motion.label>
                <span className="text-indigo-600 font-bold">{voltage} {mode === 'motor' ? 'V' : 'ot/s'}</span>
              </div>
              <input 
                type="range" min="0" max="48" step="1" 
                value={voltage} onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </motion.div>

            <motion.div layout>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Magnetický tok (Φ)</label>
                <span className="text-blue-600 font-bold">{(magneticField * 100).toFixed(0)} %</span>
              </div>
              <input 
                type="range" min="0.1" max="2" step="0.1" 
                value={magneticField} onChange={(e) => setMagneticField(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              {mode === 'motor' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Zatížení (Brzda)</label>
                    <span className="text-red-600 font-bold">{load.toFixed(2)} Nm</span>
                  </div>
                  <input 
                    type="range" min="0" max="2" step="0.05" 
                    value={load} onChange={(e) => setLoad(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div layout className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Diagnostika</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Otáčky</p>
                <p className="text-lg font-bold text-slate-800">{Math.round(speed)} <span className="text-xs">RPM</span></p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Proud</p>
                <p className="text-lg font-bold text-slate-800">{current.toFixed(2)} <span className="text-xs">A</span></p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Příkon</p>
                <p className="text-lg font-bold text-blue-600">{pIn.toFixed(1)} <span className="text-xs">W</span></p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {mode === 'motor' ? 'U × I (el.)' : 'I × U_zát (el.)'}
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Výkon</p>
                <p className="text-lg font-bold text-indigo-600">{pOut.toFixed(1)} <span className="text-xs">W</span></p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  {mode === 'motor' ? 'M × ω (mech.)' : 'M × ω (mech.)'}
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Moment</p>
                <p className="text-lg font-bold text-rose-500">{torque.toFixed(2)} <span className="text-xs">Nm</span></p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-slate-500">Účinnost</p>
                <p className="text-lg font-bold text-emerald-600">{efficiency.toFixed(1)} <span className="text-xs">%</span></p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            layout
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RotateCw 
                  className={`w-5 h-5 text-indigo-600 ${speed > 0.1 ? 'animate-spin' : ''}`} 
                  style={{ animationDuration: speed > 0.1 ? `${Math.max(0.2, 60 / Math.max(speed, 1))}s` : '0s' }} 
                />
                <h2 className="font-bold text-lg">Průřez strojem</h2>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-400"></div> Proud k vám</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-500 text-white flex items-center justify-center text-[8px]">×</div> Proud od vás</div>
              </div>
            </div>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  exit={{ scale: 1.1, opacity: 0, rotateY: -90 }}
                  transition={{ type: "spring", damping: 15, stiffness: 100 }}
                >
                  {renderMotorSVG()}
                </motion.div>
              </AnimatePresence>
              
              {/* Mode Overlay Label */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 1.2 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className={`px-8 py-4 rounded-3xl shadow-2xl text-4xl font-black uppercase tracking-widest border-4 ${
                      mode === 'motor' 
                        ? 'bg-indigo-600 text-white border-indigo-400' 
                        : 'bg-amber-500 text-white border-amber-300'
                    }`}>
                      {mode === 'motor' ? 'MOTOR' : 'DYNAMO'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <ChartIcon className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-lg">Průběh v čase</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={10} 
                      tick={{ fill: '#64748b' }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      fontSize={10} 
                      tick={{ fill: '#64748b' }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      label={{ value: 'RPM', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b', offset: 10 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      fontSize={10} 
                      tick={{ fill: '#64748b' }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      domain={['auto', 'auto']}
                      label={{ value: 'Proud (A)', angle: 90, position: 'insideRight', fontSize: 10, fill: '#64748b', offset: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="speed" 
                      name="Otáčky (RPM)" 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="current" 
                      name="Proud (A)" 
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-800 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" /> 
                  Co právě vidíte?
                </h4>
                <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                  {mode === 'motor' 
                    ? "Elektrický proud protéká přes uhlíky do komutátoru. Ten mění směr proudu v cívce každou půlotočku, aby magnetická síla rotor stále tlačila stejným směrem."
                    : "Otáčíte hřídelí mechanicky. Vodiče protínají siločáry statoru a podle Faradayova zákona se v nich indukuje napětí. Gratuluji, vyrábíte proud!"}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 
                  Pozorování
                </h4>
                <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
                  <li>Zvyšte napětí → Motor zrychlí.</li>
                  <li>Oslabte magnet (Φ) → Motor zrychlí (odlehčení), ale ztratí sílu!</li>
                  <li>Zatěžte motor → Otáčky klesnou, ale proud (odběr) vyletí nahoru.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center gap-4">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-70">Základní vzorec</p>
              <p className="font-mono text-sm">$U = E_i + I \cdot R_a$</p>
            </div>
         </div>
         <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center gap-4">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-70">Indukované napětí</p>
              <p className="font-mono text-sm">$E_i = c \cdot \Phi \cdot n$</p>
            </div>
         </div>
         <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center gap-4">
            <div className="bg-rose-500 p-2 rounded-lg">
              <RotateCw className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-70">Moment stroje</p>
              <p className="font-mono text-sm">$M = c \cdot \Phi \cdot I$</p>
            </div>
         </div>
         <div className="bg-slate-900/50 text-slate-400 p-4 rounded-xl flex items-center gap-4 border border-slate-700/50">
            <div className="bg-slate-700 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/80">Offline Režim</p>
              <p className="text-xs opacity-70">100% lokální simulace</p>
            </div>
         </div>
      </footer>
    </motion.div>
  );
};

export default App;
