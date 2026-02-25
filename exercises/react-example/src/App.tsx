import React, { useState } from 'react';
import { motion } from 'motion/react';
import QRCode from 'react-qr-code';
import { QrCode, X } from 'lucide-react';

// --- Technické diagramy pro testovací otázky ---
const DiagramTerminals = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <rect x="70" y="20" width="60" height="60" rx="4" fill="white" stroke="#334155" strokeWidth="2" />
    <circle cx="85" cy="35" r="4" fill="#ef4444" />
    <circle cx="115" cy="35" r="4" fill="#ef4444" />
    <circle cx="100" cy="70" r="4" fill="#ef4444" />
    <text x="100" y="95" textAnchor="middle" fontSize="10" className="fill-slate-400 font-bold">SVORKY PŘEPÍNAČE</text>
  </svg>
);

const DiagramWires = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <rect x="40" y="40" width="120" height="20" rx="10" fill="#cbd5e1" />
    <circle cx="65" cy="50" r="6" fill="#92400e" />
    <circle cx="100" cy="50" r="6" fill="#2563eb" />
    <circle cx="135" cy="50" r="6" fill="#22c55e" />
    <text x="100" y="85" textAnchor="middle" fontSize="10" className="fill-slate-400 font-bold">KABEL CYKY-J</text>
  </svg>
);

const DiagramTwoSwitches = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <rect x="30" y="35" width="30" height="30" fill="white" stroke="#334155" strokeWidth="2" />
    <line x1="60" y1="45" x2="140" y2="45" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
    <line x1="60" y1="55" x2="140" y2="55" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
    <rect x="140" y="35" width="30" height="30" fill="white" stroke="#334155" strokeWidth="2" />
    <text x="100" y="85" textAnchor="middle" fontSize="10" className="fill-slate-400 font-bold">LINIOVÉ SCHÉMA</text>
  </svg>
);

const DiagramSafety = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <line x1="30" y1="30" x2="170" y2="30" stroke="#3b82f6" strokeWidth="2" />
    <line x1="30" y1="50" x2="170" y2="50" stroke="#22c55e" strokeWidth="2" />
    <line x1="30" y1="70" x2="170" y2="70" stroke="#f97316" strokeWidth="2" />
    <rect x="90" y="62" width="20" height="15" fill="white" stroke="red" strokeWidth="2" />
    <text x="20" y="35" fontSize="10">N</text>
    <text x="18" y="55" fontSize="10">PE</text>
    <text x="22" y="75" fontSize="10">L</text>
  </svg>
);

const DiagramStripper = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <path d="M50 70 L80 30 L150 30 L150 40 L85 40 L55 80 Z" fill="#ef4444" />
    <circle cx="120" cy="35" r="5" fill="#64748b" />
  </svg>
);

const DiagramBreaker = () => (
  <svg viewBox="0 0 200 100" className="w-full h-32 bg-slate-50 rounded-lg border border-slate-200">
    <rect x="85" y="20" width="30" height="60" rx="2" fill="white" stroke="#334155" strokeWidth="2" />
    <rect x="92" y="35" width="16" height="25" fill="#94a3b8" />
    <text x="100" y="52" textAnchor="middle" fontSize="10" fontWeight="bold">B10</text>
  </svg>
);

// --- UI Ikony ---
const IconLight = ({ on }: { on: boolean }) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill={on ? "#facc15" : "none"} stroke={on ? "#854d0e" : "#94a3b8"} strokeWidth="2">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);

