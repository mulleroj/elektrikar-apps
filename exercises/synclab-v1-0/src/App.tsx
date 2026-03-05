import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, Settings, Activity, CheckCircle2, AlertTriangle, 
  HelpCircle, Info, RefreshCcw, Gauge, ArrowRightLeft 
} from 'lucide-react';

const App = () => {
  // Navigation
  const [activeView, setActiveView] = useState('theory'); // theory, simulator, sync_game

  // Machine State
  const [frequency, setFrequency] = useState(50);
  const [load, setLoad] = useState(75);
  const [excitation, setExcitation] = useState(85);
  const [isSynchronized, setIsSynchronized] = useState(true);
  const [isStable, setIsStable] = useState(true);
  const [mode, setMode] = useState('motor');
  
  // Animation State
  const [statorAngle, setStatorAngle] = useState(0);
  const [rotorAngle, setRotorAngle] = useState(0);
  const [loadAngle, setLoadAngle] = useState(0);
  const [gridAngle, setGridAngle] = useState(0);

  // Quiz State
  const [quizStep, setQuizStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const requestRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);

  // Physics Simulation
  const animate = (time: number) => {
    if (lastUpdateTimeRef.current !== undefined) {
      const deltaTime = (time - lastUpdateTimeRef.current) / 1000;
      
      const gFreq = 50;
      const omegaGrid = 2 * Math.PI * (gFreq / 5);
      setGridAngle(prev => (prev + omegaGrid * deltaTime * 50) % 360);

      const mFreq = isSynchronized ? 50 : frequency;
      const omegaStator = 2 * Math.PI * (mFreq / 5);
      const newStatorAngle = (statorAngle + omegaStator * deltaTime * 50) % 360;
      setStatorAngle(newStatorAngle);

      if (isSynchronized) {
        const maxTorque = (excitation / 100) * 120;
        const targetDelta = Math.asin(Math.min(0.99, Math.max(-0.99, load / maxTorque))) * (180 / Math.PI);
        setLoadAngle(prev => prev + (targetDelta - prev) * 0.1);
        setRotorAngle(newStatorAngle - (mode === 'motor' ? loadAngle : -loadAngle));

        if (Math.abs(load) > maxTorque) {
          setIsStable(false);
          setIsSynchronized(false);
        }
      } else {
        setRotorAngle(newStatorAngle);
        setLoadAngle(0);
      }
    }
    lastUpdateTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [frequency, load, excitation, isSynchronized, mode, statorAngle, loadAngle]);

  const quizQuestions = [
    {
      q: "Jak se změní otáčky synchronního motoru při zvýšení zatížení?",
      a: ["Klesnou (skluz)", "Zůstanou přesně stejné", "Zvýší se"],
      correct: 1,
      hint: "Slovo synchronní znamená 'shodný v čase'."
    },
    {
      q: "K čemu slouží budič u synchronního stroje?",
      a: ["K roztočení statoru", "K napájení rotoru ss proudem", "K chlazení"],
      correct: 1,
      hint: "Rotor musí být magnet, aby se mohl 'uzamknout' do pole statoru."
    },
    {
      q: "Co se stane při překročení kritického úhlu delta (cca 90°)?",
      a: ["Stroj se zrychlí", "Stroj vypadne ze synchronismu", "Nic"],
      correct: 1,
      hint: "Magnetický závěs má svou mez pevnosti."
    }
  ];

  const handleAnswer = (idx: number) => {
    if (idx === quizQuestions[quizStep].correct) setScore(score + 1);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetMachine = () => {
    setIsStable(true);
    setIsSynchronized(true);
    setLoad(75);
    setExcitation(85);
    setFrequency(50);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-blue-700 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Zap className="fill-yellow-400 text-yellow-400" />
          <h1 className="text-xl font-bold uppercase tracking-tight">SyncLab v1.0</h1>
        </div>
        <div className="flex bg-blue-800 rounded-lg p-1">
          <button onClick={() => setActiveView('theory')} className={`px-4 py-1 rounded-md text-sm font-medium ${activeView === 'theory' ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}>Teorie & Test</button>
          <button onClick={() => setActiveView('simulator')} className={`px-4 py-1 rounded-md text-sm font-medium ${activeView === 'simulator' ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}>Simulátor</button>
          <button onClick={() => setActiveView('sync_game')} className={`px-4 py-1 rounded-md text-sm font-medium ${activeView === 'sync_game' ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}>Fázování</button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {activeView === 'theory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="text-blue-500" /> Znalostní kvíz</h2>
              {!showResult ? (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase">Otázka {quizStep + 1} z {quizQuestions.length}</span>
                    <p className="text-lg font-medium mt-1">{quizQuestions[quizStep].q}</p>
                  </div>
                  <div className="space-y-3">
                    {quizQuestions[quizStep].a.map((ans, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleAnswer(i)}
                        className="w-full p-4 text-left border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-medium"
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="mx-auto text-green-500 w-16 h-16 mb-4" />
                  <h3 className="text-2xl font-bold">Hotovo!</h3>
                  <p className="text-slate-500 mb-6">Dosáhl jsi skóre {score} z {quizQuestions.length}</p>
                  <button onClick={() => {setQuizStep(0); setScore(0); setShowResult(false);}} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">Zkusit znovu</button>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowRightLeft className="text-blue-500" /> Porovnání strojů</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-slate-400 uppercase text-[10px] tracking-widest">
                    <th className="pb-2 text-left">Vlastnost</th>
                    <th className="pb-2 text-left">Asynchronní</th>
                    <th className="pb-2 text-left text-blue-600">Synchronní</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <Row label="Otáčky" a="Se skluzem" s="Konstantní" />
                  <Row label="Buzení" a="Ze statoru" s="Vlastní (Rotor)" />
                  <Row label="Využití" a="Pohony" s="Elektrárny" />
                  <Row label="Cena" a="Nízká" s="Vysoká" />
                </tbody>
              </table>
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs text-amber-800 leading-relaxed italic">
                  <strong>Tip pro studenty:</strong> Synchronní stroje jsou složitější, ale umožňují řídit jalový výkon v síti pomocí buzení.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center">
              <MachineVisual statorAngle={statorAngle} rotorAngle={rotorAngle} excitation={excitation} isStable={isStable} loadAngle={loadAngle} />
              
              {!isStable && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-4 animate-bounce">
                  <AlertTriangle />
                  <div>
                    <p className="font-bold">HAVÁRIE: Vypadnutí ze synchronismu!</p>
                    <button onClick={resetMachine} className="text-xs underline font-bold mt-1">Resetovat stroj</button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-4 gap-4 w-full mt-8">
                <Indicator label="Frekvence" value="50.0" isTarget />
                <Indicator label="Tolerance" value="50.0 ± 0.3" color="text-slate-400" />
                <Indicator 
                  label="Zátěžný úhel" 
                  value={Math.abs(Math.round(loadAngle)).toString()} 
                  unit="°" 
                  color={Math.abs(loadAngle) > 60 ? 'text-red-500' : 'text-blue-600'} 
                />
                <Indicator label="Otáčky" value="3000" unit="ot/min" />
              </div>
            </div>

            <div className="bg-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between min-w-[300px]">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-6 tracking-widest flex items-center gap-2"><Settings size={14}/> Ovládání</h3>
                
                <div className="space-y-8">
                  <Slider label="Zatížení hřídele" value={load} min={0} max={150} unit="Nm" onChange={setLoad} />
                  <Slider label="Budicí proud" value={excitation} min={20} max={150} unit="%" onChange={setExcitation} color="accent-red-500" />
                </div>

                <div className="mt-8 flex bg-slate-700 p-1 rounded-xl">
                  <button onClick={() => setMode('motor')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'motor' ? 'bg-white text-slate-900 shadow' : 'text-slate-400'}`}>MOTOR</button>
                  <button onClick={() => setMode('generator')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${mode === 'generator' ? 'bg-white text-slate-900 shadow' : 'text-slate-400'}`}>GENERÁTOR</button>
                </div>
              </div>

              <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-700">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase mb-2 flex items-center gap-1"><Info size={12}/> Pozorování</h4>
                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                  Sledujte, jak se při snižování buzení zvětšuje zátěžný úhel. Stroj se stává "měkčím" a náchylnějším k havárii.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeView === 'sync_game' && (
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center w-full max-w-4xl mx-auto">
             <div className="w-full flex justify-between items-center mb-8 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-2">
                     <div className="flex gap-4">
                       <Indicator label="Freq Sítě" value="50.0" isTarget />
                       <Indicator 
                         label="Freq Stroj" 
                         value={frequency.toFixed(1)} 
                         color={Math.abs(frequency - 50) < 0.3 ? 'text-green-600' : 'text-red-500'} 
                         isTarget={Math.abs(frequency - 50) < 0.3}
                         status={Math.abs(frequency - 50) < 0.3 ? 'ok' : 'error'}
                       />
                       <Indicator label="Tolerance" value="50.0 ± 0.3" color="text-slate-400" />
                       <Indicator 
                         label="Odchylka" 
                         value={(frequency - 50).toFixed(2)} 
                         color={Math.abs(frequency - 50) < 0.3 ? 'text-green-600' : 'text-red-500'}
                         unit="Hz"
                       />
                     </div>
                     {/* Frequency scale visualization */}
                     <div className="w-full h-1.5 bg-slate-200 rounded-full relative mt-1 overflow-visible">
                       <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-400 -top-1.25 z-10" title="50 Hz Target" />
                       <div className="absolute left-[47%] w-[6%] h-1.5 bg-green-500/40 rounded-full border-x border-green-500/20" title="Tolerance Zone" />
                       <div 
                         className={`absolute h-3 w-3 rounded-full -top-0.75 transition-all duration-200 z-20 ${Math.abs(frequency - 50) < 0.3 ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-red-500 shadow-sm shadow-red-200'}`}
                         style={{ left: `${Math.max(0, Math.min(100, 50 + (frequency - 50) * 10))}%`, transform: 'translateX(-50%)' }}
                       />
                     </div>
                   </div>

                   <div className="flex flex-col gap-2">
                     <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Fázový úhel (Δφ)</span>
                         <span className={`text-xs font-mono font-bold ${Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? 'text-green-600' : 'text-red-500'}`}>
                           {Math.round(((statorAngle - gridAngle + 540) % 360) - 180)}°
                         </span>
                       </div>
                       <div className="flex gap-2">
                         <Indicator label="Fázová Tolerance" value="±15" unit="°" color="text-slate-400" />
                       </div>
                     </div>
                     {/* Phase angle scale visualization */}
                     <div className="w-full h-1 bg-slate-200 rounded-full relative mt-1 overflow-visible">
                       <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-3 bg-slate-400 -top-1" title="0° Target" />
                       <div className="absolute left-[45.8%] w-[8.4%] h-1 bg-green-500/20 rounded-full" title="Tolerance Zone (±15°)" />
                       <div 
                         className={`absolute h-2.5 w-2.5 rounded-full -top-0.75 transition-all duration-200 ${Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? 'bg-green-500 shadow-sm shadow-green-200' : 'bg-red-500 shadow-sm shadow-red-200'}`}
                         style={{ left: `${50 + (((statorAngle - gridAngle + 540) % 360) - 180) / 3.6}%`, transform: 'translateX(-50%)' }}
                       />
                     </div>
                   </div>
                 </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stav frekvence:</span>
                    {Math.abs(frequency - 50) < 0.3 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-bold uppercase">OK</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-500 animate-pulse">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-bold uppercase">Mimo toleranci</span>
                      </div>
                    )}
                  </div>
                  {!isSynchronized && Math.abs(frequency - 50) >= 0.3 && (
                    <span className="text-[9px] text-red-400 font-medium italic">Upravte otáčky na 50 Hz ± 0.3</span>
                  )}
                </div>

                <div className={`px-4 py-2 rounded-full text-xs font-bold ${isSynchronized ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {isSynchronized ? "PŘIPOJENO K SÍTI" : "ODPOJENO (OSTROVNÍ PROVOZ)"}
                </div>
             </div>

             <div className="w-full flex justify-center gap-12 mb-8">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fáze Sítě</span>
                  <div className="w-24 h-24 bg-slate-50 rounded-full border border-slate-200 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                      <g transform={`rotate(${gridAngle}, 50, 50)`}>
                        <line x1="50" y1="50" x2="50" y2="10" stroke="#cbd5e1" strokeWidth="2" />
                        <circle cx="50" cy="10" r="3" fill="#cbd5e1" />
                      </g>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fáze Stroje (Rotor)</span>
                  <div className="w-24 h-24 bg-slate-50 rounded-full border border-slate-200 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                      <g transform={`rotate(${statorAngle}, 50, 50)`}>
                        <line x1="50" y1="50" x2="50" y2="10" stroke="#3b82f6" strokeWidth="2" />
                        <circle cx="50" cy="10" r="3" fill="#3b82f6" />
                      </g>
                    </svg>
                  </div>
                </div>
             </div>

             <div className="relative w-full max-w-[350px] aspect-square">
                {/* Phase difference indicator */}
                <div className="absolute -top-4 left-0 w-full text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fázový posuv</span>
                  <p className={`text-xl font-mono font-bold ${Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? 'text-green-600' : 'text-red-500'}`}>
                    {Math.round(((statorAngle - gridAngle + 540) % 360) - 180)}°
                  </p>
                </div>

                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Outer ring */}
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                  
                  {/* Tolerance zone arc (±15°) */}
                  <g transform={`rotate(${gridAngle - 15}, 100, 100)`}>
                    <path 
                      d="M 100 5 A 95 95 0 0 1 147.5 14.5" 
                      fill="none" 
                      stroke="#22c55e" 
                      strokeWidth="10" 
                      strokeOpacity="0.2"
                    />
                  </g>

                  {/* Grid vector (Reference) */}
                  <g transform={`rotate(${gridAngle}, 100, 100)`}>
                    <line x1="100" y1="100" x2="100" y2="10" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                    <circle cx="100" cy="10" r="4" fill="#cbd5e1" />
                    <text x="100" y="5" fontSize="8" textAnchor="middle" fill="#94a3b8" fontWeight="bold">SÍŤ</text>
                  </g>
                  
                  {/* Machine vector (Rotor representation) */}
                  <g transform={`rotate(${statorAngle}, 100, 100)`}>
                    {/* Rotor body */}
                    <rect 
                      x="94" y="20" width="12" height="40" rx="6" 
                      fill={Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? '#22c55e' : '#3b82f6'} 
                      opacity="0.8"
                    />
                    <line 
                      x1="100" y1="100" x2="100" y2="20" 
                      stroke={Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? '#16a34a' : '#2563eb'} 
                      strokeWidth="3" 
                    />
                    <circle 
                      cx="100" cy="20" r="4" 
                      fill={Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? '#16a34a' : '#2563eb'} 
                    />
                    <text x="100" y="15" fontSize="7" textAnchor="middle" fill={Math.abs(((statorAngle - gridAngle + 540) % 360) - 180) < 15 ? '#16a34a' : '#2563eb'} fontWeight="bold">ROTOR</text>
                  </g>
                </svg>
             </div>

             {!isSynchronized && Math.abs(frequency - 50) >= 0.3 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-4 animate-pulse w-full max-w-md">
                  <AlertTriangle className="shrink-0" />
                  <div>
                    <p className="text-sm font-bold uppercase leading-tight">Frekvence mimo toleranci!</p>
                    <p className="text-[11px] opacity-80">Stroj se otáčí příliš {frequency > 50 ? 'rychle' : 'pomalu'}. Upravte otáčky pro bezpečné fázování.</p>
                  </div>
                </div>
             )}

             <div className="mt-8 w-full max-w-2xl space-y-6">
                <Slider 
                  label="Nastavení otáček (Frekvence)" 
                  value={frequency} 
                  min={45} 
                  max={55} 
                  step={0.1} 
                  unit="Hz" 
                  onChange={setFrequency} 
                  highlight={{ start: 49.7, end: 50.3 }}
                />
                <button 
                  onClick={() => {
                    if (isSynchronized) {
                      setIsSynchronized(false);
                      return;
                    }
                    const diff = Math.abs(frequency - 50);
                    const phase = Math.abs(statorAngle - gridAngle) % 360;
                    if (diff < 0.3 && (phase < 15 || phase > 345)) {
                      setIsSynchronized(true);
                      alert("VÝBORNĚ! Alternátor byl bezpečně přifázován.");
                    } else {
                      alert("HAVÁRIE! Špatné fázování zničí stroj!");
                      resetMachine();
                    }
                  }}
                  className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg ${
                    isSynchronized ? 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95' : 
                    Math.abs(frequency - 50) < 0.3 ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' :
                    'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                  }`}
                >
                  {isSynchronized ? 'ODPOJIT OD SÍTĚ' : (Math.abs(frequency - 50) < 0.3 ? 'SEPNOUT VYPÍNAČ (FÁZOVAT)' : 'NEBEZPEČÍ: ŠPATNÁ FREKVENCE')}
                </button>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 text-center text-slate-400 text-xs">
        © 2024 Virtuální laboratoř elektro | Určeno pro výukové účely
      </footer>
    </div>
  );
};

// Sub-components
const Row = ({ label, a, s }: { label: string, a: string, s: string }) => (
  <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
    <td className="py-3 font-semibold text-slate-500">{label}</td>
    <td className="py-3">{a}</td>
    <td className="py-3 font-bold text-blue-600">{s}</td>
  </tr>
);

const MachineVisual = ({ statorAngle, rotorAngle, excitation, isStable, loadAngle }: { statorAngle: number, rotorAngle: number, excitation: number, isStable: boolean, loadAngle: number }) => (
  <div className="relative w-full max-w-[300px] aspect-square">
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <circle cx="100" cy="100" r="90" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2" />
      {/* Stator field indicator */}
      <g transform={`rotate(${statorAngle}, 100, 100)`}>
        <circle cx="100" cy="10" r="5" fill="#3b82f6" />
        <line x1="100" y1="100" x2="100" y2="10" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
      </g>
      {/* Rotor */}
      <g transform={`rotate(${rotorAngle}, 100, 100)`}>
        <rect x="85" y="40" width="30" height="120" rx="15" fill={isStable ? "#ef4444" : "#94a3b8"} stroke="#b91c1c" strokeWidth="2" />
        <circle cx="100" cy="100" r="12" fill="#fca5a5" />
        <text x="100" y="60" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">N</text>
        <text x="100" y="150" fontSize="14" textAnchor="middle" fill="white" fontWeight="bold">S</text>
        {/* Flux lines */}
        <path d="M85 75 Q 60 100 85 125" fill="none" stroke="#fca5a5" strokeWidth={excitation / 40} opacity="0.5" />
        <path d="M115 75 Q 140 100 115 125" fill="none" stroke="#fca5a5" strokeWidth={excitation / 40} opacity="0.5" />
      </g>
    </svg>
  </div>
);

const Slider = ({ label, value, min, max, unit, step=1, onChange, color="accent-blue-600", highlight }: { label: string, value: number, min: number, max: number, unit: string, step?: number, onChange: (val: number) => void, color?: string, highlight?: { start: number, end: number } }) => {
  const range = max - min;
  const highlightLeft = highlight ? ((highlight.start - min) / range) * 100 : 0;
  const highlightWidth = highlight ? ((highlight.end - highlight.start) / range) * 100 : 0;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
        <label className="text-slate-400">{label}</label>
        <span className="bg-slate-900 px-2 py-1 rounded text-white whitespace-nowrap">{value} {unit}</span>
      </div>
      <div className="relative flex items-center h-6 w-full px-1">
        {/* Background Track */}
        <div className="absolute left-1 right-1 h-1.5 bg-slate-700 rounded-full z-0" />
        
        {highlight && (
          <div 
            className="absolute h-1.5 bg-green-500/40 rounded-full pointer-events-none border border-green-500/30 z-1"
            style={{ 
              left: `calc(4px + ${highlightLeft} * (100% - 8px) / 100)`, 
              width: `calc(${highlightWidth} * (100% - 8px) / 100)` 
            }}
          />
        )}
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`absolute left-0 w-full h-6 appearance-none cursor-pointer z-10 bg-transparent ${color} 
            [&::-webkit-slider-runnable-track]:bg-transparent 
            [&::-moz-range-track]:bg-transparent
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-4 
            [&::-webkit-slider-thumb]:h-4 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-blue-600 
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-moz-range-thumb]:w-4 
            [&::-moz-range-thumb]:h-4 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-blue-600 
            [&::-moz-range-thumb]:shadow-sm`}
        />
      </div>
    </div>
  );
};

const Indicator = ({ label, value, color="text-slate-800", isTarget, unit="Hz", status }: { label: string, value: string, color?: string, isTarget?: boolean, unit?: string, status?: 'ok' | 'error' | 'none' }) => (
  <div className={`flex flex-col px-3 py-2 rounded-xl transition-all relative ${isTarget ? 'bg-green-50/50 border border-green-100' : ''}`}>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      {status === 'ok' && <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200" />}
      {status === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200 animate-pulse" />}
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-xl font-mono font-bold ${color}`}>{value}</span>
      {unit && <span className="text-[10px] font-bold text-slate-400">{unit}</span>}
    </div>
    {isTarget && <div className="h-1 w-full bg-green-500 rounded-full mt-1 shadow-sm shadow-green-200" />}
  </div>
);

export default App;
