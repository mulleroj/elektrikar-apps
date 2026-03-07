import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  Trophy, 
  BookOpen, 
  Layout, 
  Share2, 
  CheckCircle2, 
  XCircle,
  Info,
  QrCode,
  Trash2,
  Wind,
  ShieldAlert,
  Clock,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { allQuestions, Question } from './quizData';

import { QRCodeSVG } from 'qrcode.react';

const DeviceVisualizer = ({ deviceId }: { deviceId: string }) => {
  if (deviceId === 'jistic') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-1 bg-slate-700 absolute"></div>
        <motion.div 
          animate={{ x: [0, 100, 150] }}
          transition={{ repeat: Infinity, duration: 2, times: [0, 0.6, 0.65] }}
          className="w-2 h-2 bg-yellow-400 rounded-full absolute left-0 shadow-[0_0_10px_#facc15]"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
          transition={{ repeat: Infinity, duration: 2, times: [0.6, 0.62, 0.65] }}
          className="absolute left-[150px] text-red-500 font-black text-xl"
        >
          ZKTRAT!
        </motion.div>
        <motion.div
          animate={{ rotate: [0, 0, -45] }}
          transition={{ repeat: Infinity, duration: 2, times: [0, 0.65, 0.7] }}
          className="w-10 h-1 bg-white absolute left-[140px] origin-left"
        />
      </div>
    );
  }

  if (deviceId === 'chranic') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-1 bg-slate-700 absolute"></div>
        <motion.div 
          animate={{ x: [0, 120, 120] }}
          transition={{ repeat: Infinity, duration: 2.5, times: [0, 0.5, 1] }}
          className="w-2 h-2 bg-yellow-400 rounded-full absolute left-0"
        />
        <div className="absolute left-[130px] top-1/2 flex flex-col items-center">
          <div className="w-1 h-8 bg-red-500/30"></div>
          <ShieldCheck className="w-4 h-4 text-red-500" />
        </div>
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, times: [0.45, 0.5, 0.55] }}
          className="absolute left-[110px] top-4 text-[8px] font-bold text-red-400"
        >
          ÚNIK PROUDU!
        </motion.div>
        <motion.div
          animate={{ y: [0, 0, -20], opacity: [1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, times: [0, 0.5, 0.6] }}
          className="w-8 h-1 bg-white absolute left-[100px]"
        />
      </div>
    );
  }

  if (deviceId === 'stykac') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <motion.div 
            animate={{ backgroundColor: ['#1e293b', '#3b82f6', '#1e293b'] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-6 h-6 rounded-md border border-blue-400 flex items-center justify-center text-[8px] text-blue-200"
          >
            A1
          </motion.div>
          <span className="text-[8px] text-slate-500">CÍVKA</span>
        </div>
        <div className="w-12 h-1 bg-slate-700 relative">
          <motion.div 
            animate={{ rotate: [0, -30, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="w-12 h-1 bg-white absolute origin-left"
          />
        </div>
        <motion.div 
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center border border-yellow-400/50"
        >
          <Zap className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  if (deviceId === 'motor_spoustec') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center gap-12">
        <div className="relative">
          <motion.div 
            animate={{ rotate: [0, 360, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear", times: [0, 0.7, 1] }}
            className="w-12 h-12 rounded-full border-4 border-dashed border-slate-600 flex items-center justify-center"
          >
            <Wind className="w-6 h-6 text-blue-400" />
          </motion.div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, times: [0.6, 0.7, 0.8] }}
            className="absolute inset-0 bg-red-500/40 rounded-full blur-md"
          />
        </div>
        <div className="w-1 h-12 bg-slate-700 relative">
          <motion.div 
            animate={{ x: [0, 0, 10], opacity: [1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, times: [0, 0.75, 0.85] }}
            className="w-1 h-12 bg-white absolute"
          />
        </div>
      </div>
    );
  }

  if (deviceId === 'spd') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-1 bg-slate-700 absolute top-1/2"></div>
        <div className="w-1 h-12 bg-slate-700 absolute top-1/2 left-1/2"></div>
        <motion.div 
          animate={{ y: [-50, 48], opacity: [0, 1, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, times: [0, 0.2, 0.5, 0.6] }}
          className="absolute top-0 left-1/2 -translate-x-1/2 text-yellow-400"
        >
          <Zap className="w-6 h-6 fill-yellow-400" />
        </motion.div>
        <motion.div 
          animate={{ y: [0, 40], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2, times: [0.4, 0.5, 0.7] }}
          className="w-2 h-2 bg-yellow-400 rounded-full absolute left-1/2 -translate-x-1/2 top-1/2"
        />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400 font-bold">ZEMĚ</div>
      </div>
    );
  }

  if (deviceId === 'casovac') {
    return (
      <div className="h-24 bg-slate-900 rounded-2xl relative flex items-center justify-center gap-8">
        <motion.div 
          animate={{ scale: [1, 0.9, 1], backgroundColor: ['#1e293b', '#3b82f6', '#1e293b'] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2] }}
          className="w-10 h-10 rounded-full border-2 border-slate-600 flex items-center justify-center cursor-pointer"
        >
          <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
        </motion.div>
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-slate-700" />
            <motion.circle 
              cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-blue-500"
              strokeDasharray="126"
              animate={{ strokeDashoffset: [0, 0, 126] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.2, 0.9] }}
            />
          </svg>
          <Clock className="w-4 h-4 text-slate-400 absolute" />
        </div>
        <motion.div 
          animate={{ opacity: [0.1, 0.1, 1, 0.1] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.15, 0.2, 0.9] }}
          className="w-8 h-8 text-yellow-400"
        >
          <Zap className="w-full h-full fill-yellow-400" />
        </motion.div>
      </div>
    );
  }

  return null;
};

