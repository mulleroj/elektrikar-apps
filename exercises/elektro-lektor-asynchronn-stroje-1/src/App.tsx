/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Zap, 
  RotateCw, 
  Cpu, 
  Activity, 
  Layers, 
  Info,
  Play,
  Gauge,
  Box,
  MousePointer2,
  Wind,
  Power,
  TrendingUp,
  ClipboardCheck
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  ReferenceArea,
  Area,
  AreaChart
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

// Sub-components for better organization
const SidebarItem = ({ id, label, icon: Icon, activeTab, onClick }: { id: string, label: string, icon: any, activeTab: string, onClick: (id: string) => void }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg translate-x-1' 
        : 'hover:bg-gray-100 text-gray-700 hover:translate-x-1'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-sm text-left">{label}</span>
  </button>
);

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center gap-2">
    {title}
  </h2>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('principle');
  const [frequency, setFrequency] = useState(50);
  const [poles, setPoles] = useState(1); // pairs of poles
  const [rotationField, setRotationField] = useState(0);
  const [rotationRotor, setRotationRotor] = useState(0);
  const [ydStage, setYdStage] = useState('OFF');
  const [load, setLoad] = useState(0);
  const [manualSpin, setManualSpin] = useState(0);
  const [capacitorActive, setCapacitorActive] = useState(false);
  const [highlightedPart, setHighlightedPart] = useState<string | null>(null);
  
  // Inspection states
  const [inspectShort, setInspectShort] = useState('none'); 
  const [inspectSlip, setInspectSlip] = useState('none');   
  const [statorHover, setStatorHover] = useState(false);
  const [statorClicked, setStatorClicked] = useState(false);
  const [rotorOverlay, setRotorOverlay] = useState(false);
  const [extResist, setExtResist] = useState(50);
  const [qrEnlarged, setQrEnlarged] = useState(false);
  
  // Test states
  const [testActive, setTestActive] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  const questionsPool = useMemo(() => [
    { q: "Co je základem funkce asynchronního motoru?", a: ["Stejnosměrné pole", "Točivé magnetické pole", "Statické elektrické pole"], c: 1, e: "Točivé magnetické pole statoru indukuje proudy v rotoru, což vytváří sílu." },
    { q: "Jak se nazývá pevná část motoru?", a: ["Rotor", "Komutátor", "Stator"], c: 2, e: "Stator je nepohyblivá část stroje, ve které je uloženo vinutí." },
    { q: "Jak se nazývá otáčivá část motoru?", a: ["Rotor", "Stator", "Kotva"], c: 0, e: "Rotor (nebo kotva) je část, která se otáčí uvnitř statoru." },
    { q: "Co je to skluz?", a: ["Rozdíl mezi synchronními a reálnými otáčkami", "Ztráta napětí na vinutí", "Mechanické tření v ložiskách"], c: 0, e: "Skluz vyjadřuje, o kolik se rotor opožďuje za točivým polem statoru." },
    { q: "Může asynchronní motor běžet přesně synchronními otáčkami bez zátěže?", a: ["Ano, vždy", "Ne, moment by byl nulový", "Pouze u speciálních motorů"], c: 1, e: "Při synchronních otáčkách by se v rotoru neindukoval žádný proud a moment by byl nulový." },
    { q: "Jaký je typický skluz běžného motoru při jmenovitém zatížení?", a: ["0 %", "2-5 %", "20-30 %"], c: 1, e: "Běžné asynchronní motory mají velmi malý skluz, obvykle v řádu jednotek procent." },
    { q: "Co se stane se skluzem při zvýšení zátěže?", a: ["Zvýší se", "Sníží se", "Zůstane stejný"], c: 0, e: "Větší zátěž vyžaduje větší moment, což motor zajistí zvýšením skluzu (zpomalením)." },
    { q: "Jak se vypočítají synchronní otáčky?", a: ["ns = 60 * f / p", "ns = f * p / 60", "ns = 60 / (f * p)"], c: 0, e: "Vztah ns = 60 * f / p je základní vzorec pro výpočet otáček magnetického pole." },
    { q: "Kolik pólů má motor s ns=3000 ot/min při 50Hz?", a: ["2 póly (1 pár)", "4 póly (2 páry)", "6 pólů (3 páry)"], c: 0, e: "Dosazením do vzorce: p = 60 * 50 / 3000 = 1 (pár pólů), tedy 2 póly." },
    { q: "K čemu slouží zapojení Y/D?", a: ["Zvýšení otáček", "Omezení záběrného proudu", "Změna směru otáčení"], c: 1, e: "Při rozběhu v Y je napětí na fázích nižší, což omezuje proudové nárazy v síti." },
    { q: "O kolik klesne záběrný proud při zapojení do Y oproti D?", a: ["Na 1/2", "Na 1/3", "Na 1/10"], c: 1, e: "Proud i moment v zapojení do hvězdy klesají na 1/3 hodnot v trojúhelníku." },
    { q: "Jaký je hlavní rozdíl mezi rotorem nakrátko a kroužkovým?", a: ["Kroužkový má vyvedené vinutí", "Nakrátko je větší", "Kroužkový nemá plechy"], c: 0, e: "Kroužkový motor má vinutí vyvedené na sběrací kroužky pro připojení reostatu." },
    { q: "K čemu se používá reostat u kroužkového motoru?", a: ["Regulace osvětlení", "Regulace rozběhu a momentu", "Měření napětí"], c: 1, e: "Zvýšením odporu rotorového obvodu lze zvýšit záběrný moment a omezit proud." },
    { q: "Co je to moment zvratu?", a: ["Minimální moment", "Maximální moment, který motor vyvine", "Moment při zastavení"], c: 1, e: "Je to nejvyšší bod momentové charakteristiky, za kterým motor ztrácí stabilitu." },
    { q: "Co se stane, když zátěž překročí moment zvratu?", a: ["Motor se zrychlí", "Motor se zastaví / vypadne", "Nic se nestane"], c: 1, e: "Motor již nedokáže vyvinout dostatečný protimoment a dojde k jeho zastavení." },
    { q: "Jak se změní směr otáčení motoru?", a: ["Prohozením dvou fází", "Změnou napětí", "Otočením zástrčky"], c: 0, e: "Změnou sledu fází se změní směr otáčení točivého magnetického pole." },
    { q: "Jakou frekvenci má proud v rotoru při synchronních otáčkách?", a: ["50 Hz", "0 Hz", "100 Hz"], c: 1, e: "Při n=ns je skluz s=0, tedy relativní pohyb pole vůči rotoru je nulový." },
    { q: "Co je to 'klec' u rotoru nakrátko?", a: ["Ochranný kryt", "Soustava vodivých tyčí spojených prstenci", "Ložiskový domek"], c: 1, e: "Tyče jsou na obou koncích spojeny nakrátko prstenci, což připomíná klec pro veverky." },
    { q: "Proč se plechy statoru izolují?", a: ["Kvůli chlazení", "Omezení vířivých proudů", "Snížení hmotnosti"], c: 1, e: "Izolace přerušuje cestu vířivým proudům, které by jinak způsobovaly velké ztráty a teplo." },
    { q: "Jaký kondenzátor se používá u jednofázových motorů?", a: ["Rozběhový nebo běhový", "Elektrolytický", "Keramický"], c: 0, e: "Kondenzátor vytváří fázový posuv potřebný pro vznik točivého pole z jedné fáze." },
    { q: "Jaký je fázový posuv u třífázové sítě?", a: ["90 stupňů", "120 stupňů", "180 stupňů"], c: 1, e: "Tři fáze jsou v čase posunuty o třetinu periody, tedy o 120 stupňů." },
    { q: "Co vytváří točivé pole v jednofázovém motoru?", a: ["Hlavní fáze", "Pomocná fáze s kondenzátorem", "Mechanický impuls"], c: 1, e: "Hlavní a pomocná fáze (s kondenzátorem) společně vytvoří eliptické točivé pole." },
    { q: "Jaká je účinnost velkých asynchronních motorů?", a: ["cca 50 %", "cca 85-95 %", "přes 99 %"], c: 1, e: "Asynchronní motory jsou velmi efektivní stroje, zejména ve vyšších výkonových třídách." },
    { q: "Co je to 'skluz zvratu'?", a: ["Skluz při rozběhu", "Skluz, při kterém motor dosahuje max. momentu", "Skluz při volnoběhu"], c: 1, e: "Je to hodnota skluzu, při které motor vyvíjí svůj maximální (zvratný) moment." },
    { q: "Může asynchronní motor pracovat jako generátor?", a: ["Ano, při n > ns", "Ne, nikdy", "Pouze se stejnosměrným buzením"], c: 0, e: "Pokud je motor poháněn nad synchronní otáčky, začne dodávat energii do sítě." },
    { q: "Co je to 'kompenzace' u motoru?", a: ["Zlepšení účiníku cos phi", "Vyvážení rotoru", "Snížení hluku"], c: 0, e: "Motory jsou induktivní zátěž, kompenzace pomocí kondenzátorů vrací účiník k 1." },
    { q: "Jaký je standardní kmitočet v EU?", a: ["60 Hz", "50 Hz", "16.7 Hz"], c: 1, e: "V evropské rozvodné síti je standardem frekvence 50 Hz." },
    { q: "Jak se značí svorky začátků vinutí?", a: ["U1, V1, W1", "A, B, C", "X, Y, Z"], c: 0, e: "Dle normy se začátky fází značí písmeny U1, V1, W1." },
    { q: "Jak se značí svorky konců vinutí?", a: ["U2, V2, W2", "1, 2, 3", "K, L, M"], c: 0, e: "Konce fází na svorkovnici jsou značeny U2, V2, W2." },
    { q: "Co je to 'vzduchová mezera'?", a: ["Větrací otvor", "Prostor mezi statorem a rotorem", "Mezera v ložisku"], c: 1, e: "Mezera musí být co nejmenší, aby magnetický odpor obvodu byl co nejnižší." }
  ], []);

  const startTest = () => {
    const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
    setCurrentQuestions(shuffled.slice(0, 8));
    setUserAnswers({});
    setTestSubmitted(false);
    setTestActive(true);
  };
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Synchronous speed (ns) = (60 * f) / p
  const ns = (60 * frequency) / poles;
  
  // Real speed (n) calculation with slip
  const slipBase = 0.02;
  const slipLoad = (load / 100) * 0.15; 
  const currentSlip = slipBase + slipLoad;
  const nRealRaw = ns * (1 - currentSlip);
  const nReal = Math.round(nRealRaw);

  const s_zv = 0.15; // Skluz zvratu
  const M_max = 2.5; // Poměrný moment zvratu
  const currentTorque = currentSlip > 0 ? (2 * M_max) / (currentSlip / s_zv + s_zv / currentSlip) : 0;

  const torqueData = useMemo(() => {
    const points = [];
    
    for (let i = 0; i <= 100; i++) {
      const s = 1 - (i / 100);
      // Klossův vztah
      let M = 0;
      if (s > 0) {
        M = (2 * M_max) / (s / s_zv + s_zv / s);
      }
      points.push({
        n: Math.round(i * (ns / 100)),
        torque: parseFloat(M.toFixed(2)),
        speed: i
      });
    }
    return points;
  }, [ns]);

  // Animation Loop
  useEffect(() => {
    let animationFrame: number;
    const animate = () => {
      const isRunning = ydStage !== 'OFF' || activeTab === 'control' || activeTab === 'field';
      const isRunningSingle = activeTab === 'single' && capacitorActive;
      
      const stepField = (ns / 600); 
      const stepRotor = (isRunning || isRunningSingle) ? (nRealRaw / 600) : 0;

      setRotationField(prev => (prev + stepField) % 360);
      setRotationRotor(prev => (prev + stepRotor) % 360);
      
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [ns, nReal, ydStage, activeTab, capacitorActive]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleYdChange = (stage: string) => {
    setYdStage(stage);
  };

  const isMotorActive = ydStage !== 'OFF' || activeTab === 'control' || activeTab === 'field';

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex-shrink-0 shadow-sm overflow-y-auto">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-lg shadow-blue-200 shadow-lg">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Elektro-Lektor<br/>
            <span className="text-blue-600 text-sm font-semibold tracking-wide">Asynchronní stroje</span>
          </h1>
        </div>
        
        <nav className="space-y-1">
          <SidebarItem id="principle" label="Princip a Konstrukce" icon={Info} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="interaction" label="Fyzikální Interakce" icon={Activity} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="field" label="Točivé Pole" icon={RotateCw} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="rotors" label="Typy Rotorů" icon={Layers} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="starting" label="Spouštění (Y/D)" icon={Play} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="control" label="Řízení Otáček" icon={Gauge} activeTab={activeTab} onClick={setActiveTab} />
          <SidebarItem id="single" label="Jednofázový Motor" icon={Activity} activeTab={activeTab} onClick={setActiveTab} />
          <div className="my-4 border-t border-gray-100"></div>
          <SidebarItem id="test" label="Závěrečný Test" icon={ClipboardCheck} activeTab={activeTab} onClick={setActiveTab} />
        </nav>

        <div className="mt-12 p-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-xl">
          <p className="text-[10px] text-blue-400 font-black uppercase mb-3 tracking-widest text-center">Status panel</p>
          <div className="space-y-3">
             <div className="flex justify-between items-center text-[11px] font-bold text-white border-b border-slate-800 pb-1">
                <span className="opacity-50 font-normal">Otáčky hřídele:</span>
                <span className="text-blue-400 font-mono">{isMotorActive || (activeTab === 'single' && capacitorActive) ? nReal : '0'} min⁻¹</span>
             </div>
             <div className="flex justify-between items-center text-[11px] font-bold text-white">
                <span className="opacity-50 font-normal">Režim:</span>
                <span className={`flex items-center gap-1 ${isMotorActive ? 'text-green-400' : 'text-red-400'}`}>
                   {isMotorActive ? <Activity size={10} className="animate-pulse" /> : <Power size={10} />}
                   {isMotorActive ? 'BĚH' : 'STOP'}
                </span>
             </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sdílet se studenty</p>
          <button 
            onClick={() => setQrEnlarged(true)}
            className="p-2 bg-white rounded-xl border border-gray-50 shadow-inner hover:scale-105 transition-transform cursor-zoom-in group relative"
          >
            <QRCodeSVG 
              value="https://ais-pre-fqpcjp2xowoozkw3bjt4ki-285356984179.europe-west2.run.app" 
              size={100}
              level="M"
              includeMargin={false}
            />
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 flex items-center justify-center transition-colors rounded-xl">
              <MousePointer2 size={16} className="text-blue-600 opacity-0 group-hover:opacity-100" />
            </div>
          </button>
          <p className="text-[8px] text-slate-400 mt-2 font-medium text-center leading-tight">Klikněte pro zvětšení<br/>pro dataprojektor</p>
        </div>
      </div>

      {/* QR Code Enlarged Modal */}
      <AnimatePresence>
        {qrEnlarged && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrEnlarged(false)}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col items-center max-w-2xl w-full"
            >
              <div className="w-full flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Interaktivní lekce</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asynchronní stroje</p>
                  </div>
                </div>
                <button 
                  onClick={() => setQrEnlarged(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Power size={20} className="rotate-45" />
                </button>
              </div>

              <div className="p-8 bg-white rounded-[32px] border-8 border-slate-50 shadow-inner mb-8">
                <QRCodeSVG 
                  value="https://ais-pre-fqpcjp2xowoozkw3bjt4ki-285356984179.europe-west2.run.app" 
                  size={320}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center space-y-2">
                <p className="text-2xl font-black text-slate-800">Naskenujte QR kód</p>
                <p className="text-slate-500 font-medium">Studenti se mohou připojit k interaktivnímu modelu přímo ze svých zařízení.</p>
              </div>

              <div className="mt-10 w-full py-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Připraveno pro dataprojektor</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth bg-slate-50/50">
        <div className="max-w-4xl mx-auto">
          
          {/* 1. PRINCIP A ČÁSTI */}
          {activeTab === 'principle' && (
            <div className="space-y-6">
              <SectionTitle title="Základy a části stroje" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center text-blue-700">
                    <Box className="mr-2" size={20} /> Hlavní komponenty
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onMouseEnter={() => setHighlightedPart('stator')}
                      onMouseLeave={() => setHighlightedPart(null)}
                      className={`w-full text-left p-4 rounded-xl border-l-4 transition-all ${highlightedPart === 'stator' ? 'bg-blue-50 border-blue-600 translate-x-2' : 'border-blue-300 bg-gray-50'}`}
                    >
                      <p className="font-bold text-gray-800 text-sm italic uppercase tracking-tighter">Stator</p>
                      <p className="text-xs text-gray-500 mt-1">Pevná část s plechovým paketem a drážkovým vinutím.</p>
                    </button>
                    <button 
                      onMouseEnter={() => setHighlightedPart('rotor')}
                      onMouseLeave={() => setHighlightedPart(null)}
                      className={`w-full text-left p-4 rounded-xl border-l-4 transition-all ${highlightedPart === 'rotor' ? 'bg-orange-50 border-orange-600 translate-x-2' : 'border-orange-300 bg-gray-50'}`}
                    >
                      <p className="font-bold text-gray-800 text-sm italic uppercase tracking-tighter">Rotor</p>
                      <p className="text-xs text-gray-500 mt-1">Otáčivá část, ve které se pohybem magnetického pole indukují proudy. Interakce těchto proudů s polem vytváří sílu, která generuje točivý moment a roztáčí hřídel stroje.</p>
                    </button>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                   {/* Background Magnetic Field Lines */}
                   <div className="absolute inset-0 pointer-events-none opacity-10">
                      <svg width="100%" height="100%" viewBox="0 0 200 200">
                        <defs>
                          <radialGradient id="fieldGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        {[1, 2, 3, 4].map(i => (
                          <motion.circle
                            key={i}
                            cx="100" cy="100" r={40 + i * 20}
                            fill="none"
                            stroke="url(#fieldGrad)"
                            strokeWidth="1"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0.1, 0.3, 0.1]
                            }}
                            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                          />
                        ))}
                      </svg>
                   </div>

                   <div 
                     onMouseEnter={() => setHighlightedPart('stator')}
                     onMouseLeave={() => setHighlightedPart(null)}
                     onClick={() => setStatorClicked(!statorClicked)}
                     className={`relative w-40 h-40 rounded-full border-8 transition-all duration-500 cursor-pointer ${highlightedPart === 'stator' || statorClicked ? 'border-blue-500 scale-105 shadow-xl shadow-blue-100' : 'border-gray-200'}`}
                   >
                      {/* Pulsing effect when clicked */}
                      {(statorClicked || highlightedPart === 'stator') && (
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -inset-4 rounded-full border-4 border-blue-400 pointer-events-none"
                        />
                      )}
                      <div 
                        onMouseEnter={(e) => { e.stopPropagation(); setHighlightedPart('rotor'); }}
                        onMouseLeave={() => setHighlightedPart(null)}
                        className={`absolute inset-4 rounded-full border-8 transition-all duration-500 cursor-help ${highlightedPart === 'rotor' ? 'border-orange-500 scale-110 shadow-xl shadow-orange-100' : 'border-gray-300'}`}
                        style={{
                          filter: load > 70 ? `drop-shadow(0 0 ${load/10}px #ef4444)` : 'none',
                          backgroundColor: load > 80 ? `rgba(239, 68, 68, ${(load-80)/100})` : 'transparent'
                        }}
                      >
                        {load > 70 && (
                          <motion.div 
                            animate={{ opacity: [0.2, 0.5, 0.2] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-red-500/20 blur-md"
                          />
                        )}
                      </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center text-blue-700">
                    <Layers className="mr-2" size={20} /> Vinutí stroje
                  </h3>
                  <div className="space-y-4">
                    <div 
                      onMouseEnter={() => setStatorHover(true)}
                      onMouseLeave={() => setStatorHover(false)}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer ${statorHover ? 'bg-blue-50 border-blue-600 translate-x-1 shadow-sm' : 'bg-gray-50 border-blue-300'}`}
                    >
                      <p className="font-bold text-blue-800 text-sm italic uppercase tracking-tighter">Statorové vinutí</p>
                      <p className="text-xs text-slate-600 mt-1">Třífázové vinutí uložené v drážkách statoru. Je napájeno ze sítě a vytváří točivé magnetické pole, které je základem funkce stroje.</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl border-l-4 border-orange-600">
                      <p className="font-bold text-orange-800 text-sm italic uppercase tracking-tighter">Rotorové vinutí</p>
                      <p className="text-xs text-slate-600 mt-1">U motorů nakrátko je tvořeno klecí (vodivé tyče spojené prstenci). U kroužkových motorů jde o klasické vinutí vyvedené na sběrací kroužky.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center overflow-hidden relative group">
                   <svg viewBox="0 0 200 120" className="w-full max-w-[280px] cursor-help">
                      <defs>
                        <filter id="heatBlur">
                          <feGaussianBlur in="SourceGraphic" stdDeviation={load > 70 ? (load - 70) / 10 : 0} />
                        </filter>
                      </defs>

                      {/* Magnetic Field Lines around Stator */}
                      <g opacity={statorHover ? 0.4 : 0.1}>
                        {[1, 2, 3].map(i => (
                          <motion.ellipse
                            key={i}
                            cx="100" cy="45"
                            rx={40 + i * 15} ry={20 + i * 8}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                            animate={{ 
                              scale: [1, 1.05, 1],
                              opacity: [0.2, 0.6, 0.2]
                            }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              delay: i * 0.3 
                            }}
                          />
                        ))}
                      </g>

                      {/* Stator Coils visualization */}
                      <g 
                        onMouseEnter={() => setStatorHover(true)} 
                        onMouseLeave={() => setStatorHover(false)}
                        className="transition-all duration-300"
                      >
                        <motion.path 
                          d="M 20 40 Q 50 10 80 40 T 140 40 T 180 40" 
                          fill="none" 
                          stroke={statorHover ? "#2563eb" : "#3b82f6"} 
                          strokeWidth={statorHover ? "5" : "3"} 
                          strokeDasharray="4 2" 
                          animate={{ 
                            strokeWidth: statorHover ? 5 : 3,
                            strokeDashoffset: [0, -20]
                          }}
                          transition={{ 
                            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
                          }}
                        />
                        <motion.path 
                          d="M 20 50 Q 50 20 80 50 T 140 50 T 180 50" 
                          fill="none" 
                          stroke={statorHover ? "#2563eb" : "#3b82f6"} 
                          strokeWidth={statorHover ? "5" : "3"} 
                          animate={{ 
                            strokeWidth: statorHover ? 5 : 3,
                            strokeDashoffset: [0, 20]
                          }}
                          transition={{ 
                            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" }
                          }}
                        />
                        <text x="100" y="25" textAnchor="middle" className={`text-[10px] font-black transition-all duration-300 uppercase tracking-tighter ${statorHover ? 'fill-blue-700 scale-110' : 'fill-blue-600'}`}>Statorové cívky</text>
                        
                        {statorHover && (
                          <motion.circle 
                            initial={{ r: 0, opacity: 0 }}
                            animate={{ r: 40, opacity: 0.1 }}
                            cx="100" cy="45" fill="#3b82f6"
                          />
                        )}
                      </g>
                      
                      {/* Rotor Cage visualization */}
                      <g filter="url(#heatBlur)" style={{ filter: load > 70 ? 'url(#heatBlur)' : 'none' }}>
                        <rect x="40" y="70" width="120" height="30" rx="4" fill={load > 80 ? "#fee2e2" : "#ffedd5"} stroke={load > 80 ? "#ef4444" : "#f97316"} strokeWidth="2" className="transition-colors duration-500" />
                        {[50, 70, 90, 110, 130, 150].map(x => (
                          <line key={x} x1={x} y1="70" x2={x} y2="100" stroke={load > 80 ? "#dc2626" : "#ea580c"} strokeWidth="2" className="transition-colors duration-500" />
                        ))}
                        <line x1="40" y1="75" x2="160" y2="75" stroke={load > 80 ? "#dc2626" : "#ea580c"} strokeWidth="3" className="transition-colors duration-500" />
                        <line x1="40" y1="95" x2="160" y2="95" stroke={load > 80 ? "#dc2626" : "#ea580c"} strokeWidth="3" className="transition-colors duration-500" />
                      </g>
                      
                      <text x="100" y="115" textAnchor="middle" className={`text-[10px] font-bold transition-all duration-500 uppercase tracking-tighter ${load > 80 ? 'fill-red-600' : 'fill-orange-600'}`}>Rotorová klec</text>
                   </svg>

                   <AnimatePresence>
                     {statorHover && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.95 }}
                         className="absolute top-4 right-4 left-4 bg-slate-900/95 text-white p-4 rounded-xl shadow-2xl border border-blue-500/30 backdrop-blur-sm z-50"
                       >
                         <div className="flex items-start gap-3">
                           <div className="bg-blue-600 p-1.5 rounded-lg shrink-0">
                             <Zap size={14} className="text-white" />
                           </div>
                           <div>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Detail vinutí</p>
                             <ul className="text-[11px] space-y-1 text-slate-300">
                               <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> 3-fázové symetrické vinutí</li>
                               <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> Materiál: Elektrovodná měď (Cu)</li>
                               <li className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full"></div> Izolace třídy F (do 155°C)</li>
                             </ul>
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* 1b. FYZIKÁLNÍ INTERAKCE */}
          {activeTab === 'interaction' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle title="Interakce pole a rotoru" />
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                  <div className="relative w-full lg:w-[450px] aspect-square bg-slate-50 rounded-3xl border-2 border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                      {/* Stator Outer */}
                      <circle cx="200" cy="200" r="180" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                      
                      {/* Stator Winding Labels */}
                      <g className="opacity-40">
                        {[0, 60, 120, 180, 240, 300].map(angle => (
                          <circle key={angle} cx={200 + 180 * Math.cos(angle * Math.PI / 180)} cy={200 + 180 * Math.sin(angle * Math.PI / 180)} r="8" fill="#3b82f6" />
                        ))}
                      </g>

                      {/* Rotating Magnetic Field (Flux) */}
                      <g style={{ transform: `rotate(${rotationField}deg)`, transformOrigin: '200px 200px' }}>
                        <defs>
                          <linearGradient id="fluxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
                          </linearGradient>
                        </defs>
                        <ellipse cx="200" cy="200" rx="40" ry="170" fill="url(#fluxGrad)" />
                        <path d="M 200 30 L 200 10 M 190 20 L 200 10 L 210 20" fill="none" stroke="#ef4444" strokeWidth="3" />
                        <text x="200" y="25" textAnchor="middle" className="text-[12px] font-black fill-red-600">N</text>
                        <text x="200" y="385" textAnchor="middle" className="text-[12px] font-black fill-blue-600">S</text>
                      </g>

                      {/* Rotor Body */}
                      <g 
                        onClick={() => setRotorOverlay(!rotorOverlay)}
                        className="cursor-pointer group/rotor"
                        style={{ 
                          transform: `rotate(${rotationRotor + (load / 100) * (Math.sin(Date.now() / 20) * 1.5)}deg)`, 
                          transformOrigin: '200px 200px',
                          willChange: 'transform'
                        }}
                      >
                        {/* Heat Glow for high load */}
                        {load > 70 && (
                          <motion.circle 
                            cx="200" cy="200" r="115" 
                            fill="none" 
                            stroke="#ef4444" 
                            strokeWidth="10" 
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{ filter: 'blur(15px)' }}
                          />
                        )}
                        <circle cx="200" cy="200" r="110" fill="#f8fafc" stroke={load > 80 ? '#ef4444' : (rotorOverlay ? '#f97316' : '#cbd5e1')} strokeWidth={rotorOverlay ? "6" : "4"} className="transition-all duration-300" />
                        
                        {/* Rotor Bars & Force Vectors */}
                        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                          const rad = angle * Math.PI / 180;
                          const x = 200 + 110 * Math.cos(rad);
                          const y = 200 + 110 * Math.sin(rad);
                          
                          // Calculate relative position to magnetic field to show force
                          const fieldAngle = (rotationField % 360);
                          const relAngle = (angle + rotationRotor - fieldAngle + 360) % 360;
                          const hasForce = (relAngle > 0 && relAngle < 180) || (relAngle > 180 && relAngle < 360);
                          
                          // Force magnitude based on load and position in field
                          const forceMag = hasForce ? (30 + (load / 4)) * Math.abs(Math.sin(relAngle * Math.PI / 180)) : 0;
                          
                          return (
                            <g key={angle} className="cursor-help">
                              <title>{`Indukovaný proud (I): ${relAngle < 180 ? 'Od nás' : 'K nám'}`}</title>
                              {/* Rotor Bar */}
                              <circle cx={x} cy={y} r="8" fill={load > 80 ? '#ef4444' : '#f97316'} stroke="#ea580c" strokeWidth="2" className="transition-colors duration-300" />
                              {/* Induced Current Symbol (+ or .) */}
                              <text x={x} y={y + 3} textAnchor="middle" className="text-[8px] font-bold fill-white pointer-events-none">
                                {relAngle < 180 ? '×' : '•'}
                              </text>
                              {/* Small 'I' indicator next to the symbol */}
                              <text x={x + 10} y={y - 5} className="text-[6px] font-black fill-orange-600 pointer-events-none">I</text>
                              {/* Force Vector (Lorentz Force) */}
                              {hasForce && (
                                <motion.line 
                                  x1={x} y1={y} 
                                  x2={x + forceMag * Math.cos(rad + Math.PI/2)} 
                                  y2={y + forceMag * Math.sin(rad + Math.PI/2)} 
                                  stroke={load > 80 ? '#dc2626' : '#22c55e'} 
                                  strokeWidth={load > 80 ? "4" : "3"} 
                                  strokeDasharray={load > 50 ? "none" : "4 2"}
                                  animate={load > 80 ? { strokeWidth: [4, 6, 4] } : {}}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                />
                              )}
                            </g>
                          );
                        })}
                      </g>

                      {/* Center Shaft */}
                      <circle cx="200" cy="200" r="20" fill="#1e293b" />

                      {/* Callouts & Leader Lines */}
                      <g className="pointer-events-none">
                        {/* Stator Winding Callout */}
                        <path d="M 340 60 L 300 100" stroke="#3b82f6" strokeWidth="1" fill="none" />
                        <circle cx="300" cy="100" r="3" fill="#3b82f6" />
                        <text x="345" y="60" className="text-[10px] font-bold fill-blue-600 uppercase tracking-tighter">Statorové vinutí</text>

                        {/* Rotor Cage Callout */}
                        <path d="M 60 340 L 120 280" stroke="#ea580c" strokeWidth="1" fill="none" />
                        <circle cx="120" cy="280" r="3" fill="#ea580c" />
                        <text x="55" y="355" textAnchor="middle" className="text-[10px] font-bold fill-orange-600 uppercase tracking-tighter">Rotorová klec</text>

                        {/* Winding Rings Callout */}
                        <path d="M 200 380 L 200 310" stroke="#f97316" strokeWidth="1" fill="none" />
                        <circle cx="200" cy="310" r="3" fill="#f97316" />
                        <text x="200" y="395" textAnchor="middle" className="text-[10px] font-bold fill-orange-500 uppercase tracking-tighter">Zkratovací prstence</text>

                        {/* Shaft Callout */}
                        <path d="M 60 60 L 185 185" stroke="#475569" strokeWidth="1" fill="none" />
                        <circle cx="185" cy="185" r="3" fill="#475569" />
                        <text x="55" y="55" textAnchor="middle" className="text-[10px] font-bold fill-slate-600 uppercase tracking-tighter">Hřídel stroje</text>

                        {/* Air Gap Callout */}
                        <path d="M 340 340 L 290 290" stroke="#94a3b8" strokeWidth="1" fill="none" />
                        <circle cx="290" cy="290" r="3" fill="#94a3b8" />
                        <text x="345" y="350" className="text-[10px] font-bold fill-slate-400 uppercase tracking-tighter">Vzduchová mezera</text>
                      </g>

                      {/* Rotor Interaction Overlay */}
                      <AnimatePresence>
                        {rotorOverlay && (
                          <motion.g
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="pointer-events-none"
                          >
                            <foreignObject x="120" y="140" width="160" height="120">
                              <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl border-2 border-orange-500 shadow-2xl text-center">
                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-2">Stav rotoru</p>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center bg-orange-50 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-bold text-orange-800">Zátěž:</span>
                                    <span className="text-[11px] font-black text-orange-600">{load}%</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded-lg">
                                    <span className="text-[10px] font-bold text-blue-800">Skluz:</span>
                                    <span className="text-[11px] font-black text-blue-600">{(currentSlip * 100).toFixed(1)}%</span>
                                  </div>
                                </div>
                                <p className="text-[8px] mt-2 text-slate-400 font-bold uppercase tracking-tighter">Kliknutím zavřít</p>
                              </div>
                            </foreignObject>
                          </motion.g>
                        )}
                      </AnimatePresence>
                    </svg>

                    {/* Overlay Labels (Simplified) */}
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wider text-red-600 pointer-events-none">
                      Magnetický tok (Φ)
                    </div>
                    <div className="absolute top-1/4 right-4 bg-white/90 p-2 rounded-lg border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wider text-green-600 pointer-events-none">
                      Lorentzova síla (F)
                    </div>

                    {/* Current Direction Legend */}
                    <div className="absolute bottom-4 right-4 bg-white/95 p-3 rounded-xl border border-slate-200 shadow-lg text-[10px] pointer-events-none space-y-2">
                      <p className="font-black uppercase tracking-widest text-slate-400 mb-1 border-b pb-1">Směr proudu</p>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">×</div>
                        <span className="font-bold text-slate-600">Od nás (do stránky)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs leading-none">•</div>
                        <span className="font-bold text-slate-600">K nám (ze stránky)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-3">Zatížení (Brzda): {load}%</label>
                      <input type="range" min="0" max="100" value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full accent-orange-600 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer" />
                      <p className="text-[9px] text-gray-400 mt-2 italic">Zvyšte zatížení pro vizualizaci "úsilí" (vibrace a delší vektory síly).</p>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                      <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                        <Info size={18} /> Jak to funguje?
                      </h4>
                      <ol className="space-y-4 text-sm text-slate-600">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                          <p><strong>Točivé pole:</strong> Střídavý proud ve statoru vytváří magnetické pole, které rotuje synchronní rychlostí.</p>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                          <p><strong>Indukce:</strong> Siločáry pole protínají rotorové tyče a indukují v nich napětí a proud (Faradayův zákon).</p>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                          <p><strong>Síla:</strong> Interakce indukovaného proudu s magnetickým polem vytváří mechanickou sílu (Lorentzova síla).</p>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                          <p><strong>Pohyb:</strong> Tato síla vytváří točivý moment, který roztočí rotor ve směru pole.</p>
                        </li>
                      </ol>
                    </div>

                    <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                        <Layers size={14} /> Konstrukce rotoru
                      </h4>
                      <ul className="space-y-2 text-xs text-orange-700">
                        <li><strong>Rotorová klec:</strong> Soustava vodivých tyčí (hliník/měď) vložených do drážek rotorových plechů.</li>
                        <li><strong>Zkratovací prstence:</strong> Vodivě spojují všechny tyče na obou koncích, čímž uzavírají elektrický obvod pro indukované proudy.</li>
                      </ul>
                    </div>

                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">Důležitý poznatek:</p>
                      <p className="text-sm text-orange-700 italic">
                        "Rotor se nikdy nemůže točit přesně stejnou rychlostí jako pole. Pokud by se tak stalo, pole by neprotínalo tyče, neindukoval by se proud a moment by zanikl. Tento rozdíl nazýváme <strong>skluz</strong>."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TOČIVÉ POLE */}
          {activeTab === 'field' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle title="Točivé pole a synchronní otáčky" />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Interactive Field Visualization */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <div className="relative w-72 h-72 bg-slate-50 rounded-full border-8 border-slate-100 flex items-center justify-center shadow-inner overflow-hidden">
                    {/* Stator Slots (Visual) */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                      <div 
                        key={angle} 
                        className="absolute w-4 h-8 bg-slate-200 rounded-sm"
                        style={{ 
                          transform: `rotate(${angle}deg) translateY(-130px)`,
                          transformOrigin: 'center'
                        }}
                      />
                    ))}

                    {/* Rotating Magnetic Vector */}
                    <motion.div 
                      style={{ rotate: rotationField }} 
                      className="relative w-2 h-48 z-20"
                    >
                      <div className="absolute top-0 -left-2 w-6 h-24 bg-gradient-to-b from-red-600 to-red-400 rounded-t-full shadow-lg flex items-start justify-center pt-2">
                        <span className="text-[10px] font-black text-white">N</span>
                      </div>
                      <div className="absolute bottom-0 -left-2 w-6 h-24 bg-gradient-to-t from-blue-600 to-blue-400 rounded-b-full shadow-lg flex items-end justify-center pb-2">
                        <span className="text-[10px] font-black text-white">S</span>
                      </div>
                      {/* Magnetic Flux Lines (Animated) */}
                      <motion.div 
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-48 border-2 border-blue-400/30 rounded-full"
                      />
                    </motion.div>

                    {/* Vector Components (Phase Vectors) */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100">
                      {/* Phase A */}
                      <line x1="50" y1="50" 
                        x2={50 + 30 * Math.sin(rotationField * Math.PI / 180) * Math.cos(0)} 
                        y2={50 + 30 * Math.sin(rotationField * Math.PI / 180) * Math.sin(0)} 
                        stroke="#ef4444" strokeWidth="2" />
                      {/* Phase B */}
                      <line x1="50" y1="50" 
                        x2={50 + 30 * Math.sin((rotationField - 120) * Math.PI / 180) * Math.cos(120 * Math.PI / 180)} 
                        y2={50 + 30 * Math.sin((rotationField - 120) * Math.PI / 180) * Math.sin(120 * Math.PI / 180)} 
                        stroke="#22c55e" strokeWidth="2" />
                      {/* Phase C */}
                      <line x1="50" y1="50" 
                        x2={50 + 30 * Math.sin((rotationField - 240) * Math.PI / 180) * Math.cos(240 * Math.PI / 180)} 
                        y2={50 + 30 * Math.sin((rotationField - 240) * Math.PI / 180) * Math.sin(240 * Math.PI / 180)} 
                        stroke="#3b82f6" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                    <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Fáze L1</p>
                      <p className="text-xs font-bold text-slate-700">{(Math.sin(rotationField * Math.PI / 180) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Fáze L2</p>
                      <p className="text-xs font-bold text-slate-700">{(Math.sin((rotationField - 120) * Math.PI / 180) * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Fáze L3</p>
                      <p className="text-xs font-bold text-slate-700">{(Math.sin((rotationField - 240) * Math.PI / 180) * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                {/* Right: Controls and 3-Phase Chart */}
                <div className="space-y-6">
                  <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl border-b-8 border-blue-600">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] opacity-60 font-black uppercase tracking-widest text-blue-200">Synchronní otáčky</p>
                        <p className="text-5xl font-mono text-blue-400 tracking-tighter">{Math.round(ns)} <span className="text-sm opacity-50 uppercase">ot/min</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] opacity-60 font-black uppercase tracking-widest text-blue-200">Počet pólpárů</p>
                        <p className="text-2xl font-bold text-white">p = {poles}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6 mt-8">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Frekvence sítě (f)</label>
                          <span className="text-xs font-bold text-white">{frequency} Hz</span>
                        </div>
                        <input type="range" min="1" max="120" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer" />
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Počet pólpárů (p)</label>
                          <span className="text-xs font-bold text-white">{poles}</span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map(p => (
                            <button 
                              key={p}
                              onClick={() => setPoles(p)}
                              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${poles === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                            >
                              p={p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3-Phase Sine Wave Chart */}
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-[220px]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Průběh 3-fázových proudů</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={Array.from({ length: 100 }, (_, i) => {
                        const angle = (i / 100) * 360;
                        return {
                          x: i,
                          L1: Math.sin(angle * Math.PI / 180),
                          L2: Math.sin((angle - 120) * Math.PI / 180),
                          L3: Math.sin((angle - 240) * Math.PI / 180),
                        };
                      })}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis hide />
                        <YAxis hide domain={[-1.2, 1.2]} />
                        <Line type="monotone" dataKey="L1" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="L2" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="L3" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <ReferenceLine x={(rotationField % 360) / 3.6} stroke="#1e293b" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Info size={14} /> Jak vzniká točivé pole?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Točivé magnetické pole vzniká v asynchronním stroji díky <strong>prostorovému a časovému posunu</strong>. 
                  Tři cívky statoru jsou v prostoru posunuty o 120° a jsou napájeny trojfázovým proudem, jehož fáze jsou rovněž časově posunuty o 120°. 
                  Součtem těchto tří střídavých magnetických polí vzniká výsledný magnetický vektor o <strong>konstantní velikosti</strong>, který se otáčí synchronní rychlostí.
                </p>
              </div>
            </div>
          )}

          {/* 3. TYPY ROTORŮ */}
          {activeTab === 'rotors' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle title="Konstrukční provedení rotoru" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Squirrel Cage Rotor */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-orange-500 flex flex-col items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Nejčastější</div>
                  </div>
                  
                  <h3 className="font-black text-2xl text-slate-800 mb-2 uppercase tracking-tight">Kotva nakrátko</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Squirrel Cage Rotor</p>
                  
                  <div className="relative w-full aspect-video bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden mb-8 shadow-inner group">
                    <motion.svg 
                      width="240" height="180" viewBox="0 0 240 180"
                      animate={{ rotateY: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    >
                       {/* Rear Ring */}
                       <ellipse cx="120" cy="40" rx="80" ry="20" fill="none" stroke={inspectShort === 'rings' ? '#ea580c' : '#f97316'} strokeWidth={inspectShort === 'rings' ? '12' : '6'} className="transition-all duration-500" />
                       
                       {/* Induced Current Animation in Rear Ring */}
                       <motion.ellipse
                         cx="120" cy="40" rx="80" ry="20"
                         fill="none"
                         stroke={inspectShort === 'rings' ? "#fff" : "#f97316"}
                         strokeWidth="3"
                         strokeDasharray="8 12"
                         animate={{ strokeDashoffset: [0, 20] }}
                         transition={{ duration: inspectShort === 'rings' ? 1 : 3, repeat: Infinity, ease: "linear" }}
                         opacity={inspectShort === 'rings' ? 1 : 0.4}
                       />

                       {/* Bars */}
                       {[40, 60, 80, 100, 120, 140, 160, 180, 200].map((x, i) => (
                         <g key={i}>
                           <motion.line 
                             x1={x} y1="45" x2={x} y2="135" 
                             stroke={inspectShort === 'bars' ? '#dc2626' : '#fdb77d'} 
                             strokeWidth={inspectShort === 'bars' ? '10' : '4'} 
                             className="transition-all duration-500"
                             initial={{ pathLength: 0 }}
                             animate={{ pathLength: 1 }}
                             transition={{ delay: i * 0.1 }}
                           />
                           {/* Induced Current Animation in Bars - Always visible but intensifies on hover/inspect */}
                           <motion.circle
                             r={inspectShort === 'bars' ? "3.5" : "2"}
                             fill={inspectShort === 'bars' ? "#fff" : "#f97316"}
                             animate={{ 
                               cy: [45, 135],
                               opacity: inspectShort === 'bars' ? [0, 1, 0] : [0, 0.5, 0]
                             }}
                             transition={{ 
                               duration: inspectShort === 'bars' ? 1 : 2.5, 
                               repeat: Infinity, 
                               delay: i * 0.3,
                               ease: "linear"
                             }}
                             cx={x}
                           />
                           {/* Secondary particle for more flow effect when inspected */}
                           {inspectShort === 'bars' && (
                             <motion.circle
                               r="2"
                               fill="#fff"
                               animate={{ 
                                 cy: [45, 135],
                                 opacity: [0, 0.8, 0]
                               }}
                               transition={{ 
                                 duration: 1, 
                                 repeat: Infinity, 
                                 delay: i * 0.3 + 0.5,
                                 ease: "linear"
                               }}
                               cx={x}
                             />
                           )}
                         </g>
                       ))}
                       
                       {/* Front Ring */}
                       <ellipse cx="120" cy="140" rx="80" ry="20" fill="none" stroke={inspectShort === 'rings' ? '#ea580c' : '#f97316'} strokeWidth={inspectShort === 'rings' ? '12' : '6'} className="transition-all duration-500" />
                       
                       {/* Induced Current Animation in Front Ring */}
                       <motion.ellipse
                         cx="120" cy="140" rx="80" ry="20"
                         fill="none"
                         stroke={inspectShort === 'rings' ? "#fff" : "#f97316"}
                         strokeWidth="3"
                         strokeDasharray="8 12"
                         animate={{ strokeDashoffset: [0, -20] }}
                         transition={{ duration: inspectShort === 'rings' ? 1 : 3, repeat: Infinity, ease: "linear" }}
                         opacity={inspectShort === 'rings' ? 1 : 0.4}
                       />
                       
                       {/* Shaft visualization */}
                       <rect x="110" y="20" width="20" height="140" fill="#cbd5e1" opacity="0.3" rx="10" />
                    </motion.svg>
                    
                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/5 transition-colors duration-500 pointer-events-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mb-8">
                    <button onClick={() => setInspectShort(inspectShort === 'bars' ? 'none' : 'bars')} className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${inspectShort === 'bars' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>PROZKOUMAT TYČE</button>
                    <button onClick={() => setInspectShort(inspectShort === 'rings' ? 'none' : 'rings')} className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${inspectShort === 'rings' ? 'bg-orange-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>PROZKOUMAT PRSTENCE</button>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="bg-orange-500 p-2 rounded-lg shrink-0 shadow-lg shadow-orange-200">
                        <Zap size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase mb-1">Bezúdržbový provoz</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Nemá žádné sběrací kroužky ani kartáče, což z něj činí nejspolehlivější typ rotoru.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Slip Ring Rotor */}
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl shadow-xl border-b-8 border-blue-500 flex flex-col items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-blue-100 text-blue-700 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Speciální</div>
                  </div>

                  <h3 className="font-black text-2xl text-slate-800 mb-2 uppercase tracking-tight">Kotva kroužková</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-8">Slip Ring Rotor</p>
                  
                  <div className="relative w-full aspect-video bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center overflow-hidden mb-8 shadow-inner group">
                    <motion.svg 
                      width="240" height="180" viewBox="0 0 240 180"
                      animate={{ rotateY: [0, -10, 0, 10, 0] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    >
                       {/* Rotor Body with Winding */}
                       <rect x="70" y="30" width="100" height="80" rx="8" fill={inspectSlip === 'winding' ? '#3b82f6' : '#dbeafe'} stroke="#1e40af" strokeWidth="3" className="transition-all duration-500" />
                       {inspectSlip === 'winding' && (
                         <g>
                           {/* Internal Winding Detail */}
                           <motion.path 
                             d="M 80 40 L 160 40 M 80 55 L 160 55 M 80 70 L 160 70 M 80 85 L 160 85 M 80 100 L 160 100" 
                             stroke="#1e3a8a" strokeWidth="2" strokeDasharray="5 3"
                             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                           />
                           {/* Connections from winding to rings */}
                           {[
                             "M 90 110 L 90 135 L 108 135",
                             "M 120 110 L 120 150 L 108 150",
                             "M 150 110 L 150 165 L 108 165"
                           ].map((d, i) => (
                             <motion.path
                               key={i}
                               d={d}
                               fill="none"
                               stroke="#3b82f6"
                               strokeWidth="2"
                               strokeDasharray="4 4"
                               initial={{ pathLength: 0, opacity: 0 }}
                               animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -20] }}
                               transition={{ 
                                 pathLength: { duration: 0.8, delay: i * 0.2 },
                                 opacity: { duration: 0.3 },
                                 strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" }
                               }}
                             />
                           ))}
                           {/* Current flow through brushes to rheostat */}
                           {[135, 150, 165].map((y, i) => (
                             <motion.path
                               key={`brush-${i}`}
                               d={`M 134 ${y} L 180 ${y} L 180 120`}
                               fill="none"
                               stroke="#60a5fa"
                               strokeWidth="1.5"
                               strokeDasharray="3 3"
                               animate={{ strokeDashoffset: [0, -20] }}
                               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                             />
                           ))}
                         </g>
                       )}

                       {/* Slip Rings & Brushes Assembly */}
                       <g transform="translate(120, 135)">
                          {[0, 15, 30].map((y, i) => (
                            <g key={i}>
                              <circle cx="0" cy={y} r="12" fill="none" stroke={inspectSlip === 'brushes' ? '#1d4ed8' : '#94a3b8'} strokeWidth={inspectSlip === 'brushes' ? '8' : '4'} className="transition-all duration-500" />
                              <motion.rect 
                                x="14" y={y-5} width="15" height="10" 
                                fill={inspectSlip === 'brushes' ? '#0f172a' : '#475569'} 
                                className="transition-all duration-500"
                                animate={inspectSlip === 'brushes' ? { x: [14, 12, 14] } : {}}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                              />
                            </g>
                          ))}
                       </g>
                       
                       {/* Connection lines to rings are now animated in the winding detail section */}

                       {/* External Rheostat Visualization */}
                       <g transform="translate(180, 120)">
                          <rect x="0" y="0" width="40" height="40" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
                          <path d="M 5 35 L 35 5" stroke="#ef4444" strokeWidth="2" />
                          <motion.circle 
                            cx={5 + (extResist / 100) * 30} 
                            cy={35 - (extResist / 100) * 30} 
                            r="4" 
                            fill="#ef4444" 
                          />
                          <text x="20" y="55" textAnchor="middle" className="text-[8px] font-bold fill-slate-400">R_ext</text>
                          
                          {/* Current flow to Rheostat */}
                          <motion.path 
                            d="M -31 25 L 0 25" 
                            stroke="#3b82f6" 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                            animate={{ strokeDashoffset: [0, -20] }}
                            transition={{ duration: 0.5 + (extResist / 100) * 2, repeat: Infinity, ease: "linear" }}
                          />
                       </g>
                    </motion.svg>
                  </div>

                  <div className="w-full px-4 mb-6 space-y-4">
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex justify-between mb-3">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                          <Gauge size={14} /> Reostat (R_ext)
                        </label>
                        <span className="text-xs font-bold text-blue-800 bg-white px-2 py-0.5 rounded-full shadow-sm">{extResist} Ω</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={extResist} 
                        onChange={(e) => setExtResist(Number(e.target.value))} 
                        className="w-full accent-blue-600 h-2 bg-blue-200 rounded-full appearance-none cursor-pointer mb-4" 
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/60 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Záběrový moment</p>
                          <p className="text-sm font-black text-blue-600">{(0.6 + (extResist / 100) * 1.4).toFixed(1)} M_n</p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-lg text-center">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Záběrový proud</p>
                          <p className="text-sm font-black text-orange-600">{(7 - (extResist / 100) * 4).toFixed(1)} I_n</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 italic text-center">Zvyšováním odporu v rotoru zvyšujeme záběrový moment a zároveň omezujeme proudové špičky při rozběhu.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mb-8">
                    <button onClick={() => setInspectSlip(inspectSlip === 'winding' ? 'none' : 'winding')} className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${inspectSlip === 'winding' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>PROZKOUMAT VINUTÍ</button>
                    <button onClick={() => setInspectSlip(inspectSlip === 'brushes' ? 'none' : 'brushes')} className={`py-3 rounded-xl text-[10px] font-black tracking-widest transition-all ${inspectSlip === 'brushes' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>PROZKOUMAT KROUŽKY</button>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="bg-blue-500 p-2 rounded-lg shrink-0 shadow-lg shadow-blue-200">
                        <Activity size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase mb-1">Regulace parametrů</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">Umožňuje připojení spouštěcího odporu pro omezení záběrného proudu a zvýšení momentu.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Comparison Table */}
              <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl text-white">
                <h4 className="text-center text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-blue-400">Srovnání konstrukcí</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Vlastnost</p>
                    <p className="text-xs font-bold border-b border-slate-800 pb-2">Cena</p>
                    <p className="text-xs font-bold border-b border-slate-800 pb-2">Údržba</p>
                    <p className="text-xs font-bold border-b border-slate-800 pb-2">Záběr</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Nakrátko</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Nízká</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Nulová</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Tvrdý</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Kroužková</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Vysoká</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Nutná</p>
                    <p className="text-xs text-slate-300 border-b border-slate-800 pb-2">Řízený</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SPOUŠTĚNÍ (Y/D) */}
          {activeTab === 'starting' && (
            <div className="space-y-6">
              <SectionTitle title="Zapojení svorkovnice Y/D" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl relative overflow-hidden border-4 border-slate-800">
                  {/* Internal Winding Visualization (Interactive) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
                    <defs>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    
                    {/* Winding 1: U1 - U2 */}
                    <motion.path 
                      d="M 75 220 L 150 80" 
                      stroke={ydStage !== 'OFF' ? "#3b82f6" : "#334155"} 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray="8 4"
                      animate={ydStage !== 'OFF' ? { strokeDashoffset: [0, -24], opacity: 1 } : { opacity: 0.3 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={ydStage !== 'OFF' ? { filter: 'url(#glow)' } : {}}
                    />
                    
                    {/* Winding 2: V1 - V2 */}
                    <motion.path 
                      d="M 150 220 L 225 80" 
                      stroke={ydStage !== 'OFF' ? "#ef4444" : "#334155"} 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray="8 4"
                      animate={ydStage !== 'OFF' ? { strokeDashoffset: [0, -24], opacity: 1 } : { opacity: 0.3 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={ydStage !== 'OFF' ? { filter: 'url(#glow)' } : {}}
                    />
                    
                    {/* Winding 3: W1 - W2 */}
                    <motion.path 
                      d="M 225 220 L 75 80" 
                      stroke={ydStage !== 'OFF' ? "#10b981" : "#334155"} 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray="8 4"
                      animate={ydStage !== 'OFF' ? { strokeDashoffset: [0, -24], opacity: 1 } : { opacity: 0.3 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={ydStage !== 'OFF' ? { filter: 'url(#glow)' } : {}}
                    />

                    {/* Labels for windings */}
                    <text x="110" y="160" fill="#3b82f6" fontSize="8" fontWeight="bold" opacity={ydStage !== 'OFF' ? 1 : 0.3}>U1-U2</text>
                    <text x="185" y="160" fill="#ef4444" fontSize="8" fontWeight="bold" opacity={ydStage !== 'OFF' ? 1 : 0.3}>V1-V2</text>
                    <text x="145" y="140" fill="#10b981" fontSize="8" fontWeight="bold" opacity={ydStage !== 'OFF' ? 1 : 0.3} transform="rotate(-60, 145, 140)">W1-W2</text>
                  </svg>

                  <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12 text-center">Industrial Terminal Block</h4>
                  
                  <div className="grid grid-cols-3 gap-y-16 gap-x-10 max-w-[240px] mx-auto relative">
                    {/* Top Row: W2, U2, V2 */}
                    {['W2', 'U2', 'V2'].map((label) => (
                      <div key={label} className="relative flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-inner relative z-20">
                          <div className="w-5 h-5 rounded-full bg-yellow-600 border-2 border-yellow-500 shadow-lg"></div>
                          <div className="absolute inset-0 rounded-full border border-white/5"></div>
                        </div>
                        <span className="text-[11px] font-black text-slate-500 mt-3 tracking-tighter">{label}</span>
                      </div>
                    ))}

                    {/* Jumpers (Propojky) */}
                    <AnimatePresence mode="wait">
                      {ydStage === 'Y' && (
                        <motion.div 
                          key="y-jumper"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          className="absolute top-5 left-6 right-6 h-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_25px_rgba(234,179,8,0.6)] z-30 border border-yellow-300/30"
                        />
                      )}
                      {ydStage === 'D' && (
                        <div key="d-jumpers" className="absolute top-5 bottom-5 left-0 right-0 z-30 flex justify-between px-5 pointer-events-none">
                          {[0, 1, 2].map(i => (
                            <motion.div 
                              key={`d-jumper-${i}`}
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="w-3 h-full bg-gradient-to-b from-yellow-500 via-yellow-400 to-yellow-500 rounded-full shadow-[0_0_25px_rgba(234,179,8,0.6)] border border-yellow-300/30"
                            />
                          ))}
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Row: U1, V1, W1 */}
                    {['U1', 'V1', 'W1'].map((label) => (
                      <div key={label} className="relative flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-inner relative z-20">
                          <div className="w-5 h-5 rounded-full bg-yellow-600 border-2 border-yellow-500 shadow-lg"></div>
                          <div className="absolute inset-0 rounded-full border border-white/5"></div>
                        </div>
                        <span className="text-[11px] font-black text-slate-500 mt-3 tracking-tighter">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-12 flex justify-center">
                    <div className={`px-4 py-1 rounded-full text-[9px] font-black tracking-widest border ${
                      ydStage === 'Y' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' :
                      ydStage === 'D' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
                      'bg-slate-700/50 border-slate-600 text-slate-500'
                    }`}>
                      {ydStage === 'OFF' ? 'ODPOJENO' : ydStage === 'Y' ? 'ZAPOJENO DO HVĚZDY (Y)' : 'ZAPOJENO DO TROJÚHELNÍKU (Δ)'}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                   <div>
                     <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-4">Schéma zapojení</h4>
                     <div className="flex justify-center mb-8">
                       <svg width="200" height="120" viewBox="0 0 200 120">
                         {/* Star (Y) Diagram */}
                         <g opacity={ydStage === 'Y' ? 1 : 0.2} className="transition-opacity duration-500">
                           <path d="M 50 20 L 50 60 L 20 90 M 50 60 L 80 90" stroke="#3b82f6" strokeWidth="3" fill="none" />
                           <circle cx="50" cy="60" r="4" fill="#3b82f6" />
                           <text x="50" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">HVĚZDA (Y)</text>
                         </g>
                         {/* Delta (D) Diagram */}
                         <g opacity={ydStage === 'D' ? 1 : 0.2} className="transition-opacity duration-500" transform="translate(100, 0)">
                           <path d="M 50 20 L 20 80 L 80 80 Z" stroke="#10b981" strokeWidth="3" fill="none" />
                           <text x="50" y="110" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#10b981">TROJÚHELNÍK (Δ)</text>
                         </g>
                       </svg>
                     </div>
                     <h4 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-4">Postup spuštění</h4>
                   </div>
                   <div className="flex flex-col gap-3">
                      <button onClick={() => handleYdChange('Y')} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ydStage === 'Y' ? 'bg-yellow-500 text-white shadow-xl' : 'bg-gray-100'}`}>1. START (Y)</button>
                      <button onClick={() => ydStage === 'Y' ? handleYdChange('D') : alert("Špatně! Nejdříve v Y.")} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${ydStage === 'D' ? 'bg-green-600 text-white shadow-xl' : 'bg-gray-100'}`}>2. PŘEPNOUT (Δ)</button>
                      <button onClick={() => handleYdChange('OFF')} className="py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase">STOP</button>
                   </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Info size={14} /> Proč používáme rozběh Y/D?
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Metoda <strong>hvězda-trojúhelník (Y/D)</strong> se používá k omezení vysokého záběrového proudu, který u velkých motorů může dosahovat 6–8 násobku jmenovitého proudu. 
                  Zapojení do hvězdy (Y) sníží fázové napětí na 230V (z 400V), čímž klesne rozběhový proud i moment na <strong>cca 1/3</strong>. 
                  Po rozběhu se motor přepne do trojúhelníku (D) pro dosažení plného jmenovitého výkonu.
                </p>
              </div>
            </div>
          )}

          {/* 5. ŘÍZENÍ OTÁČEK */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              <SectionTitle title="Simulace řízení otáček a skluzu" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-10">Pole (ns) vs. Rotor (n)</h4>
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <div 
                      style={{ transform: `rotate(${rotationField}deg)`, willChange: 'transform' }} 
                      className="absolute w-full h-full border-4 border-dashed border-blue-400 rounded-full opacity-50"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-blue-600 rounded-full"></div>
                    </div>
                    <div 
                      style={{ transform: `rotate(${rotationRotor}deg)`, willChange: 'transform' }} 
                      className="absolute w-44 h-44 border-[10px] border-orange-500 rounded-full shadow-2xl shadow-orange-200"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 bg-orange-700 rounded-full"></div>
                    </div>
                    <div className="text-center z-10 bg-white/80 p-4 rounded-full shadow-lg border">
                      <p className="text-4xl font-black text-gray-900 leading-none">{nReal}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">ot/min</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Mechanická vizualizace</h4>
                  <div className="relative flex items-center justify-center bg-slate-50 rounded-full p-10 shadow-inner">
                    <div 
                      style={{ transform: `rotate(${rotationRotor * 3}deg)`, willChange: 'transform' }} 
                      className="text-slate-300"
                    >
                      <Wind size={150} strokeWidth={1} />
                    </div>
                    <div className="absolute w-8 h-8 bg-slate-800 rounded-full border-4 border-slate-400 shadow-lg"></div>
                  </div>
                  <div className="w-full space-y-4 mt-8">
                    <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                       <span>Zatížení (Brzda)</span>
                       <span className={load > 85 ? 'text-red-600' : 'text-blue-600'}>{load}%</span>
                    </div>
                    <input type="range" min="0" max="100" step="1" value={load} onChange={(e) => setLoad(Number(e.target.value))} className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-orange-600 shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-2xl text-white">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 flex-1 w-full">
                       <h4 className="font-bold flex items-center gap-2 text-blue-400 uppercase tracking-widest text-sm"><Cpu size={20} /> Frekvenční měnič</h4>
                       <input type="range" min="5" max="120" step="1" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="w-full h-4 bg-indigo-950 rounded-full appearance-none cursor-pointer accent-blue-500 border border-indigo-800" />
                    </div>
                    <div className="p-8 bg-indigo-950/50 rounded-2xl border border-indigo-800 text-center min-w-[200px]">
                       <p className="text-[10px] uppercase text-indigo-400 mb-2 font-bold tracking-widest">Frekvence FM</p>
                       <p className="text-5xl font-black">{frequency}<span className="text-xl ml-1">Hz</span></p>
                    </div>
                    <div className="p-8 bg-indigo-950/50 rounded-2xl border border-indigo-800 text-center min-w-[200px]">
                       <p className="text-[10px] uppercase text-indigo-400 mb-2 font-bold tracking-widest">Moment stroje (M)</p>
                       <p className="text-5xl font-black text-blue-400">{currentTorque.toFixed(2)}<span className="text-xl ml-1">M_n</span></p>
                    </div>
                 </div>
              </div>

              {/* Momentová charakteristika */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <TrendingUp size={18} className="text-blue-600" /> Momentová charakteristika M = f(n)
                  </h4>
                  <div className="flex gap-4 text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-500">Moment (M)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-500">Pracovní bod</span>
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={torqueData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTorque" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="n" 
                        type="number" 
                        domain={[0, Math.round(ns)]} 
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        label={{ value: 'Otáčky n [ot/min]', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        label={{ value: 'Moment M [p.u.]', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#60a5fa' }}
                        formatter={(value) => [`${value} M_n`, 'Moment']}
                        labelFormatter={(label) => `${label} ot/min`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="torque" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTorque)" 
                        isAnimationActive={false}
                      />
                      {/* Synchronní otáčky */}
                      <ReferenceLine 
                        x={ns} 
                        stroke="#94a3b8" 
                        strokeDasharray="3 3" 
                        label={{ value: 'ns', position: 'insideTopRight', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      {/* Moment zvratu (M_max) Marker */}
                      <ReferenceLine 
                        x={ns * (1 - s_zv)} 
                        stroke="#ef4444" 
                        strokeDasharray="3 3" 
                        strokeOpacity={0.6}
                        label={{ value: 'M_max', position: 'insideTopLeft', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <ReferenceDot 
                        x={ns * (1 - s_zv)} 
                        y={M_max} 
                        r={5} 
                        fill="#ef4444" 
                        stroke="#fff" 
                        strokeWidth={2}
                        label={{ value: 'Moment zvratu', position: 'top', fill: '#ef4444', fontSize: 9, fontWeight: 'bold' }}
                      />
                      {/* Vertikální linka pro nReal */}
                      <ReferenceLine 
                        x={nReal} 
                        stroke="#f97316" 
                        strokeOpacity={0.5}
                        strokeDasharray="3 3" 
                      />
                      {/* Pracovní bod */}
                      <ReferenceDot 
                        x={nReal} 
                        y={currentTorque} 
                        r={6} 
                        fill="#f97316" 
                        stroke="#fff" 
                        strokeWidth={2}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Skluz vizualizace pod grafem */}
                <div className="mt-8 px-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skluz (s)</p>
                        <p className="text-2xl font-black text-orange-600">{(currentSlip * 100).toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Relativní rozdíl otáček</p>
                        <p className="text-sm font-bold text-slate-600">Δn = {Math.round(ns - nReal)} ot/min</p>
                      </div>
                    </div>

                    <div className="relative h-12 flex items-center">
                      {/* Background Scale */}
                      <div className="absolute inset-0 bg-slate-200/50 rounded-xl"></div>
                      
                      {/* Rotor Speed Bar */}
                      <motion.div 
                        initial={false}
                        animate={{ width: `${(nReal / ns) * 100}%` }}
                        className="absolute left-0 h-full bg-blue-500 rounded-l-xl flex items-center justify-end pr-4 shadow-lg shadow-blue-100"
                      >
                        <span className="text-[10px] font-black text-white uppercase whitespace-nowrap">Rotor (n)</span>
                      </motion.div>

                      {/* Slip Area */}
                      <motion.div 
                        initial={false}
                        animate={{ 
                          left: `${(nReal / ns) * 100}%`,
                          width: `${(currentSlip * 100)}%` 
                        }}
                        className="absolute h-full bg-orange-500/30 border-x-2 border-orange-500 flex items-center justify-center overflow-hidden"
                      >
                        <motion.div 
                          animate={{ x: [-10, 10, -10] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[9px] font-black text-orange-700 uppercase"
                        >
                          Skluz
                        </motion.div>
                      </motion.div>

                      {/* Markers */}
                      <div className="absolute left-0 -top-6 text-[9px] font-bold text-slate-400">0</div>
                      <div className="absolute right-0 -top-6 text-[9px] font-bold text-blue-600">ns = {Math.round(ns)}</div>
                      <motion.div 
                        initial={false}
                        animate={{ left: `${(nReal / ns) * 100}%` }}
                        className="absolute -bottom-6 -translate-x-1/2 flex flex-col items-center"
                      >
                        <div className="w-0.5 h-4 bg-orange-600"></div>
                        <span className="text-[9px] font-black text-orange-600">n = {nReal}</span>
                      </motion.div>
                    </div>
                    
                    <div className="mt-10 flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Info size={16} className="text-orange-600" />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        <strong>Skluz</strong> je nezbytný pro vznik krouticího momentu. Kdyby rotor dosáhl synchronních otáček (n = ns), magnetické siločáry by jej neprotínaly, neindukoval by se žádný proud a moment by klesl na nulu.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Moment zvratu</p>
                    <p className="text-xl font-black text-slate-700">2.5 <span className="text-xs font-normal">M_n</span></p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Záběrový moment</p>
                    <p className="text-xl font-black text-slate-700">0.6 <span className="text-xs font-normal">M_n</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. JEDNOFÁZOVÝ MOTOR */}
          {activeTab === 'single' && (
            <div className="space-y-6">
              <SectionTitle title="Jednofázový motor" />
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                 <div className="relative w-56 h-56 bg-slate-50 rounded-full border-8 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner mb-8">
                    <div 
                      style={{ 
                        transform: capacitorActive ? 'none' : `rotate(${manualSpin}deg)`,
                        transition: capacitorActive ? 'none' : 'transform 2s cubic-bezier(0, 0, 0.2, 1)',
                        willChange: 'transform'
                      }} 
                      className={`w-2 h-48 bg-slate-900 rounded-full ${capacitorActive ? 'animate-spin' : ''}`}
                    ></div>
                    <div className="absolute font-black text-slate-100 text-[120px] select-none italic tracking-tighter opacity-80">1~</div>
                 </div>
                 <button onClick={() => setCapacitorActive(!capacitorActive)} className={`w-full max-w-sm p-6 rounded-2xl border-4 font-black text-sm tracking-widest transition-all ${capacitorActive ? 'bg-green-600 border-green-500 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                   {capacitorActive ? '✓ KONDENZÁTOR PŘIPOJEN' : '❌ KONDENZÁTOR ODPOJEN'}
                 </button>
                 {!capacitorActive && (
                   <button onClick={() => setManualSpin(prev => prev + 1800)} className="w-full max-w-sm mt-4 py-5 rounded-2xl font-black text-xs uppercase bg-orange-500 text-white shadow-xl active:scale-95">Roztočit "rukou"</button>
                 )}
              </div>
            </div>
          )}

          {/* 7. TEST */}
          {activeTab === 'test' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SectionTitle title="Ověření znalostí" />
              
              {!testActive ? (
                <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardCheck className="text-blue-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">Připraveni na test?</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Test obsahuje <strong>8 náhodně vybraných otázek</strong> z celkového počtu 30. 
                    Prověřte své znalosti o konstrukci, principu a řízení asynchronních strojů.
                  </p>
                  <button 
                    onClick={startTest}
                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                  >
                    Spustit test
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {currentQuestions.map((q, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-all ${testSubmitted ? (userAnswers[idx] === q.c ? 'border-green-500 bg-green-50/30' : 'border-red-200 bg-red-50/30') : 'border-gray-100'}`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 mb-4">{q.q}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {q.a.map((opt: string, optIdx: number) => (
                              <button
                                key={optIdx}
                                disabled={testSubmitted}
                                onClick={() => setUserAnswers(prev => ({ ...prev, [idx]: optIdx }))}
                                className={`p-3 rounded-xl text-xs font-bold transition-all text-left border-2 ${
                                  userAnswers[idx] === optIdx 
                                    ? (testSubmitted ? (optIdx === q.c ? 'bg-green-600 border-green-600 text-white' : 'bg-red-600 border-red-600 text-white') : 'bg-blue-600 border-blue-600 text-white shadow-lg') 
                                    : (testSubmitted && optIdx === q.c ? 'bg-green-100 border-green-500 text-green-800' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200')
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                          {testSubmitted && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={`mt-4 p-3 rounded-xl text-[11px] font-medium flex items-start gap-2 ${userAnswers[idx] === q.c ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                            >
                              <Info size={14} className="shrink-0 mt-0.5" />
                              <p><strong>Vysvětlení:</strong> {q.e}</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="sticky bottom-6 flex justify-center">
                    {!testSubmitted ? (
                      <button 
                        onClick={() => setTestSubmitted(true)}
                        disabled={Object.keys(userAnswers).length < 8}
                        className={`px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${Object.keys(userAnswers).length < 8 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'}`}
                      >
                        Vyhodnotit test
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-blue-500 flex items-center gap-6 animate-bounce">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaše skóre</p>
                            <p className="text-3xl font-black text-blue-600">
                              {currentQuestions.filter((q, i) => userAnswers[i] === q.c).length} / 8
                            </p>
                          </div>
                          <button 
                            onClick={startTest}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                          >
                            Zkusit znovu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