const RockerSwitch = ({ state, onChange, isCross = false }: { state: number, onChange: () => void, isCross?: boolean }) => {
  return (
    <motion.button
      onClick={onChange}
      className={`w-10 h-14 rounded-md shadow-inner flex items-center justify-center p-1 ${isCross ? 'bg-blue-200' : 'bg-slate-200'}`}
      whileTap={{ scale: 0.9 }}
      style={{ perspective: 300 }}
    >
      <motion.div
        className={`w-full h-full rounded shadow-md border ${isCross ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-300'}`}
        animate={{
          rotateX: state === 0 ? 35 : -35,
          y: state === 0 ? -2 : 2,
          boxShadow: state === 0 
            ? "0px 4px 2px -1px rgba(0,0,0,0.3), inset 0px -2px 4px rgba(0,0,0,0.1)" 
            : "0px -4px 2px -1px rgba(0,0,0,0.3), inset 0px 2px 4px rgba(0,0,0,0.1)"
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className={`w-full h-full flex flex-col justify-between py-1.5 items-center ${isCross ? 'text-blue-400' : 'text-slate-300'}`}>
           <div className="w-3 h-0.5 bg-current rounded-full"></div>
           <div className="w-3 h-0.5 bg-current rounded-full"></div>
        </div>
      </motion.div>
    </motion.button>
  );
};

const BreakerSwitch = ({ state, onChange }: { state: boolean, onChange: () => void }) => {
  return (
    <motion.button
      onClick={onChange}
      className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-inner ${state ? 'bg-green-600 border-green-700' : 'bg-red-600 border-red-700'}`}
      whileTap={{ scale: 0.9 }}
      style={{ perspective: 300 }}
    >
      <motion.div
        className="w-4 h-6 bg-slate-100 rounded shadow-md border border-slate-300"
        animate={{
          rotateX: state ? 35 : -35,
          y: state ? -2 : 2,
          boxShadow: state 
            ? "0px 3px 2px -1px rgba(0,0,0,0.4), inset 0px -1px 2px rgba(0,0,0,0.2)" 
            : "0px -3px 2px -1px rgba(0,0,0,0.4), inset 0px 1px 2px rgba(0,0,0,0.2)"
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
      />
    </motion.button>
  );
};

const QUESTIONS = [
  { text: "Kolik připojovacích svorek má standardní křížový přepínač (Řazení 7)?", diagram: <DiagramTerminals />, options: ["2 svorky", "3 svorky", "4 svorky", "5 svorek"], correct: 2, explanation: "Křížový přepínač má 4 svorky – dva páry pro korespondenční vodiče." },
  { text: "Jakou barvu má podle normy nulový vodič (N)?", diagram: <DiagramWires />, options: ["Zelenožlutá", "Hnědá", "Černá", "Světle modrá"], correct: 3, explanation: "Nulový vodič (N) je v domovních instalacích vždy světle modrý." },
  { text: "Které řazení vypínačů je zobrazeno na schématu ovládání ze dvou míst?", diagram: <DiagramTwoSwitches />, options: ["2x řazení 1", "2x řazení 6", "1x řazení 6 a 1x řazení 7", "2x řazení 5"], correct: 1, explanation: "Pro dvě místa se používají dva střídavé přepínače (řazení 6)." },
  { text: "Který vodič na schématu smí být přerušen vypínačem?", diagram: <DiagramSafety />, options: ["Modrý (N)", "Zelenožlutý (PE)", "Hnědý/Oranžový (L)", "Všechny tři"], correct: 2, explanation: "Vypínačem se vždy přerušuje pouze fáze (L). N a PE nesmí být nikdy přerušeny!" },
  { text: "Jaký nástroj je nejvhodnější pro bezpečné odpláštění kabelu CYKY?", diagram: <DiagramStripper />, options: ["Kuchyňský nůž", "Kombinované kleště", "Nože na kabely (Jokari)", "Plochý šroubovák"], correct: 2, explanation: "Nože na kabely umožňují nastavit hloubku řezu bez poškození izolace žil." },
  { text: "Jakou jmenovitou hodnotu jističe B zvolíte pro světelný okruh 1.5 mm²?", diagram: <DiagramBreaker />, options: ["B 6A", "B 10A", "B 16A", "B 20A"], correct: 1, explanation: "Pro světelné okruhy s průřezem 1.5 mm² se standardně používá jistič 10A." },
  { text: "Kde se u střídavého přepínače zapojuje přívodní fáze?", diagram: <DiagramTerminals />, options: ["Na libovolnou svorku", "Na společnou svorku (L)", "Na korespondenční svorku", "Nikam"], correct: 1, explanation: "Přívodní fáze musí být na společné svorce (označené L nebo šipkou)." },
  { text: "Může být křížový vypínač (řazení 7) použit jako první v řadě?", diagram: <DiagramTerminals />, options: ["Ano", "Ne, musí být mezi řazením 6", "Ano, ale světlo bude blikat", "Jen v průmyslu"], correct: 1, explanation: "Křížový vypínač se vkládá vždy mezi dva střídavé přepínače (řazení 6)." },
  { text: "Jak se nazývají vodiče propojující dva přepínače řazení 6?", diagram: <DiagramTwoSwitches />, options: ["Hlavní přívody", "Nulové vodiče", "Korespondenční vodiče", "Zemnící vodiče"], correct: 2, explanation: "Vodiče přenášející fázi mezi vypínači jsou korespondenční vodiče." },
  { text: "Co znamená barevné značení Zelenožlutá?", diagram: <DiagramWires />, options: ["Fázový vodič", "Nulový vodič", "Ochranný vodič (PE)", "Signální vodič"], correct: 2, explanation: "Zelenožlutá barva je vyhrazena výhradně pro ochranný vodič PE." }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('sim');
  const [circuitMode, setCircuitMode] = useState(6);
  const [sw1, setSw1] = useState(0);
  const [swMid, setSwMid] = useState(0);
  const [sw2, setSw2] = useState(0);
  const [breaker, setBreaker] = useState(true);

  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; selected: number } | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Výpočet napětí na korespondenčních vodičích
  const livePath1 = breaker && sw1 === 0;
  const livePath2 = breaker && sw1 === 1;

  // Logika pro křížový vypínač
  let finalPath1, finalPath2;
  if (circuitMode === 7) {
    // Pokud je křížový vypínač v poloze 1 (swMid === 1), prohodí vstupy
    finalPath1 = swMid === 0 ? livePath1 : livePath2;
    finalPath2 = swMid === 0 ? livePath2 : livePath1;
  } else {
    finalPath1 = livePath1;
    finalPath2 = livePath2;
  }

  // Výpočet stavu světla
  const isLightOn = sw2 === 0 ? finalPath1 : finalPath2;

  const getWireAnim = (isLive: boolean | number) => ({
    animate: {
      stroke: isLive ? "#f97316" : "#475569",
      strokeWidth: 2,
      filter: "none"
    },
    transition: {
      d: { type: "spring", stiffness: 300, damping: 30 }
    }
  });

  const resetTest = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setFeedback(null);
  };

  const handleAnswer = (idx: number) => {
    if (feedback) return;
    const correct = idx === QUESTIONS[currentQ].correct;
    if (correct) setScore(score + 1);
    setFeedback({ correct, selected: idx });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-xl font-bold">Simulátor Elektroinstalace: Proudová cesta</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowQRModal(true)} 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              title="Zobrazit QR kód pro sdílení"
            >
              <QrCode size={20} />
            </button>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button onClick={() => setActiveTab('sim')} className={`px-4 py-2 rounded-md text-sm font-bold ${activeTab === 'sim' ? 'bg-blue-600' : ''}`}>Schéma</button>
              <button onClick={() => setActiveTab('test')} className={`px-4 py-2 rounded-md text-sm font-bold ${activeTab === 'test' ? 'bg-blue-600' : ''}`}>Test</button>
            </div>
          </div>
        </div>

        {/* QR Kód Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative flex flex-col items-center"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-6 text-slate-800">Sdílet aplikaci</h2>
              <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm mb-6">
                <QRCode value={window.location.href} size={200} />
              </div>
              <p className="text-sm text-slate-500 text-center mb-4">
                Naskenujte tento QR kód pro otevření simulátoru na mobilním zařízení nebo tabletu.
              </p>
              <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 break-all text-center">
                {window.location.href}
              </div>
            </motion.div>
          </div>
        )}

        {/* Global Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Typ obvodu:</span>
            <div className="flex border border-slate-300 rounded overflow-hidden">
              <button onClick={() => setCircuitMode(6)} className={`px-4 py-1 text-xs font-bold ${circuitMode === 6 ? 'bg-slate-800 text-white' : 'bg-white'}`}>Řazení 6</button>
              <button onClick={() => setCircuitMode(7)} className={`px-4 py-1 text-xs font-bold ${circuitMode === 7 ? 'bg-slate-800 text-white' : 'bg-white'}`}>Řazení 7</button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hlavní jistič:</span>
            <BreakerSwitch state={breaker} onChange={() => setBreaker(!breaker)} />
          </div>
        </div>

        {activeTab === 'sim' ? (
          <div className="p-8">
            <div className="relative h-64 bg-slate-100 rounded-xl border border-slate-200 shadow-inner flex items-center justify-center p-4">
              
              {/* SVG čisté schéma zapojení */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Přívod od jističe */}
                <motion.line 
                  x1="5" y1="50" x2="20" y2="50" 
                  {...getWireAnim(breaker)}
                  vectorEffect="non-scaling-stroke" 
                />
                
                {/* Korespondenční vodiče k Switch 2 nebo Mid */}
                <motion.path 
                  d="M 23 48 L 40 35" fill="none" 
                  {...getWireAnim(livePath1)}
                  vectorEffect="non-scaling-stroke" 
                />
                <motion.path 
                  d="M 23 52 L 40 65" fill="none" 
                  {...getWireAnim(livePath2)}
                  vectorEffect="non-scaling-stroke" 
                />

                {circuitMode === 6 ? (
                  <>
                    <motion.path 
                      d="M 40 35 L 77 48" fill="none" 
                      {...getWireAnim(livePath1)}
                      vectorEffect="non-scaling-stroke" 
                    />
                    <motion.path 
                      d="M 40 65 L 77 52" fill="none" 
                      {...getWireAnim(livePath2)}
                      vectorEffect="non-scaling-stroke" 
                    />
                  </>
                ) : (
                  <>
                    {/* Propojky k mezipatru */}
                    <motion.path 
                      d="M 40 35 L 45 35" fill="none" 
                      {...getWireAnim(livePath1)}
                      vectorEffect="non-scaling-stroke" 
                    />
                    <motion.path 
                      d="M 40 65 L 45 65" fill="none" 
                      {...getWireAnim(livePath2)}
                      vectorEffect="non-scaling-stroke" 
                    />
                    
                    {/* Vnitřní propojení křížového vypínače */}
                    <motion.path 
                      fill="none"
                      vectorEffect="non-scaling-stroke" 
                      animate={{
                        d: swMid === 0 ? "M 45 35 L 55 35" : "M 45 35 L 55 65",
                        ...getWireAnim(livePath1).animate
                      }}
                      transition={getWireAnim(livePath1).transition as any}
                    />
                    <motion.path 
                      fill="none"
                      vectorEffect="non-scaling-stroke" 
                      animate={{
                        d: swMid === 0 ? "M 45 65 L 55 65" : "M 45 65 L 55 35",
                        ...getWireAnim(livePath2).animate
                      }}
                      transition={getWireAnim(livePath2).transition as any}
                    />

                    {/* Výstupy z křížového vypínače */}
                    <motion.path 
                      d="M 55 35 L 77 48" fill="none" 
                      {...getWireAnim(finalPath1)}
                      vectorEffect="non-scaling-stroke" 
                    />
                    <motion.path 
                      d="M 55 65 L 77 52" fill="none" 
                      {...getWireAnim(finalPath2)}
                      vectorEffect="non-scaling-stroke" 
                    />
                  </>
                )}

                {/* Vývod ke svítidlu */}
                <motion.line 
                  x1="82" y1="50" x2="90" y2="50" 
                  {...getWireAnim(isLightOn)}
                  vectorEffect="non-scaling-stroke" 
                />
              </svg>

              <div className="flex items-center justify-around w-full z-10">
                {/* Vypínač 1 */}
                <div className="flex flex-col items-center gap-2">
                  <RockerSwitch state={sw1} onChange={() => setSw1(sw1 === 0 ? 1 : 0)} />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Přepínač 1</span>
                </div>

                {/* Křížový vypínač (volitelně) */}
                {circuitMode === 7 && (
                  <div className="flex flex-col items-center gap-2">
                    <RockerSwitch state={swMid} onChange={() => setSwMid(swMid === 0 ? 1 : 0)} isCross />
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Křížový</span>
                  </div>
                )}

                {/* Vypínač 2 */}
                <div className="flex flex-col items-center gap-2">
                  <RockerSwitch state={sw2} onChange={() => setSw2(sw2 === 0 ? 1 : 0)} />
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Přepínač 2</span>
                </div>

                {/* Žárovka */}
                <div className="flex flex-col items-center gap-2">
                  <IconLight on={isLightOn} />
                  <span className={`text-xs font-black ${isLightOn ? 'text-yellow-600' : 'text-slate-400'}`}>{isLightOn ? 'SVÍTÍ' : 'VYPNUTO'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-slate-900 p-6 rounded-xl text-white shadow-lg">
              <h3 className="font-bold text-blue-400 text-sm mb-3 uppercase flex items-center gap-2">
                Poznámka pro výuku: Proudová cesta
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                V tomto zobrazení vidíme čistou logiku. Oranžová barva znázorňuje <strong>fázový vodič (L)</strong> pod napětím. 
                Studenti by měli sledovat, jak přepnutí kontaktu u kteréhokoli vypínače změní cestu fáze a uzavře nebo rozpojí obvod ke svítidlu.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {!showResult ? (
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-w-2xl mx-auto">
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Test znalostí: Otázka {currentQ + 1} / {QUESTIONS.length}</span>
                  <h2 className="text-lg font-bold mt-2 leading-tight">{QUESTIONS[currentQ].text}</h2>
                </div>

                <div className="my-6">{QUESTIONS[currentQ].diagram}</div>

                <div className="space-y-2">
                  {QUESTIONS[currentQ].options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAnswer(i)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        feedback 
                          ? i === QUESTIONS[currentQ].correct ? 'bg-green-100 border-green-500' : i === feedback.selected ? 'bg-red-100 border-red-500' : 'bg-white opacity-50'
                          : 'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                      disabled={feedback !== null}
                    >
                      <span className="text-sm font-bold">{opt}</span>
                    </button>
                  ))}
                </div>

                {feedback && (
                  <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
                    <p className="text-xs text-slate-600 italic mb-4">{QUESTIONS[currentQ].explanation}</p>
                    <button onClick={feedback.correct ? () => { setFeedback(null); if (currentQ < QUESTIONS.length - 1) setCurrentQ(currentQ + 1); else setShowResult(true); } : () => setFeedback(null)} 
                            className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs">
                      {currentQ < QUESTIONS.length - 1 ? 'DALŠÍ OTÁZKA' : 'ZOBRAZIT VÝSLEDEK'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-12 bg-white border border-slate-200 rounded-xl shadow-xl max-w-sm mx-auto">
                <h2 className="text-2xl font-black mb-4">Výsledek testu</h2>
                <div className="text-6xl font-black text-blue-600 mb-8">{Math.round((score/QUESTIONS.length)*100)}%</div>
                <button onClick={resetTest} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg">Zkusit znovu</button>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
          Učební obor Elektrikář • Technologie elektroinstalace • 2026
        </div>
      </div>
    </div>
  );
};

export default App;