// --- KONSTANTY A DATA ---
const devices = [
  { 
    id: 'jistic', 
    name: 'Jistič (MCB)', 
    icon: <Zap className="w-6 h-6 text-yellow-500" />, 
    description: 'Chrání vedení před nadproudem.', 
    rule: 'Jistič chrání dráty!', 
    category: 'protection',
    details: 'Jistič je samočinný vypínač, který chrání elektrický obvod před poškozením způsobeným nadproudem (přetížením nebo zkratem). Obsahuje tepelnou spoušť pro ochranu před mírným, ale dlouhodobým přetížením a elektromagnetickou spoušť pro okamžitou reakci na zkrat. Jakmile proud překročí bezpečnou mez, mechanismus rozpojí kontakty a přeruší tok elektřiny.',
    why: 'Bez jističe by při závadě nebo zapojení příliš mnoha spotřebičů došlo k extrémnímu zahřátí vodičů v instalaci, což je nejčastější příčina požárů v budovách. Chrání tedy majetek a infrastrukturu před tepelnou destrukcí a zamezuje roztavení izolace kabelů.'
  },
  { 
    id: 'chranic', 
    name: 'Proudový chránič (RCD)', 
    icon: <ShieldCheck className="w-6 h-6 text-green-500" />, 
    description: 'Chrání osoby před úrazem.', 
    rule: 'Chránič chrání lidi!', 
    category: 'safety',
    details: 'Neustále porovnává proud tekoucí fázovým vodičem tam a proud tekoucí nulovým vodičem zpět. Pokud vznikne rozdíl (tzv. reziduální proud), znamená to, že elektřina uniká jinudy – například přes tělo člověka do země. V takovém případě chránič odpojí obvod během zlomku sekundy (typicky do 30ms), čímž zabrání smrtelnému úrazu.',
    why: 'Je to nejdůležitější prvek pro ochranu lidského života. Zatímco jistič chrání dráty, chránič chrání lidi. Je povinný pro všechny zásuvkové obvody obsluhované laiky a v prostorách se zvýšeným rizikem, jako jsou koupelny, bazény nebo venkovní instalace.'
  },
  { 
    id: 'stykac', 
    name: 'Stykač', 
    icon: <Activity className="w-6 h-6 text-blue-500" />, 
    description: 'Spíná silové obvody.', 
    rule: 'Svaly instalace.', 
    category: 'switching',
    details: 'Jde o výkonové relé určené pro časté spínání velkých proudů. Pomocí malého prouv v ovládací cívce (např. z termostatu nebo časovače) mechanicky sepne silové kontakty. Na rozdíl od běžného vypínače je konstruován tak, aby zvládl tisíce sepnutí bez poškození kontaktů elektrickým obloukem.',
    why: 'Umožňuje automatizaci a dálkové ovládání výkonných strojů. Používá se tam, kde potřebujeme spínat velké výkony (bojlery, přímotopy, motory) pomocí slaboproudých signálů z řídicích systémů, které by samy o sobě takovou zátěž neunesly.'
  },
  { 
    id: 'motor_spoustec', 
    name: 'Motorový spouštěč', 
    icon: <Wind className="w-6 h-6 text-orange-500" />, 
    description: 'Chrání vinutí motoru.', 
    rule: 'Strážce motoru.', 
    category: 'protection',
    details: 'Kombinuje funkci jističe a citlivé tepelné ochrany motoru. Má nastavitelnou spoušť, kterou lze přesně doladit na jmenovitý proud konkrétního motoru. Reaguje velmi rychle na asymetrii fází, výpadek jedné z fází nebo mechanické přetížení hřídele, které by motor jinak spálilo.',
    why: 'Elektromotory jsou drahá zařízení náchylná k přehřátí při poruše napájení nebo mechanickému odporu. Spouštěč zabrání zničení vinutí motoru, což šetří vysoké náklady na opravy nebo výměnu celého stroje v průmyslových provozech.'
  },
  { 
    id: 'spd', 
    name: 'Přepěťová ochrana (SPD)', 
    icon: <ShieldAlert className="w-6 h-6 text-red-500" />, 
    description: 'Chrání před bleskem.', 
    rule: 'Štít proti přepětí.', 
    category: 'safety',
    details: 'Funguje jako bleskový bezpečnostní ventil. Za normálního stavu je nevodivá, ale při vzniku přepěťové špičky (úder blesku do vedení, spínací pochody v síti) se okamžitě stane vodivou a svede ničivou energii bezpečně do uzemnění, čímž omezí napětí v instalaci na bezpečnou úroveň.',
    why: 'Moderní domácnosti jsou plné citlivé elektroniky (PC, TV, chytré domácnosti), kterou může i vzdálený úder blesku nenávratně zničit. SPD je nezbytná investice do bezpečí drahého vybavení, které by standardní jističe nedokázaly ochránit.'
  },
  { 
    id: 'casovac', 
    name: 'Schodišťový automat', 
    icon: <Clock className="w-6 h-6 text-purple-500" />, 
    description: 'Časové spínání osvětlení.', 
    rule: 'Šetří energii.', 
    category: 'switching',
    details: 'Jedná se o časové relé, které po impulsu z tlačítka sepne osvětlení na předem nastavenou dobu a pak ho automaticky vypne. Často disponuje funkcí varovného probliknutí před vypnutím nebo možností trvalého svícení pro servisní účely.',
    why: 'Hlavním důvodem je úspora elektrické energie a pohodlí uživatelů. Zabraňuje zbytečnému svícení na chodbách, schodištích nebo v garážích, kde by světlo mohlo zůstat zapnuté celou noc jen kvůli zapomnětlivosti.'
  }
];

const allTasks = [
  { title: "Koupelna", description: "Zásuvka u umyvadla.", required: ['chranic', 'jistic'], hint: "Povinný chránič 30mA." },
  { title: "Dopravník", description: "Třífázový motor 5kW.", required: ['motor_spoustec', 'stykac'], hint: "Ochrana motoru + spínání." },
  { title: "Vstup vedení", description: "Ochrana proti bouřce.", required: ['spd', 'jistic'], hint: "SPD musí být hned na začátku." },
  { title: "Schodiště paneláku", description: "Osvětlení s časovačem.", required: ['casovac', 'jistic'], hint: "Automat vypne po čase." },
  { title: "Venkovní bazén", description: "Čerpadlo a osvětlení.", required: ['chranic', 'jistic'], hint: "Zvýšené riziko úrazu u vody." },
  { title: "Soustruh v dílně", description: "Ovládání motoru stroje.", required: ['motor_spoustec', 'stykac'], hint: "Ochrana vinutí je klíčová." },
  { title: "Serverovna", description: "Napájení citlivých dat.", required: ['spd', 'jistic'], hint: "Přepětí nesmí projít." },
  { title: "Garáž - Nabíjení", description: "Nabíječka pro elektromobil.", required: ['chranic', 'jistic'], hint: "Vždy chránič + jistič." },
  { title: "Ventilátor haly", description: "Odsávání průmyslové haly.", required: ['motor_spoustec', 'stykac'], hint: "Těžký rozběh ventilátoru." },
  { title: "Reklamní panel", description: "Noční osvětlení firmy.", required: ['casovac', 'stykac', 'jistic'], hint: "Časovač ovládá stykač." },
  { title: "Zahradní domek", description: "Zásuvky pro sekačku.", required: ['chranic', 'jistic'], hint: "Venkovní prostředí vyžaduje RCD." },
  { title: "Tepelné čerpadlo", description: "Kompresor čerpadla.", required: ['motor_spoustec', 'stykac'], hint: "Motorová ochrana." },
  { title: "Vysoušeč rukou", description: "Veřejné toalety.", required: ['chranic', 'jistic'], hint: "Voda + elektro = chránič." },
  { title: "Zabezpečovačka", description: "Ústředna alarmu.", required: ['spd', 'jistic'], hint: "Musí přežít bouřku." },
  { title: "Osvětlení zahrady", description: "Automatické vypnutí v noci.", required: ['casovac', 'jistic'], hint: "Použij schodišťový automat." },
  { title: "Kompresor v servisu", description: "Pohon pístového stroje.", required: ['motor_spoustec', 'stykac'], hint: "Ochrana proti přetížení." },
  { title: "Solární střídač", description: "AC výstup z FVE.", required: ['spd', 'jistic'], hint: "Ochrana proti atmosférickému výboji." },
  { title: "Saunová kamna", description: "Výkonné elektrické topení.", required: ['chranic', 'jistic', 'stykac'], hint: "Vlhko a vysoký výkon." },
  { title: "Výtahový motor", description: "Pohon kabiny výtahu.", required: ['motor_spoustec', 'stykac'], hint: "Zvýšené nároky na bezpečnost." },
  { title: "Písková filtrace", description: "Čištění vody v bazénu.", required: ['chranic', 'casovac', 'jistic'], hint: "Chránič a časové spínání." },
  { title: "Dílna - Zásuvky", description: "Pracovní stůl s nářadím.", required: ['chranic', 'jistic'], hint: "Povinné pro laickou obsluhu." },
  { title: "Vzduchotechnika", description: "Centrální jednotka budovy.", required: ['motor_spoustec', 'stykac'], hint: "Spínání dálkovým povelem." },
  { title: "Hlavní přívod", description: "Zabezpečení objektu.", required: ['spd'], hint: "Jen ochrana proti blesku." },
  { title: "Podlahové topení", description: "Topné rohože v chodbě.", required: ['chranic', 'jistic', 'stykac'], hint: "Bezpečnost a spínání termostatem." },
  { title: "Mrazící box", description: "Průmyslové chlazení.", required: ['stykac', 'jistic'], hint: "Potřebujeme spínat výkon." },
  { title: "Odtah kouře", description: "Požární ventilátor.", required: ['motor_spoustec', 'stykac'], hint: "Musí spolehlivě sepnout." },
  { title: "Domácí kino", description: "Drahá audio technika.", required: ['spd', 'jistic'], hint: "Zamez zničení elektronik." },
  { title: "Čerpadlo studny", description: "Zásobování vodou.", required: ['motor_spoustec', 'stykac'], hint: "Ochrana proti běhu nasucho (tepelně)." },
  { title: "Laboratoř", description: "Měřící přístroje.", required: ['spd', 'chranic', 'jistic'], hint: "Maximální stupeň ochrany." },
  { title: "Vjezdová brána", description: "Pohon s osvětlením.", required: ['chranic', 'jistic'], hint: "Zásuvka motoru brány." }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('theory');
  const [sessionTasks, setSessionTasks] = useState<any[]>([]);
  const [activeTaskIdx, setActiveTaskIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ questionId: number, selectedIdx: number, isCorrect: boolean }[]>([]);
  const [simState, setSimState] = useState<{ [key: string]: string | null }>({ slot1: null, slot2: null, slot3: null });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [selectedTheoryId, setSelectedTheoryId] = useState<string | null>('jistic');
  const [isEnergized, setIsEnergized] = useState(false);

  // --- LOGIKA VÝBĚRU ÚKOLŮ ---
  const initializeTasks = useCallback(() => {
    const shuffled = [...allTasks].sort(() => 0.5 - Math.random());
    setSessionTasks(shuffled.slice(0, 5));
    setActiveTaskIdx(0);
    setSimState({ slot1: null, slot2: null, slot3: null });
    setFeedback(null);
    setIsEnergized(false);
  }, [allTasks]);

  const startNewQuiz = useCallback(() => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 10));
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers([]);
  }, []);

  useEffect(() => {
    initializeTasks();
    startNewQuiz();
  }, [initializeTasks, startNewQuiz]);

  const handleAddComponent = (deviceId: string) => {
    let targetSlot: string | null = null;
    if (!simState.slot1) targetSlot = 'slot1';
    else if (!simState.slot2) targetSlot = 'slot2';
    else if (!simState.slot3) targetSlot = 'slot3';

    if (targetSlot) {
      setSimState(prev => ({ ...prev, [targetSlot as string]: deviceId }));
      setFeedback(null);
      setIsEnergized(false);
    } else {
      setFeedback({ type: 'warning', text: 'DIN lišta je plná. Klikni na prvek pro smazání.' });
    }
  };

  const removeComponent = (slot: string) => {
    setSimState(prev => ({ ...prev, [slot]: null }));
    setFeedback(null);
    setIsEnergized(false);
  };

  const validateSim = () => {
    if (sessionTasks.length === 0) return;
    const currentTask = sessionTasks[activeTaskIdx];
    const placedIds = Object.values(simState).filter(id => id !== null);
    
    const missing = currentTask.required.filter((reqId: string) => !placedIds.includes(reqId));

    if (missing.length === 0) {
      setFeedback({ type: 'success', text: `Výborně! Rozvaděč pro úkol "${currentTask.title}" je v pořádku.` });
      setIsEnergized(true);
    } else {
      setFeedback({ type: 'error', text: `Chybí ti: ${missing.map((m: string) => devices.find(d => d.id === m)?.name).join(', ')}.` });
      setIsEnergized(false);
    }
  };

  const changeTask = (dir: number) => {
    const next = activeTaskIdx + dir;
    if (next >= 0 && next < sessionTasks.length) {
      setActiveTaskIdx(next);
      setSimState({ slot1: null, slot2: null, slot3: null });
      setFeedback(null);
      setIsEnergized(false);
    }
  };

  // --- OSTATNÍ LOGIKA ---
  const handleQuizAnswer = (idx: number) => {
    const currentQ = quizQuestions[currentQuestion];
    const isCorrect = idx === currentQ.correct;
    
    if (isCorrect) setScore(score + 1);
    
    setUserAnswers(prev => [...prev, { 
      questionId: currentQ.id, 
      selectedIdx: idx, 
      isCorrect 
    }]);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <header className="bg-slate-900 text-white p-6 shadow-xl border-b-4 border-blue-600">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 fill-yellow-400 text-yellow-400" />
            <div>
              <h1 className="text-2xl font-black">VoltMaster NN <span className="text-blue-500">2.5</span></h1>
              <p className="text-slate-400 text-xs">Dynamický generátor úkolů</p>
            </div>
          </div>
          <button 
            onClick={initializeTasks}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> NOVÁ SADA ÚKOLŮ
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-around">
          {[
            { id: 'theory', icon: <BookOpen className="w-5 h-5" />, label: 'Teorie' },
            { id: 'sim', icon: <Layout className="w-5 h-5" />, label: 'Trenažér' },
            { id: 'quiz', icon: <Trophy className="w-5 h-5" />, label: 'Test' },
            { id: 'share', icon: <Share2 className="w-5 h-5" />, label: 'Sdílet' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 font-bold' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === 'theory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                <Info className="text-blue-600" /> Přehled přístrojů
              </h2>
              <div className="space-y-3">
                {devices.map(dev => (
                  <button 
                    key={dev.id} 
                    onClick={() => setSelectedTheoryId(dev.id)}
                    className={`w-full p-3 rounded-2xl border flex items-center gap-4 transition-all duration-300 cursor-pointer group text-left ${
                      selectedTheoryId === dev.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm ring-2 ring-blue-100' 
                        : 'bg-slate-50 border-slate-100 hover:scale-[1.02] hover:shadow-md hover:bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shadow-sm transition-transform duration-300 ${
                      selectedTheoryId === dev.id ? 'bg-white scale-110' : 'bg-white group-hover:rotate-6'
                    }`}>
                      {dev.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{dev.name}</h4>
                      <p className="text-[10px] text-slate-500 italic">{dev.rule}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {selectedTheoryId ? (
                  <motion.div 
                    key={selectedTheoryId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 relative overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                    
                    {(() => {
                      const dev = devices.find(d => d.id === selectedTheoryId);
                      if (!dev) return null;
                      return (
                        <>
                          <div className="flex items-center gap-4 mb-6">
                            <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
                              {dev.icon}
                            </div>
                            <div>
                              <h3 className="text-2xl font-black text-slate-900">{dev.name}</h3>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{dev.category}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                              <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Co tento přístroj dělá?
                              </h5>
                              <p className="text-slate-700 leading-relaxed text-sm mb-4">
                                {dev.details}
                              </p>
                              <DeviceVisualizer deviceId={dev.id} />
                            </div>
                            
                            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                              <h5 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Proč se používá v instalaci?
                              </h5>
                              <p className="text-blue-900 text-sm leading-relaxed font-medium">
                                {dev.why}
                              </p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl">
                    <h3 className="text-xl font-black mb-4">Vyberte přístroj</h3>
                    <p className="text-sm opacity-90 leading-relaxed">
                      Klikněte na libovolný přístroj v seznamu vlevo, abyste se dozvěděli více o jeho funkci a důležitosti v elektrické síti.
                    </p>
                  </div>
                )}
              </AnimatePresence>

              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl">
                <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Tip pro trenažér
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  V trenažéru vždy pamatujte na hierarchii: <strong>SPD</strong> na vstupu, pak <strong>Chránič</strong> pro ochranu osob a nakonec <strong>Jističe</strong> pro jednotlivé okruhy.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sim' && sessionTasks.length > 0 && (
          <div className="space-y-6">
            {/* Task Info */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <button onClick={() => changeTask(-1)} disabled={activeTaskIdx === 0} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-8 h-8" /></button>
                <div className="text-center md:text-left min-w-[200px]">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Úkol {activeTaskIdx + 1} / 5</p>
                  <h2 className="text-2xl font-black text-slate-800">{sessionTasks[activeTaskIdx].title}</h2>
                </div>
                <button onClick={() => changeTask(1)} disabled={activeTaskIdx === 4} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 cursor-pointer"><ChevronRight className="w-8 h-8" /></button>
              </div>
              <div className="flex-1 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-700">Zadání: {sessionTasks[activeTaskIdx].description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Palette */}
              <div className="lg:col-span-4 space-y-2 order-2 lg:order-1">
                {devices.map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => handleAddComponent(dev.id)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-left group cursor-pointer"
                  >
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors group-hover:scale-110 duration-300">{dev.icon}</div>
                    <span className="text-sm font-bold text-slate-700">{dev.name}</span>
                  </button>
                ))}
                <button onClick={() => setSimState({slot1:null, slot2:null, slot3:null})} className="w-full py-3 text-red-500 text-xs font-bold hover:bg-red-50 rounded-xl mt-4 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" /> VYČISTIT LIŠTU
                </button>
              </div>

              {/* DIN Rail */}
              <div className="lg:col-span-8 order-1 lg:order-2">
                <div className="bg-slate-300 p-8 rounded-[2rem] relative min-h-[220px] flex items-center gap-4 border-y-[10px] border-slate-400 shadow-2xl">
                  <div className="absolute top-1/2 left-0 right-0 h-12 bg-slate-400/30 -translate-y-1/2 -z-0"></div>
                  {[1, 2, 3].map(num => {
                    const deviceKey = simState[`slot${num}`];
                    const device = devices.find(d => d.id === deviceKey);
                    return (
                      <div 
                        key={num} 
                        onClick={() => device && removeComponent(`slot${num}`)}
                        className={`w-1/3 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center z-10 transition-all cursor-pointer relative overflow-hidden ${
                          device ? 'bg-white border-blue-500 shadow-xl scale-105 border-solid' : 'bg-slate-200/50 border-slate-400 hover:bg-white'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {device ? (
                            <motion.div
                              key={device.id}
                              initial={{ y: -20, opacity: 0, scale: 0.8 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              exit={{ y: 20, opacity: 0, scale: 0.8 }}
                              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                              className="flex flex-col items-center justify-center w-full h-full"
                            >
                              <div className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors">
                                <XCircle className="w-4 h-4" />
                              </div>
                              {device.icon}
                              <span className="text-[10px] mt-4 font-black text-center px-1 uppercase leading-none">{device.name}</span>
                              <div className="mt-4 w-full px-4">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '100%' }}
                                  className="h-1 bg-blue-600 rounded-full"
                                />
                              </div>
                            </motion.div>
                          ) : (
                            <motion.span 
                              key="empty"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"
                            >
                              Pozice {num}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={validateSim}
                  className="mt-8 w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Zap className="w-6 h-6 fill-yellow-300" /> ZAPNOUT NAPÁJENÍ
                </button>

                {feedback && (
                  <div className={`mt-6 p-6 rounded-3xl flex items-start gap-4 animate-bounce-short ${
                    feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {feedback.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                    <p className="font-bold text-sm leading-tight">{feedback.text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Circuit Diagram */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-800">
                <Activity className="text-blue-600" /> Interaktivní schéma zapojení
              </h3>
              
              <div className="relative flex items-center justify-between gap-4 py-12 px-4 bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* Source */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`p-4 rounded-2xl shadow-lg transition-all duration-500 ${isEnergized ? 'bg-yellow-400 text-slate-900 scale-110' : 'bg-slate-800 text-white'}`}>
                    <Zap className={`w-6 h-6 ${isEnergized ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Přívod NN</span>
                </div>

                {/* Connection Lines & Devices */}
                {[1, 2, 3].map(num => {
                  const deviceKey = simState[`slot${num}`];
                  const device = devices.find(d => d.id === deviceKey);
                  return (
                    <React.Fragment key={num}>
                      {/* Wire */}
                      <div className="flex-1 h-1 bg-slate-200 relative">
                        {isEnergized && (
                          <motion.div 
                            initial={{ left: '-100%' }}
                            animate={{ left: '100%' }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: num * 0.2 }}
                            className="absolute top-0 bottom-0 w-1/2 bg-yellow-400 blur-[2px]"
                          />
                        )}
                      </div>
                      
                      {/* Device Node */}
                      <div className="flex flex-col items-center gap-2 z-10">
                        <div className={`p-3 rounded-xl border-2 transition-all duration-500 ${
                          device 
                            ? (isEnergized ? 'bg-white border-blue-500 shadow-md scale-105' : 'bg-white border-slate-300') 
                            : 'bg-slate-100 border-slate-200 opacity-50'
                        }`}>
                          {device ? React.cloneElement(device.icon as React.ReactElement, { className: "w-5 h-5" }) : <div className="w-5 h-5" />}
                        </div>
                        <span className="text-[8px] font-bold uppercase text-slate-400">{device ? device.name : 'Prázdné'}</span>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* Final Wire */}
                <div className="flex-1 h-1 bg-slate-200 relative">
                  {isEnergized && (
                    <motion.div 
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear', delay: 0.8 }}
                      className="absolute top-0 bottom-0 w-1/2 bg-yellow-400 blur-[2px]"
                    />
                  )}
                </div>

                {/* Load */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className={`p-4 rounded-2xl shadow-lg transition-all duration-500 ${isEnergized ? 'bg-emerald-500 text-white scale-110 shadow-emerald-200' : 'bg-slate-800 text-white'}`}>
                    {sessionTasks[activeTaskIdx].title.includes('Motor') || sessionTasks[activeTaskIdx].title.includes('Čerpadlo') 
                      ? <Wind className={`w-6 h-6 ${isEnergized ? 'animate-spin' : ''}`} />
                      : <Zap className={`w-6 h-6 ${isEnergized ? 'fill-white' : ''}`} />
                    }
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spotřebič</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className={`w-3 h-3 rounded-full ${isEnergized ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                <p className="text-xs font-bold text-slate-600">
                  {isEnergized 
                    ? "Obvod je pod napětím a funkční. Ochranné prvky jsou aktivní." 
                    : "Obvod je rozpojen nebo nekompletní. Čeká se na zapnutí napájení."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="max-w-3xl mx-auto">
            {!quizFinished ? (
              quizQuestions.length > 0 && (
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Otázka {currentQuestion + 1} / 10</span>
                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black mb-10 text-slate-800 leading-tight">{quizQuestions[currentQuestion].q}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizQuestions[currentQuestion].options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleQuizAnswer(idx)} 
                        className="w-full p-6 text-left rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 font-bold transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <span>{opt}</span>
                        <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="space-y-8">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                  <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-black mb-4 text-slate-900">Test dokončen!</h2>
                  <div className="text-7xl font-black text-blue-600 mb-8">
                    {score} <span className="text-2xl text-slate-300">/ 10</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <button 
                      onClick={startNewQuiz} 
                      className="flex-1 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl cursor-pointer hover:bg-slate-800 transition-colors flex items-center justify-center gap-3"
                    >
                      <RefreshCw className="w-6 h-6" /> Zkusit znovu
                    </button>
                  </div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <BookOpen className="text-blue-600" /> Historie odpovědí
                  </h3>
                  <div className="space-y-6">
                    {userAnswers.map((ans, idx) => {
                      const question = quizQuestions[idx];
                      return (
                        <div key={idx} className={`p-6 rounded-3xl border-2 ${ans.isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 p-1 rounded-full ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                              {ans.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 mb-2">{question.q}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                <div className="text-xs">
                                  <span className="text-slate-400 uppercase font-black block mb-1">Tvoje odpověď</span>
                                  <span className={ans.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                    {question.options[ans.selectedIdx]}
                                  </span>
                                </div>
                                {!ans.isCorrect && (
                                  <div className="text-xs">
                                    <span className="text-slate-400 uppercase font-black block mb-1">Správná odpověď</span>
                                    <span className="text-green-600 font-bold">
                                      {question.options[question.correct]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {!ans.isCorrect && (
                                <div className="mt-4 p-4 bg-white rounded-2xl border border-red-100 flex items-start gap-3">
                                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-slate-600 leading-relaxed italic">
                                    {question.explanation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'share' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-slate-100">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-6" />
              <h2 className="text-2xl font-black mb-6">Sdílet aplikaci</h2>
              <div className="bg-slate-50 p-8 rounded-[2rem] inline-block mb-10 border-4 border-white shadow-inner">
                <QRCodeSVG 
                  value={window.location.href} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-sm text-slate-500 mb-2 italic">Studenti si mohou aplikaci naskenovat a procvičovat i bez internetu.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        VoltMaster Education System © 2026 | Všechna zapojení musí odpovídat ČSN
      </footer>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short { animation: bounce-short 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default App;
