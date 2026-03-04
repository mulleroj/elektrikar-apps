import React, { useState, useEffect, useId } from 'react';
import { Lightbulb, Zap, RefreshCw, Activity, ArrowRightLeft, Cpu, Sun, ShieldAlert, Info, Waves, AlertTriangle, Settings2, Maximize2, Crosshair, MoveHorizontal, MoveVertical, CheckCircle2, XCircle, HelpCircle, Trophy, QrCode, Share2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_QUESTIONS, Question } from './questions';
import { QRCodeSVG } from 'qrcode.react';

interface Particle {
  id: number;
  pos: number;
}

type DiodeType = 'standard' | 'zener' | 'led' | 'schottky' | 'photodiode' | 'varicap';

const DIODE_PROPS: Record<DiodeType, { name: string; v_threshold: number; v_zener?: number; color: string; desc: string }> = {
  standard: { 
    name: 'Křemíková (Si)', 
    v_threshold: 0.7, 
    color: 'blue',
    desc: 'Běžná usměrňovací dioda s úbytkem napětí cca 0.7 V.'
  },
  zener: { 
    name: 'Zenerova', 
    v_threshold: 0.7, 
    v_zener: 3.5, 
    color: 'purple',
    desc: 'Navržena pro práci v závěrném směru (Zenerův jev) při dosažení určitého napětí.'
  },
  led: { 
    name: 'LED (Červená)', 
    v_threshold: 1.8, 
    color: 'red',
    desc: 'Při průchodu proudu v propustném směru emituje světlo (fotony).'
  },
  schottky: { 
    name: 'Schottkyho', 
    v_threshold: 0.3, 
    color: 'emerald',
    desc: 'Využívá přechod kov-polovodič. Má velmi nízký úbytek napětí a je velmi rychlá.'
  },
  photodiode: {
    name: 'Fotodioda',
    v_threshold: 0.6,
    color: 'cyan',
    desc: 'Reaguje na dopadající světlo generováním proudu nebo změnou odporu v závěrném směru.'
  },
  varicap: {
    name: 'Varikap',
    v_threshold: 0.7,
    color: 'amber',
    desc: 'Využívá se jako napětím řízená kapacita (kapacitní dioda) v závěrném směru.'
  }
};

const StatusAlert = ({ type, message, icon: Icon, alertId }: { type: 'error' | 'warning' | 'info' | 'success', message: string, icon?: any, alertId?: string }) => {
  const colors = {
    error: 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    warning: 'bg-orange-500/10 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  };

  return (
    <motion.div
      key={alertId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-3 rounded-lg border flex items-start gap-3 ${colors[type]}`}
    >
      {Icon && <Icon size={18} className="shrink-0 mt-0.5" />}
      <p className="text-[11px] leading-relaxed font-medium">{message}</p>
    </motion.div>
  );
};

const Quiz = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ questionId: number; selectedIndex: number; isCorrect: boolean }[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const startNewQuiz = () => {
    const shuffled = [...ALL_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 10));
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
    setQuizFinished(false);
  };

  useEffect(() => {
    startNewQuiz();
  }, []);

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === questions[currentIndex].correctIndex;
    if (isCorrect) setScore(s => s + 1);
    
    setUserAnswers(prev => [...prev, {
      questionId: questions[currentIndex].id,
      selectedIndex: selectedOption!,
      isCorrect
    }]);

    setShowResult(true);
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (questions.length === 0) return null;

  if (quizFinished) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto"
          >
            <Trophy className="text-blue-400" size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold text-white">Test dokončen!</h2>
          <p className="text-slate-400 text-lg">
            Vaše skóre: <span className="text-blue-400 font-bold">{score}</span> z <span className="font-bold">{questions.length}</span>
          </p>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(score / questions.length) * 100}%` }}
              className="h-full bg-blue-500"
            />
          </div>
          <button 
            onClick={startNewQuiz}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            Zkusit znovu
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            <HelpCircle size={20} className="text-blue-400" /> Přehled odpovědí
          </h3>
          {questions.map((q, idx) => {
            const answer = userAnswers.find(a => a.questionId === q.id);
            return (
              <div key={q.id} className={`p-4 rounded-xl border ${answer?.isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-start gap-3">
                  {answer?.isCorrect ? (
                    <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} />
                  ) : (
                    <XCircle className="text-red-500 shrink-0 mt-1" size={18} />
                  )}
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-white">{idx + 1}. {q.text}</p>
                    <div className="text-[11px] space-y-1">
                      <p className={answer?.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                        Vaše odpověď: {q.options[answer?.selectedIndex ?? 0]}
                      </p>
                      {!answer?.isCorrect && (
                        <p className="text-emerald-400">
                          Správná odpověď: {q.options[q.correctIndex]}
                        </p>
                      )}
                    </div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                      <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                        <Info size={12} /> {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Otázka {currentIndex + 1} z {questions.length}</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 w-6 rounded-full transition-all ${
                  i === currentIndex ? 'bg-blue-500 w-10' : 
                  i < currentIndex ? (userAnswers[i]?.isCorrect ? 'bg-emerald-500' : 'bg-red-500') : 
                  'bg-slate-700'
                }`} 
              />
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Skóre</span>
          <p className="text-xl font-bold text-blue-400">{score}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white leading-tight">{currentQuestion.text}</h2>
        
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => handleOptionSelect(idx)}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                showResult 
                  ? idx === currentQuestion.correctIndex 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                    : idx === selectedOption 
                      ? 'bg-red-500/20 border-red-500 text-red-400' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-500'
                  : selectedOption === idx
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  showResult
                    ? idx === currentQuestion.correctIndex
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : idx === selectedOption
                        ? 'bg-red-500 border-red-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    : selectedOption === idx
                      ? 'bg-blue-500 border-blue-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-500 group-hover:border-slate-500'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm font-medium">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        {!showResult ? (
          <button
            disabled={selectedOption === null}
            onClick={handleNext}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            Ověřit odpověď <ArrowRightLeft size={16} />
          </button>
        ) : (
          <div className="w-full space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                selectedOption === currentQuestion.correctIndex 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/50 text-red-400'
              }`}
            >
              {selectedOption === currentQuestion.correctIndex ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider">
                  {selectedOption === currentQuestion.correctIndex ? 'Správně!' : 'Chyba!'}
                </p>
                <p className="text-[11px] leading-relaxed">{currentQuestion.explanation}</p>
              </div>
            </motion.div>
            <div className="flex justify-end">
              <button
                onClick={goToNextQuestion}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {currentIndex === questions.length - 1 ? 'Dokončit test' : 'Další otázka'} <Zap size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Oscilloscope = ({ 
  dataFn, 
  title, 
  unit, 
  color = "#10b981",
  yRange = [0, 100],
  height = 180,
  time: globalTime
}: { 
  dataFn: (x: number) => number; 
  title: string; 
  unit: string; 
  color?: string;
  yRange?: [number, number];
  height?: number;
  time: number;
}) => {
  const [timeBase, setTimeBase] = useState(1);
  const [voltDiv, setVoltDiv] = useState(1);
  const [trigger, setTrigger] = useState(50);
  const [showCursors, setShowCursors] = useState(false);
  const [cursorX1, setCursorX1] = useState(100);
  const [cursorX2, setCursorX2] = useState(300);
  const [cursorY1, setCursorY1] = useState(30);
  const [cursorY2, setCursorY2] = useState(70);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const width = 400;
  const gridStep = 40;

  const getPoints = () => {
    const points = [];
    for (let x = 0; x <= width; x += 2) {
      const t = (x / timeBase + trigger) % width;
      const val = dataFn(t);
      const y = 100 - (val * voltDiv);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  const deltaX = Math.abs(cursorX2 - cursorX1);
  const deltaY = Math.abs(cursorY2 - cursorY1) / voltDiv;

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl">
      <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-blue-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCursors(!showCursors)}
            className={`p-1 rounded transition ${showCursors ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
            title="Kurzory"
          >
            <Crosshair size={14} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1 rounded transition ${isSettingsOpen ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-800'}`}
            title="Nastavení"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      <div className="relative group" style={{ height }}>
        <svg viewBox={`0 0 ${width} 100`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
              <path d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`} fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <line x1="0" y1="50" x2={width} y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="2" />
          <line x1={width/2} y1="0" x2={width/2} y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="2" />

          <path d={`M ${getPoints()}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />

          {showCursors && (
            <>
              <line x1={cursorX1} y1="0" x2={cursorX1} y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" className="cursor-ew-resize" />
              <line x1={cursorX2} y1="0" x2={cursorX2} y2="100" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" className="cursor-ew-resize" />
              <line x1="0" y1={cursorY1} x2={width} y2={cursorY1} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" className="cursor-ns-resize" />
              <line x1="0" y1={cursorY2} x2={width} y2={cursorY2} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4" className="cursor-ns-resize" />
              
              <rect x={cursorX1 + 2} y="5" width="40" height="12" rx="2" fill="rgba(239, 68, 68, 0.8)" />
              <text x={cursorX1 + 4} y="14" className="text-[8px] fill-white font-mono">X1</text>
              <rect x={cursorX2 + 2} y="5" width="40" height="12" rx="2" fill="rgba(239, 68, 68, 0.8)" />
              <text x={cursorX2 + 4} y="14" className="text-[8px] fill-white font-mono">X2</text>
            </>
          )}

          <line x1="0" y1={100 - trigger} x2="10" y2={100 - trigger} stroke="#fbbf24" strokeWidth="2" />
          <line x1={globalTime} y1="0" x2={globalTime} y2="100" stroke="#ffffff" strokeWidth="1" opacity="0.3" />
        </svg>

        {showCursors && (
          <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm p-2 rounded border border-slate-700 text-[9px] font-mono space-y-1 pointer-events-none">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">ΔX:</span>
              <span className="text-red-400">{deltaX.toFixed(0)} px</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">ΔY:</span>
              <span className="text-blue-400">{deltaY.toFixed(2)} {unit}</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-t border-slate-800 p-3 grid grid-cols-2 gap-4 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <MoveHorizontal size={10} /> Časová základna
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="0.1" max="5" step="0.1" value={timeBase} 
                  onChange={(e) => setTimeBase(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8">{timeBase}x</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <MoveVertical size={10} /> Vertikální citlivost
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" min="0.1" max="3" step="0.1" value={voltDiv} 
                  onChange={(e) => setVoltDiv(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8">{voltDiv}x</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Zap size={10} /> Trigger Level
              </label>
              <input 
                type="range" min="0" max="100" step="1" value={trigger} 
                onChange={(e) => setTrigger(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
            {showCursors && (
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-slate-500">Pozice kurzorů</label>
                <div className="grid grid-cols-2 gap-1">
                  <input type="number" value={cursorX1} onChange={(e) => setCursorX1(parseInt(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[9px] text-white" />
                  <input type="number" value={cursorX2} onChange={(e) => setCursorX2(parseInt(e.target.value))} className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-[9px] text-white" />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DiodeSymbol = ({ forward, conducting, type = 'standard', label, className = "" }: { forward: boolean; conducting: boolean; type?: DiodeType; label?: string; className?: string }) => {
  const isZenerBreakdown = type === 'zener' && !forward && conducting;
  const id = useId();
  const [isHovered, setIsHovered] = useState(false);
  
  const info = DIODE_PROPS[type];

  const getStrokeColor = () => {
    if (conducting) {
      if (type === 'led') return "#ef4444";
      if (type === 'zener') return "#a855f7";
      if (type === 'schottky') return "#10b981";
      if (type === 'photodiode') return "#22d3ee";
      if (type === 'varicap') return "#fbbf24";
      return "#fbbf24";
    }
    if (forward) return "#60a5fa"; // Propustný ale nevodivý (pod prahem)
    if (type === 'photodiode' && !forward) return "#22d3ee"; // Fotodioda v závěrném směru reaguje na světlo
    return "#475569"; // Závěrný směr
  };

  const strokeColor = getStrokeColor();
  const strokeWidth = conducting ? 4 : (forward ? 3 : 2);

  return (
    <div 
      className={`flex flex-col items-center relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label && <span className="text-[10px] font-bold mb-1 uppercase tracking-tighter opacity-70">{label}</span>}
      <motion.div
        animate={conducting ? {
          scale: [1, 1.08, 1],
          filter: [
            `drop-shadow(0 0 2px ${strokeColor})`,
            `drop-shadow(0 0 15px ${strokeColor})`,
            `drop-shadow(0 0 2px ${strokeColor})`
          ]
        } : { 
          scale: 1, 
          filter: forward ? 'drop-shadow(0 0 2px rgba(96,165,250,0.3))' : 'drop-shadow(0 0 0px transparent)' 
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 60" className="w-16 h-10 overflow-visible">
          <defs>
            <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
            </marker>
            <radialGradient id={`ledGlow-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Zener Breakdown Label - Stays fixed */}
          {isZenerBreakdown && (
            <motion.text
              x="50" y="-5"
              textAnchor="middle"
              className="text-[8px] font-bold fill-purple-400 uppercase tracking-widest"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              Průraz!
            </motion.text>
          )}

          <motion.g
            animate={{ rotate: forward ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{ originX: "50px", originY: "30px" }}
          >
            {/* LED Glow Background */}
            {type === 'led' && conducting && (
              <motion.circle
                cx="52"
                cy="30"
                r="20"
                fill={`url(#ledGlow-${id})`}
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            )}

            <motion.line 
              animate={{ stroke: strokeColor, strokeWidth }}
              x1="0" y1="30" x2="40" y2="30" 
            />
            <motion.line 
              animate={{ stroke: strokeColor, strokeWidth }}
              x1="60" y1="30" x2="100" y2="30" 
            />
            <motion.polygon 
              animate={{ 
                stroke: strokeColor, 
                strokeWidth,
                fill: conducting ? strokeColor : "rgba(0,0,0,0)"
              }}
              points="40,10 40,50 65,30" 
            />
            {/* Katoda */}
            <g>
              <motion.line 
                animate={{ stroke: strokeColor, strokeWidth }}
                x1="65" y1="10" x2="65" y2="50" 
              />
              {type === 'zener' && (
                <>
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="65" y1="10" x2="75" y2="5" 
                  />
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="65" y1="50" x2="55" y2="55" 
                  />
                  
                  {/* Zener Breakdown Sparks */}
                  {!forward && conducting && (
                    <motion.g
                      animate={{ 
                        opacity: [0, 1, 0, 1, 0],
                        scale: [0.8, 1.2, 0.9, 1.1, 0.8]
                      }}
                      transition={{ repeat: Infinity, duration: 0.2 }}
                    >
                      <path d="M 65 30 L 75 20 L 60 25 L 70 15" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                      <path d="M 65 30 L 55 40 L 70 35 L 60 45" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                    </motion.g>
                  )}
                </>
              )}
              {type === 'schottky' && (
                <>
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="65" y1="10" x2="55" y2="10" 
                  />
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="55" y1="10" x2="55" y2="20" 
                  />
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="65" y1="50" x2="75" y2="50" 
                  />
                  <motion.line 
                    animate={{ stroke: strokeColor, strokeWidth }}
                    x1="75" y1="50" x2="75" y2="40" 
                  />
                </>
              )}
              {type === 'led' && conducting && (
                <motion.g
                  animate={{ y: [-5, -15], x: [5, 15], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  <line x1="70" y1="10" x2="85" y2="-5" stroke="#ef4444" strokeWidth="2" markerEnd={`url(#arrow-${id})`} />
                  <line x1="80" y1="20" x2="95" y2="5" stroke="#ef4444" strokeWidth="2" markerEnd={`url(#arrow-${id})`} />
                </motion.g>
              )}
              {type === 'photodiode' && (
                <motion.g
                  animate={{ y: [-15, -5], x: [-15, -5], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                >
                  <line x1="85" y1="-5" x2="70" y2="10" stroke="#22d3ee" strokeWidth="2" markerEnd={`url(#arrow-${id})`} />
                  <line x1="95" y1="5" x2="80" y2="20" stroke="#22d3ee" strokeWidth="2" markerEnd={`url(#arrow-${id})`} />
                </motion.g>
              )}
              {type === 'varicap' && (
                <motion.line 
                  animate={{ stroke: strokeColor, strokeWidth }}
                  x1="72" y1="10" x2="72" y2="50" 
                />
              )}
            </g>
          </motion.g>
        </svg>
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-2xl pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full bg-${info.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${info.color}-500/50`}></div>
              <h4 className="text-xs font-bold text-white">{info.name}</h4>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mb-2">{info.desc}</p>
            <div className="grid grid-cols-2 gap-1 border-t border-slate-700 pt-2">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase text-slate-500 font-bold">Prahové U</span>
                <span className="text-[10px] text-blue-400 font-mono">{info.v_threshold} V</span>
              </div>
              {info.v_zener && (
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase text-slate-500 font-bold">Zenerovo U</span>
                  <span className="text-[10px] text-purple-400 font-mono">{info.v_zener} V</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [isForward, setIsForward] = useState(true);
  const [voltage, setVoltage] = useState(0);
  const [activeTab, setActiveTab] = useState('circuit');
  const [diodeType, setDiodeType] = useState<DiodeType>('standard');
  const [combinationType, setCombinationType] = useState<'series' | 'parallel'>('series');
  const [capacitance, setCapacitance] = useState(100); // uF
  const [resistance, setResistance] = useState(1000); // Ohm
  const [zenerVoltage, setZenerVoltage] = useState(3.3); // V for stabilizer
  const [electrons, setElectrons] = useState<Particle[]>([]);
  const [holes, setHoles] = useState<Particle[]>([]);
  const [showElectrons, setShowElectrons] = useState(true);
  const [showHoles, setShowHoles] = useState(true);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [hoveredDiodeSelection, setHoveredDiodeSelection] = useState<DiodeType | null>(null);
  const [acPhase, setAcPhase] = useState(1); // 1 for positive half, -1 for negative half
  const [time, setTime] = useState(0);
  const [isFeedbackEnabled, setIsFeedbackEnabled] = useState(false);
  const [showFeedbackText, setShowFeedbackText] = useState(false);
  const [hoveredGraphPoint, setHoveredGraphPoint] = useState<{ u: number; i: number; x: number; y: number } | null>(null);
  const [currentLimit, setCurrentLimit] = useState(100);
  const [hoveredSupplyBlock, setHoveredSupplyBlock] = useState<string | null>(null);
  const [capacitorFault, setCapacitorFault] = useState<'none' | 'degraded' | 'shorted'>('none');
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [filterMode, setFilterMode] = useState<'rectified' | 'lowpass'>('rectified');
  const [inputFrequency, setInputFrequency] = useState(50); // Hz
  const [lightIntensity, setLightIntensity] = useState(50); // % for photodiode
  const [showQrModal, setShowQrModal] = useState(false);

  const appUrl = window.location.href;

  // Globální časovač pro průběhy napětí
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => (t + 2) % 400);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Vlastnosti aktuální diody
  const props = DIODE_PROPS[diodeType];
  const V_THRESHOLD = props.v_threshold;
  const isZenerBreakdown = diodeType === 'zener' && !isForward && voltage > (props.v_zener || 0);
  const isPhotodiodeConducting = diodeType === 'photodiode' && !isForward && (voltage > 0.1 || lightIntensity > 5); // Simulace osvětlení
  const isConducting = (isForward && voltage > V_THRESHOLD) || isZenerBreakdown || isPhotodiodeConducting;

  // Výpočet proudu pro I-U graf
  const getDiodeCurrent = (v: number, forward: boolean) => {
    let i = 0;
    if (forward) {
      if (v < V_THRESHOLD) i = 0;
      else i = Math.pow(v - V_THRESHOLD, 1.5) * 20;
    } else {
      if (diodeType === 'zener' && v > (props.v_zener || 0)) {
        i = Math.pow(v - (props.v_zener || 0), 1.5) * 20;
      } else if (diodeType === 'photodiode') {
        // Fotoproud v závěrném směru (závislý na intenzitě světla a napětí)
        i = (v * 2) + (lightIntensity / 100) * 40;
      } else {
        i = 0;
      }
    }
    return Math.min(i, currentLimit);
  };

  const currentCurrent = getDiodeCurrent(voltage, isForward);

  // Zpětná vazba (stabilizace)
  useEffect(() => {
    if (isFeedbackEnabled && isZenerBreakdown) {
      setShowFeedbackText(true);
      const timer = setTimeout(() => setShowFeedbackText(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFeedbackEnabled, isZenerBreakdown]);

  // Animace částic pro PN přechod
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConducting) {
        const threshold = diodeType === 'photodiode' ? Math.max(0.1, 0.8 - (lightIntensity / 150)) : 0.7;
        setElectrons(prev => {
          const next = [...prev];
          if (Math.random() > threshold) next.push({ id: Date.now() + Math.random(), pos: 0 });
          return next.filter(e => e.pos < 100).map(e => ({ ...e, pos: e.pos + 2 }));
        });
        setHoles(prev => {
          const next = [...prev];
          if (Math.random() > threshold) next.push({ id: Date.now() + Math.random(), pos: 0 });
          return next.filter(h => h.pos < 100).map(h => ({ ...h, pos: h.pos + 2 }));
        });
      } else {
        setElectrons([]);
        setHoles([]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isConducting, diodeType, lightIntensity]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">
      <header className="max-w-4xl mx-auto mb-8 text-center relative">
        <div className="absolute right-0 top-0 flex gap-2">
          <button 
            onClick={() => setShowQrModal(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-full transition-all border border-slate-700 shadow-lg group"
            title="Sdílet přes QR kód"
          >
            <QrCode size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <h1 className="text-3xl font-bold text-blue-400 mb-2">Dioda: Zpětná klapka elektroniky</h1>
        <p className="text-slate-400">Interaktivní pomůcka pro budoucí elektrikáře</p>
      </header>

      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative"
            >
              <button 
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="mb-6 flex justify-center">
                <div className="bg-white p-4 rounded-2xl shadow-inner">
                  <QRCodeSVG value={appUrl} size={200} level="H" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Sdílet aplikaci</h3>
              <p className="text-slate-400 text-sm mb-6">
                Namiřte fotoaparát na QR kód pro rychlý přístup k simulaci.
              </p>
              
              <div className="flex flex-col gap-2">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-[10px] font-mono text-blue-400 break-all select-all">
                  {appUrl}
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(appUrl);
                    // Můžeme přidat nějakou vizuální zpětnou vazbu
                  }}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
                >
                  <Share2 size={14} /> Kopírovat odkaz
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="max-w-4xl mx-auto grid grid-cols-4 md:grid-cols-8 gap-1 mb-6 bg-slate-800 p-1 rounded-lg">
        <button 
          onClick={() => setActiveTab('circuit')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'circuit' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Dioda
        </button>
        <button 
          onClick={() => setActiveTab('pn')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'pn' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          PN Přechod
        </button>
        <button 
          onClick={() => setActiveTab('acdc')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'acdc' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Usměrňování
        </button>
        <button 
          onClick={() => setActiveTab('bridge')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'bridge' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Můstek
        </button>
        <button 
          onClick={() => setActiveTab('combinations')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'combinations' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Kombinace
        </button>
        <button 
          onClick={() => setActiveTab('filter')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'filter' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          RC Filtr
        </button>
        <button 
          onClick={() => setActiveTab('power-supply')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'power-supply' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Zdroj
        </button>
        <button 
          onClick={() => setActiveTab('test')}
          className={`py-2 rounded-md text-[9px] md:text-xs transition ${activeTab === 'test' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
        >
          Test
        </button>
      </nav>

      <main className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
        
        {activeTab === 'circuit' && (
          <div className="space-y-8">
            {/* Výběr typu diody i zde pro konzistenci */}
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                {(Object.keys(DIODE_PROPS) as DiodeType[]).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setDiodeType(type)}
                    onMouseEnter={() => setHoveredDiodeSelection(type)}
                    onMouseLeave={() => setHoveredDiodeSelection(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      borderColor: diodeType === type 
                        ? (DIODE_PROPS[type].color === 'blue' ? '#60a5fa' : 
                           DIODE_PROPS[type].color === 'purple' ? '#c084fc' : 
                           DIODE_PROPS[type].color === 'red' ? '#f87171' : 
                           DIODE_PROPS[type].color === 'emerald' ? '#34d399' : 
                           DIODE_PROPS[type].color === 'cyan' ? '#22d3ee' : 
                           '#fbbf24') // amber
                        : '#334155', // border-slate-700
                      boxShadow: diodeType === type ? [
                        "0 0 0px rgba(0,0,0,0)",
                        `0 0 12px ${DIODE_PROPS[type].color === 'blue' ? 'rgba(59,130,246,0.5)' : 
                                   DIODE_PROPS[type].color === 'purple' ? 'rgba(168,85,247,0.5)' : 
                                   DIODE_PROPS[type].color === 'red' ? 'rgba(239,68,68,0.5)' : 
                                   DIODE_PROPS[type].color === 'emerald' ? 'rgba(16,185,129,0.5)' :
                                   DIODE_PROPS[type].color === 'cyan' ? 'rgba(34,211,238,0.5)' :
                                   'rgba(251,191,36,0.5)'}`,
                        "0 0 0px rgba(0,0,0,0)"
                      ] : "0 0 0px rgba(0,0,0,0)"
                    }}
                    transition={{ 
                      boxShadow: { repeat: diodeType === type ? Infinity : 0, duration: 2 },
                      borderColor: { duration: 0.2 }
                    }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                      diodeType === type 
                        ? `bg-${DIODE_PROPS[type].color}-600 text-white` 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {type === 'standard' && <Cpu size={12} />}
                    {type === 'zener' && <ShieldAlert size={12} />}
                    {type === 'led' && <Sun size={12} />}
                    {type === 'schottky' && <Zap size={12} />}
                    {type === 'photodiode' && <Sun size={12} className="text-cyan-400" />}
                    {type === 'varicap' && <Waves size={12} className="text-amber-400" />}
                    {DIODE_PROPS[type].name}
                  </motion.button>
                ))}
              </div>
              
              {/* Tooltip pro výběr diody */}
              <AnimatePresence>
                {hoveredDiodeSelection && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute -top-20 left-0 right-0 bg-slate-800 text-white text-[10px] px-4 py-3 rounded-xl shadow-2xl border border-slate-600 z-50 text-center pointer-events-none backdrop-blur-md"
                  >
                    <div className="font-bold text-blue-300 mb-1 text-xs">{DIODE_PROPS[hoveredDiodeSelection].name}</div>
                    <div className="text-slate-300 leading-relaxed">{DIODE_PROPS[hoveredDiodeSelection].desc}</div>
                    <div className="mt-2 flex justify-center gap-4 text-[9px] font-mono text-slate-400 border-t border-slate-700 pt-2">
                      <span className="flex items-center gap-1">
                        <Zap size={10} className="text-yellow-500" />
                        U_th: {DIODE_PROPS[hoveredDiodeSelection].v_threshold}V
                      </span>
                      {DIODE_PROPS[hoveredDiodeSelection].v_zener && (
                        <span className="flex items-center gap-1">
                          <ShieldAlert size={10} className="text-purple-400" />
                          U_z: {DIODE_PROPS[hoveredDiodeSelection].v_zener}V
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Diagnostické zprávy pro Diodu */}
            <AnimatePresence mode="wait">
              {isZenerBreakdown && (
                <div className="px-4 mb-4">
                  {isFeedbackEnabled ? (
                    <StatusAlert 
                      alertId="zener-ok-dioda"
                      type="success" 
                      icon={ShieldAlert}
                      message="Stabilizace aktivní: Zenerova dioda bezpečně omezuje napětí na své jmenovité hodnotě. Přebytečná energie je odváděna, což chrání připojenou zátěž."
                    />
                  ) : (
                    <StatusAlert 
                      alertId="zener-error-dioda"
                      type="error" 
                      icon={AlertTriangle}
                      message="KRITICKÝ PRŮRAZ: Dioda je v oblasti nekontrolovaného průrazu. Bez omezovacího odporu hrozí její okamžité zničení vysokým proudem."
                    />
                  )}
                </div>
              )}
              {!isForward && !isZenerBreakdown && voltage > 4 && diodeType === 'standard' && (
                <div className="px-4 mb-4">
                  <StatusAlert 
                    alertId="reverse-warning"
                    type="warning" 
                    icon={Info}
                    message="Vysoké závěrné napětí: Dioda v tomto směru nevede, ale blížite se k jejímu maximálnímu závěrnému napětí. Při jeho překročení by došlo k nevratnému poškození (průrazu)."
                  />
                </div>
              )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-10 border-b border-slate-700">
              <div className="flex flex-col items-center">
                <div className="w-16 h-24 border-4 border-slate-400 rounded-lg relative flex flex-col justify-between p-2">
                  <div className="text-red-500 font-bold text-center">+</div >
                  <div className="text-blue-500 font-bold text-center">-</div>
                </div>
                <span className="mt-2 font-mono text-xl">{voltage.toFixed(1)} V</span>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className={`${isConducting ? (diodeType === 'led' ? 'text-red-500' : 'text-yellow-400') : 'text-slate-500'} transition-colors`}>
                  <DiodeSymbol forward={isForward} conducting={isConducting} type={diodeType} />
                </div>
                <button 
                  onClick={() => setIsForward(!isForward)}
                  className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600 transition text-sm"
                >
                  <RefreshCw size={14} /> Otočit diodu
                </button>
              </div>

              <div className="flex flex-col items-center">
                <div className={`p-4 rounded-full transition-all duration-300 ${isConducting ? (diodeType === 'led' ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'bg-yellow-400/20 shadow-[0_0_50px_rgba(250,204,21,0.4)]') : ''}`}>
                  <motion.div
                    animate={isFeedbackEnabled && isZenerBreakdown ? {
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                      filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                  >
                    <Lightbulb size={64} className={isConducting ? (diodeType === 'led' ? 'text-red-500' : 'text-yellow-400') : 'text-slate-600'} />
                  </motion.div>
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span className="font-semibold text-sm">
                    {isZenerBreakdown ? "PRŮRAZ" : (isConducting ? "VEDE" : "NEVEDE")}
                  </span>
                  <AnimatePresence>
                    {showFeedbackText && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1"
                      >
                        Zpětná vazba aktivní
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium flex justify-between w-full">
                    <span>Napětí zdroje (U):</span>
                    <span className="text-blue-400">{voltage.toFixed(1)} V</span>
                  </label>
                  <input 
                    type="range" min="0" max="5" step="0.1" value={voltage} 
                    onChange={(e) => setVoltage(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium flex justify-between w-full">
                    <span>Proudový limit (I_max):</span>
                    <span className="text-emerald-400">{currentLimit} mA</span>
                  </label>
                  <input 
                    type="range" min="10" max="200" step="10" value={currentLimit} 
                    onChange={(e) => setCurrentLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-2 border-t border-slate-700">
                <button
                  onClick={() => setIsFeedbackEnabled(!isFeedbackEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    isFeedbackEnabled 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <ShieldAlert size={14} />
                  Simulovat zpětnou vazbu (stabilizaci)
                </button>
                <p className="text-[10px] text-slate-500 italic">
                  Zpětná vazba využívá Zenerův průraz k udržení konstantního napětí v obvodu.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pn' && (
          <div className="space-y-6">
            {/* Výběr typu diody */}
            <div className="relative space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                {(Object.keys(DIODE_PROPS) as DiodeType[]).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setDiodeType(type)}
                    onMouseEnter={() => setHoveredDiodeSelection(type)}
                    onMouseLeave={() => setHoveredDiodeSelection(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      borderColor: diodeType === type 
                        ? (DIODE_PROPS[type].color === 'blue' ? '#60a5fa' : 
                           DIODE_PROPS[type].color === 'purple' ? '#c084fc' : 
                           DIODE_PROPS[type].color === 'red' ? '#f87171' : 
                           DIODE_PROPS[type].color === 'emerald' ? '#34d399' : 
                           DIODE_PROPS[type].color === 'cyan' ? '#22d3ee' : 
                           '#fbbf24') // amber
                        : '#334155', // border-slate-700
                      boxShadow: diodeType === type ? [
                        "0 0 0px rgba(0,0,0,0)",
                        `0 0 12px ${DIODE_PROPS[type].color === 'blue' ? 'rgba(59,130,246,0.5)' : 
                                   DIODE_PROPS[type].color === 'purple' ? 'rgba(168,85,247,0.5)' : 
                                   DIODE_PROPS[type].color === 'red' ? 'rgba(239,68,68,0.5)' : 
                                   DIODE_PROPS[type].color === 'emerald' ? 'rgba(16,185,129,0.5)' :
                                   DIODE_PROPS[type].color === 'cyan' ? 'rgba(34,211,238,0.5)' :
                                   'rgba(251,191,36,0.5)'}`,
                        "0 0 0px rgba(0,0,0,0)"
                      ] : "0 0 0px rgba(0,0,0,0)"
                    }}
                    transition={{ 
                      boxShadow: { repeat: diodeType === type ? Infinity : 0, duration: 2 },
                      borderColor: { duration: 0.2 }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      diodeType === type 
                        ? `bg-${DIODE_PROPS[type].color}-600 text-white` 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {type === 'standard' && <Cpu size={14} />}
                    {type === 'zener' && <ShieldAlert size={14} />}
                    {type === 'led' && <Sun size={14} />}
                    {type === 'schottky' && <Zap size={14} />}
                    {type === 'photodiode' && <Sun size={14} className="text-cyan-400" />}
                    {type === 'varicap' && <Waves size={14} className="text-amber-400" />}
                    {DIODE_PROPS[type].name}
                  </motion.button>
                ))}
              </div>

              {/* Feedback Toggle on PN Tab */}
              <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-700/50">
                <button
                  onClick={() => setIsFeedbackEnabled(!isFeedbackEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${
                    isFeedbackEnabled 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'bg-slate-900 text-slate-400 border border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert size={12} />
                  Simulovat zpětnou vazbu
                </button>
                <AnimatePresence>
                  {isFeedbackEnabled && isZenerBreakdown && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] text-purple-400 font-bold animate-pulse"
                    >
                      Zpětná vazba aktivní!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Tooltip pro výběr diody */}
              <AnimatePresence>
                {hoveredDiodeSelection && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute -top-20 left-0 right-0 bg-slate-800 text-white text-[10px] px-4 py-3 rounded-xl shadow-2xl border border-slate-600 z-50 text-center pointer-events-none backdrop-blur-md"
                  >
                    <div className="font-bold text-blue-300 mb-1 text-xs">{DIODE_PROPS[hoveredDiodeSelection].name}</div>
                    <div className="text-slate-300 leading-relaxed">{DIODE_PROPS[hoveredDiodeSelection].desc}</div>
                    <div className="mt-2 flex justify-center gap-4 text-[9px] font-mono text-slate-400 border-t border-slate-700 pt-2">
                      <span className="flex items-center gap-1">
                        <Zap size={10} className="text-yellow-500" />
                        U_th: {DIODE_PROPS[hoveredDiodeSelection].v_threshold}V
                      </span>
                      {DIODE_PROPS[hoveredDiodeSelection].v_zener && (
                        <span className="flex items-center gap-1">
                          <ShieldAlert size={10} className="text-purple-400" />
                          U_z: {DIODE_PROPS[hoveredDiodeSelection].v_zener}V
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Diagnostické zprávy pro PN Přechod */}
            <AnimatePresence mode="wait">
              {isZenerBreakdown && (
                <div className="px-4">
                  {isFeedbackEnabled ? (
                    <StatusAlert 
                      alertId="zener-ok"
                      type="success" 
                      icon={ShieldAlert}
                      message="Stabilizace aktivní: Zenerova dioda pracuje v oblasti průrazu a udržuje konstantní napětí. Přebytečný proud je bezpečně odváděn, čímž chrání zbytek obvodu."
                    />
                  ) : (
                    <StatusAlert 
                      alertId="zener-error"
                      type="error" 
                      icon={AlertTriangle}
                      message="KRITICKÝ PRŮRAZ: Bez zpětné vazby (stabilizačního odporu) protéká diodou v závěrném směru destruktivní proud. V reálném obvodu by došlo k okamžitému tepelnému zničení přechodu."
                    />
                  )}
                </div>
              )}
            </AnimatePresence>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-center">Pohled dovnitř: {props.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 ${
                  isZenerBreakdown ? 'text-purple-400' : (!isForward ? 'text-red-400' : (voltage > V_THRESHOLD ? 'text-yellow-400' : 'text-blue-400'))
                }`}>
                  {isZenerBreakdown ? 'ZENERŮV PRŮRAZ (VEDE)' : (!isForward ? 'V ZÁVĚRNÉM SMĚRU' : (voltage > V_THRESHOLD ? 'V PROPUSTNÉM SMĚRU (VEDE)' : 'V PROPUSTNÉM SMĚRU (NEVEDE)'))}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic max-w-lg mx-auto">
                {props.desc}
              </p>
            </div>

            {/* Interaktivní legenda */}
            <div className="flex justify-center gap-6 mb-2 relative">
              <button 
                onClick={() => setShowElectrons(!showElectrons)}
                onMouseEnter={() => setHoveredPart('elektrony')}
                onMouseLeave={() => setHoveredPart(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                  showElectrons 
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${showElectrons ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Elektrony (-)</span>
              </button>
              <button 
                onClick={() => setShowHoles(!showHoles)}
                onMouseEnter={() => setHoveredPart('diry')}
                onMouseLeave={() => setHoveredPart(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                  showHoles 
                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full border border-blue-400 ${showHoles ? 'bg-transparent animate-pulse' : 'bg-slate-600'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">Díry (+)</span>
              </button>

              {/* Tooltip pro legendu */}
              <AnimatePresence>
                {hoveredPart && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] px-3 py-2 rounded shadow-xl border border-slate-600 z-50 w-64 text-center pointer-events-none"
                  >
                    {hoveredPart === 'elektrony' && "Záporně nabité částice, které se v typu N pohybují jako majoritní nosiče."}
                    {hoveredPart === 'diry' && "Kladně nabitá 'volná místa' po elektronech, která se v typu P chovají jako nosiče náboje."}
                    {hoveredPart === 'ptyp' && "Oblast polovodiče s přebytkem kladných nosičů náboje (děr)."}
                    {hoveredPart === 'ntyp' && "Oblast polovodiče s přebytkem záporných nosičů náboje (elektronů)."}
                    {hoveredPart === 'hradlova' && "Oblast bez volných nosičů náboje na přechodu P-N. Vytváří potenciálovou bariéru."}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative h-64 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 flex group">
              <div 
                onMouseEnter={() => setHoveredPart('ptyp')}
                onMouseLeave={() => setHoveredPart(null)}
                className="flex-1 bg-blue-900/20 flex flex-wrap p-4 content-center justify-center gap-4 relative cursor-help transition-colors hover:bg-blue-900/30"
              >
                <div className="absolute top-2 left-2 text-xs font-bold text-blue-400">TYP P (Díry +)</div>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border-2 border-blue-400/50 flex items-center justify-center text-[8px] text-blue-400">+</div>
                ))}
              </div>
              <div 
                onMouseEnter={() => setHoveredPart('hradlova')}
                onMouseLeave={() => setHoveredPart(null)}
                className="w-1 bg-slate-700 h-full relative cursor-help"
              >
                {!isConducting && (
                  <motion.div 
                    animate={{ 
                      left: hoveredPart === 'hradlova' ? -60 : -40, 
                      right: hoveredPart === 'hradlova' ? -60 : -40,
                      backgroundColor: hoveredPart === 'hradlova' ? 'rgba(51, 65, 85, 0.95)' : 'rgba(30, 41, 59, 0.8)',
                      filter: hoveredPart === 'hradlova' ? 'brightness(1.3)' : 'brightness(1)',
                      boxShadow: hoveredPart === 'hradlova' ? '0 0 30px rgba(0,0,0,0.5)' : '0 0 0px transparent'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-0 bottom-0 flex items-center justify-center border-x border-slate-500 z-20"
                  >
                    <motion.span 
                      animate={{ 
                        scale: hoveredPart === 'hradlova' ? 1.2 : 1, 
                        opacity: hoveredPart === 'hradlova' ? 1 : 0.5,
                        letterSpacing: hoveredPart === 'hradlova' ? "0.2em" : "0.1em"
                      }}
                      className="text-[10px] rotate-90 whitespace-nowrap uppercase tracking-widest font-bold text-slate-300"
                    >
                      Hradlová vrstva
                    </motion.span>
                  </motion.div>
                )}
                {isConducting && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className={`absolute inset-0 w-8 -left-4 ${isZenerBreakdown ? 'bg-purple-500/40' : (diodeType === 'led' ? 'bg-red-500/30' : 'bg-yellow-400/20')} blur-xl z-0`}
                  />
                )}
                {isZenerBreakdown && (
                  <motion.div 
                    animate={isFeedbackEnabled ? { 
                      opacity: [0.5, 1, 0.5], 
                      scale: [1, 1.3, 1],
                      filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
                    } : {
                      opacity: [0.5, 1, 0.5], 
                      scale: [1, 1.3, 1]
                    }}
                    transition={{ repeat: Infinity, duration: isFeedbackEnabled ? 0.1 : 0.2 }}
                    className="absolute inset-0 w-24 -left-12 flex flex-col items-center justify-center z-10"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                      <path d="M 50 20 L 60 40 L 40 45 L 55 65 L 45 60 L 50 80" fill="none" stroke="#a855f7" strokeWidth="3" />
                      <path d="M 30 50 L 50 45 L 45 55 L 70 50" fill="none" stroke="#a855f7" strokeWidth="2" />
                      {isFeedbackEnabled && (
                        <>
                          <circle cx="50" cy="50" r="10" fill="rgba(168, 85, 247, 0.3)" />
                          <path d="M 20 20 L 30 30" stroke="#ffffff" strokeWidth="1" />
                          <path d="M 80 80 L 70 70" stroke="#ffffff" strokeWidth="1" />
                        </>
                      )}
                    </svg>
                    <span className="text-[8px] font-bold text-purple-400 uppercase tracking-tighter bg-slate-900/80 px-1 rounded">
                      {isFeedbackEnabled ? "Stabilizace!" : "Průraz!"}
                    </span>
                  </motion.div>
                )}
                {diodeType === 'led' && isConducting && (
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute inset-0 w-32 -left-16 bg-red-500/10 blur-3xl z-0"
                  />
                )}
              </div>
              <div 
                onMouseEnter={() => setHoveredPart('ntyp')}
                onMouseLeave={() => setHoveredPart(null)}
                className="flex-1 bg-red-900/20 flex flex-wrap p-4 content-center justify-center gap-4 relative cursor-help transition-colors hover:bg-red-900/30"
              >
                <div className="absolute top-2 right-2 text-xs font-bold text-red-400">TYP N (Elektrony -)</div>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center text-[12px] text-red-900 font-bold">-</div>
                ))}
              </div>
              
              {/* Animované elektrony (N -> P) */}
              <AnimatePresence>
                {showElectrons && electrons.map(e => (
                  <motion.div 
                    key={`e-${e.id}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: e.pos < 5 || e.pos > 95 ? 0 : 1,
                      scale: [1, 1.4, 1],
                      y: [0, (e.id % 16) - 8, 0],
                      x: [0, (e.id % 8) - 4, 0],
                      filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
                    }}
                    whileHover={{ 
                      scale: 2, 
                      filter: "brightness(1.5) blur(0px)",
                      zIndex: 50 
                    }}
                    transition={{
                      scale: { repeat: Infinity, duration: 0.5 },
                      y: { repeat: Infinity, duration: 0.7, ease: "easeInOut" },
                      x: { repeat: Infinity, duration: 0.4, ease: "easeInOut" },
                      filter: { repeat: Infinity, duration: 1.2, ease: "linear" }
                    }}
                    className="absolute w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-bold text-white z-10 
                               shadow-[0_0_15px_#ef4444,5px_0_10px_rgba(239,68,68,0.3),10px_0_5px_rgba(239,68,68,0.1)]
                               after:content-[''] after:absolute after:inset-[-12px] after:rounded-full after:bg-red-500/10 after:blur-xl after:animate-pulse
                               before:content-[''] before:absolute before:inset-[-6px] before:rounded-full before:bg-red-400/30 before:blur-[4px]
                               cursor-pointer transition-shadow hover:shadow-[0_0_25px_#ef4444]"
                    style={{ 
                      right: isForward ? `${e.pos}%` : `${100 - e.pos}%`, 
                      top: `${20 + (e.id % 60)}%`,
                    }}
                  >
                    -
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Animované díry (P -> N) */}
              <AnimatePresence>
                {showHoles && holes.map(h => (
                  <motion.div 
                    key={`h-${h.id}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: h.pos < 5 || h.pos > 95 ? 0 : 1,
                      scale: [1, 1.4, 1],
                      y: [0, (h.id % 16) - 8, 0],
                      x: [0, (h.id % 8) - 4, 0],
                      filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
                    }}
                    whileHover={{ 
                      scale: 2, 
                      filter: "brightness(1.5) blur(0px)",
                      zIndex: 50 
                    }}
                    transition={{
                      scale: { repeat: Infinity, duration: 0.5 },
                      y: { repeat: Infinity, duration: 0.8, ease: "easeInOut" },
                      x: { repeat: Infinity, duration: 0.3, ease: "easeInOut" },
                      filter: { repeat: Infinity, duration: 1.5, ease: "linear" }
                    }}
                    className="absolute w-3 h-3 border-2 border-blue-400 rounded-full flex items-center justify-center text-[8px] font-bold text-blue-400 z-10
                               shadow-[0_0_15px_#60a5fa,-5px_0_10px_rgba(96,165,250,0.3),-10px_0_5px_rgba(96,165,250,0.1)]
                               after:content-[''] after:absolute after:inset-[-12px] after:rounded-full after:bg-blue-400/10 after:blur-xl after:animate-pulse
                               before:content-[''] before:absolute before:inset-[-6px] before:rounded-full before:bg-blue-300/30 before:blur-[4px]
                               cursor-pointer transition-shadow hover:shadow-[0_0_25px_#60a5fa]"
                    style={{ 
                      left: isForward ? `${h.pos}%` : `${100 - h.pos}%`, 
                      top: `${30 + (h.id % 50)}%`,
                    }}
                  >
                    +
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Graf potenciálového profilu */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-4">
              <h4 className="text-sm font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-blue-400" /> 
                  Potenciálový profil přechodu
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded bg-slate-800 text-${props.color === 'emerald' ? 'emerald-400' : (props.color === 'blue' ? 'blue-400' : (props.color === 'purple' ? 'purple-400' : 'red-400'))} border border-slate-700`}>
                  {props.name}
                </span>
              </h4>
              <div className="h-40 w-full relative">
                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                  {/* Osy */}
                  <line x1="20" y1="130" x2="380" y2="130" stroke="#475569" strokeWidth="1" />
                  <line x1="20" y1="20" x2="20" y2="130" stroke="#475569" strokeWidth="1" />
                  <text x="380" y="145" className="text-[10px] fill-slate-500 text-right" textAnchor="end">Pozice (x)</text>
                  <text x="15" y="15" className="text-[10px] fill-slate-500" transform="rotate(-90, 15, 15)" textAnchor="end">Potenciál (Φ)</text>

                  {/* Výpočet bariéry */}
                  {(() => {
                    const builtIn = diodeType === 'schottky' ? 20 : 40; // Schottky má nižší bariéru
                    const applied = voltage * 15;
                    
                    let barrierHeight: number;
                    let depletionWidth: number;

                    if (isForward) {
                      barrierHeight = Math.max(5, builtIn - applied);
                      depletionWidth = Math.max(5, 20 - applied / 3);
                    } else {
                      // Zenerův průraz - bariéra se při vysokém napětí "zhroutí"
                      if (isZenerBreakdown) {
                        barrierHeight = 5;
                        depletionWidth = 5;
                      } else {
                        barrierHeight = builtIn + applied;
                        depletionWidth = 20 + applied / 2;
                      }
                    }
                    
                    const midX = 200;
                    const leftX = midX - depletionWidth;
                    const rightX = midX + depletionWidth;
                    const bottomY = 110;
                    const topY = bottomY - barrierHeight;

                    return (
                      <>
                        {/* Křivka potenciálu */}
                        <motion.path 
                          animate={{ 
                            d: `M 20 ${bottomY} L ${leftX} ${bottomY} Q ${midX} ${bottomY} ${midX} ${(bottomY + topY) / 2} T ${rightX} ${topY} L 380 ${topY}` 
                          }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          fill="none" 
                          stroke={isZenerBreakdown ? "#a855f7" : (!isForward ? "#ef4444" : (voltage > V_THRESHOLD ? "#fbbf24" : "#3b82f6"))} 
                          strokeWidth="3" 
                        />

                        {/* Fermiho hladina (zjednodušeně) */}
                        <motion.line 
                          animate={{ x1: 20, y1: bottomY, x2: 380, y2: topY }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          stroke="#94a3b8" strokeWidth="1" strokeDasharray="4" opacity="0.3" 
                        />
                        <motion.text 
                          animate={{ y: bottomY - 5 }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          x="25" className="text-[8px] fill-slate-500 italic"
                        >
                          E_F (P)
                        </motion.text>
                        <motion.text 
                          animate={{ y: topY - 5 }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          x="355" className="text-[8px] fill-slate-500 italic"
                        >
                          E_F (N)
                        </motion.text>
                        
                        {/* Indikace bariéry a hradlové vrstvy */}
                        <motion.line 
                          animate={{ x1: midX + 10, x2: midX + 10, y1: bottomY, y2: topY }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          stroke="#94a3b8" strokeWidth="1" strokeDasharray="2"
                        />
                        <motion.text 
                          animate={{ y: (bottomY + topY) / 2 }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          x={midX + 15} className="text-[9px] fill-slate-400 font-bold"
                        >
                          {!isForward ? `U_bi + U_r (${barrierHeight.toFixed(0)} px)` : (voltage > V_THRESHOLD ? 'U_f > U_threshold' : `U_bi - U_f (${barrierHeight.toFixed(0)} px)`)}
                        </motion.text>

                        {/* Hradlová vrstva (W) */}
                        <motion.line 
                          animate={{ x1: leftX, x2: rightX, y1: bottomY + 15, y2: bottomY + 15 }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          stroke="#475569" strokeWidth="1"
                        />
                        <motion.line 
                          animate={{ x1: leftX, x2: leftX, y1: bottomY + 10, y2: bottomY + 20 }} 
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          stroke="#475569" strokeWidth="1" 
                        />
                        <motion.line 
                          animate={{ x1: rightX, x2: rightX, y1: bottomY + 10, y2: bottomY + 20 }} 
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          stroke="#475569" strokeWidth="1" 
                        />
                        <motion.text 
                          animate={{ x: midX }}
                          transition={{ type: "spring", stiffness: 100, damping: 20 }}
                          y={bottomY + 25} className="text-[8px] fill-slate-500 text-center" textAnchor="middle"
                        >
                          Šířka hradlové vrstvy (W)
                        </motion.text>

                        {/* Popisky oblastí */}
                        <text x="60" y="145" className="text-[10px] fill-blue-400 font-bold">P-TYP</text>
                        <text x="320" y="145" className="text-[10px] fill-red-400 font-bold">N-TYP</text>
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400">
                <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                  <p><strong>P-TYP:</strong> Nižší elektrostatický potenciál. Převažují kladné díry.</p>
                </div>
                <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                  <p><strong>N-TYP:</strong> Vyšší elektrostatický potenciál. Převažují záporné elektrony.</p>
                </div>
              </div>
            </div>

            {/* Charakteristika fotodiody (pouze pro fotodiodu) */}
            <AnimatePresence>
              {diodeType === 'photodiode' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-4 overflow-hidden"
                >
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Sun size={14} className="text-cyan-400" /> 
                    Charakteristika fotodiody (Intenzita vs Proud)
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-xs text-slate-400 w-32">Intenzita světla:</label>
                      <input 
                        type="range" min="0" max="100" step="1" value={lightIntensity} 
                        onChange={(e) => setLightIntensity(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <span className="text-xs font-mono text-cyan-400 w-12 text-right">{lightIntensity}%</span>
                    </div>
                    
                    <div className="h-40 bg-slate-950/50 rounded border border-slate-800 relative p-2">
                      <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                        {/* Osy */}
                        <line x1="20" y1="80" x2="380" y2="80" stroke="#334155" strokeWidth="1" />
                        <line x1="20" y1="10" x2="20" y2="80" stroke="#334155" strokeWidth="1" />
                        <text x="380" y="95" className="text-[8px] fill-slate-500" textAnchor="end">Intenzita [%]</text>
                        <text x="15" y="10" className="text-[8px] fill-slate-500" transform="rotate(-90, 15, 10)" textAnchor="end">Proud [mA]</text>
                        
                        {/* Mřížka */}
                        {[20, 40, 60, 80].map(y => (
                          <line key={y} x1="20" y1={y} x2="380" y2={y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                        ))}
                        
                        {/* Aktuální křivka pro dané napětí */}
                        {(() => {
                          const points = [];
                          for (let L = 0; L <= 100; L += 5) {
                            const i = (voltage * 2) + (L / 100) * 40;
                            const x = 20 + (L / 100) * 360;
                            const y = 80 - (i / 100) * 70;
                            points.push(`${x},${y}`);
                          }
                          return <path d={`M ${points.join(' ')}`} fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />;
                        })()}
                        
                        {/* Pracovní bod */}
                        {(() => {
                          const x = 20 + (lightIntensity / 100) * 360;
                          const i = (voltage * 2) + (lightIntensity / 100) * 40;
                          const y = 80 - (i / 100) * 70;
                          return (
                            <motion.circle 
                              animate={{ cx: x, cy: y }}
                              r="4" fill="#ffffff" className="shadow-lg"
                            />
                          );
                        })()}
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      Poznámka: U fotodiody v závěrném směru je proud přímo úměrný intenzitě dopadajícího světla. 
                      Přiložené napětí (U={voltage}V) mírně zvyšuje citlivost.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* I-U Charakteristika a Osciloskop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-4">
                <h4 className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" /> 
                    Voltampérová charakteristika (I-U graf)
                  </div>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-blue-400">U = {isForward ? '' : '-'}{voltage.toFixed(1)} V</span>
                    <span className="text-emerald-400">I ≈ {currentCurrent.toFixed(1)} mA</span>
                  </div>
                </h4>
                
                <div className="h-48 w-full relative bg-slate-950/50 rounded border border-slate-800/50 p-2 group">
                  <svg 
                    viewBox="0 0 400 200" 
                    className="w-full h-full overflow-visible cursor-crosshair"
                    onMouseMove={(e) => {
                      const svg = e.currentTarget;
                      const rect = svg.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 400;
                      
                      // Přepočet X na napětí U
                      // Střed je na 200, měřítko je 35px/V
                      const u = (x - 200) / 35;
                      
                      if (Math.abs(u) <= 5.2) { // Mírně větší rozsah pro plynulost
                        const isFwd = u >= 0;
                        const absU = Math.abs(u);
                        const i = getDiodeCurrent(absU, isFwd);
                        const y = 100 + (isFwd ? -i : i) * 1.5;
                        
                        setHoveredGraphPoint({ u, i, x, y });
                      } else {
                        setHoveredGraphPoint(null);
                      }
                    }}
                    onMouseLeave={() => setHoveredGraphPoint(null)}
                  >
                    {/* Osy */}
                    <line x1="200" y1="10" x2="200" y2="190" stroke="#334155" strokeWidth="1" />
                    <line x1="10" y1="100" x2="390" y2="100" stroke="#334155" strokeWidth="1" />
                    
                    {/* Značky na osách */}
                    <text x="390" y="115" className="text-[8px] fill-slate-500" textAnchor="end">U [V]</text>
                    <text x="210" y="15" className="text-[8px] fill-slate-500">I [mA]</text>

                    {/* Křivka charakteristiky */}
                    {(() => {
                      const points: string[] = [];
                      // Propustný směr (vpravo)
                      for (let v = 0; v <= 5; v += 0.1) {
                        const i = getDiodeCurrent(v, true);
                        const x = 200 + v * 35;
                        const y = 100 - i * 1.5;
                        if (y >= 10) points.push(`${x},${y}`);
                      }
                      const forwardPath = points.join(' ');

                      const reversePoints: string[] = [];
                      // Závěrný směr (vlevo)
                      for (let v = 0; v <= 5; v += 0.1) {
                        const i = getDiodeCurrent(v, false);
                        const x = 200 - v * 35;
                        const y = 100 + i * 1.5;
                        if (y <= 190) reversePoints.push(`${x},${y}`);
                      }
                      const reversePath = reversePoints.join(' ');

                      return (
                        <>
                          {/* Záře pro propustný směr */}
                          <motion.polyline 
                            points={forwardPath} 
                            fill="none" 
                            stroke="#10b981" 
                            animate={{ 
                              strokeWidth: isForward && currentCurrent > 0 ? [2, 5, 2] : 2,
                              opacity: isForward && currentCurrent > 0 ? [0.2, 0.5, 0.2] : 0.1
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            strokeLinecap="round" 
                          />
                          {/* Efekt vlnění/toku proudu (propustný směr) */}
                          {isForward && currentCurrent > 0 && (
                            <motion.polyline 
                              points={forwardPath} 
                              fill="none" 
                              stroke="#ffffff" 
                              strokeWidth="1.5"
                              strokeDasharray="4 16"
                              animate={{ strokeDashoffset: [0, -40] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              strokeLinecap="round"
                              opacity="0.6"
                            />
                          )}
                          <polyline points={forwardPath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                          
                          {/* Záře pro závěrný směr */}
                          <motion.polyline 
                            points={reversePath} 
                            fill="none" 
                            stroke={diodeType === 'zener' ? "#a855f7" : "#ef4444"} 
                            animate={{ 
                              strokeWidth: !isForward && currentCurrent > 0 ? [2, 5, 2] : 2,
                              opacity: !isForward && currentCurrent > 0 ? [0.2, 0.5, 0.2] : 0.1
                            }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            strokeLinecap="round" 
                          />
                          {/* Efekt vlnění/toku proudu (závěrný směr) */}
                          {!isForward && currentCurrent > 0 && (
                            <motion.polyline 
                              points={reversePath} 
                              fill="none" 
                              stroke="#ffffff" 
                              strokeWidth="1.5"
                              strokeDasharray="4 16"
                              animate={{ strokeDashoffset: [0, 40] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              strokeLinecap="round"
                              opacity="0.6"
                            />
                          )}
                          <polyline points={reversePath} fill="none" stroke={diodeType === 'zener' ? "#a855f7" : "#ef4444"} strokeWidth="2" strokeLinecap="round" />
                          
                          {/* Pulzující záře pracovního bodu */}
                          {currentCurrent > 0 && (
                            <motion.circle 
                              animate={{ 
                                cx: 200 + (isForward ? voltage : -voltage) * 35,
                                cy: 100 + (isForward ? -currentCurrent : currentCurrent) * 1.5,
                                r: [4, 10, 4],
                                opacity: [0.1, 0.4, 0.1]
                              }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              fill={isForward ? "#10b981" : (diodeType === 'zener' ? "#a855f7" : "#ef4444")}
                            />
                          )}

                          {/* Aktuální pracovní bod */}
                          <motion.circle 
                            animate={{ 
                              cx: 200 + (isForward ? voltage : -voltage) * 35,
                              cy: 100 + (isForward ? -currentCurrent : currentCurrent) * 1.5
                            }}
                            r="4"
                            fill="#ffffff"
                            className="shadow-lg"
                          />
                          <motion.line 
                            animate={{ 
                              x1: 200 + (isForward ? voltage : -voltage) * 35,
                              x2: 200 + (isForward ? voltage : -voltage) * 35,
                              y1: 100,
                              y2: 100 + (isForward ? -currentCurrent : currentCurrent) * 1.5
                            }}
                            stroke="#ffffff" strokeWidth="1" strokeDasharray="2" opacity="0.3"
                          />

                          {/* Interaktivní bod při najetí myší */}
                          <AnimatePresence>
                            {hoveredGraphPoint && (
                              <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="pointer-events-none"
                              >
                                {/* Zvětšený bod zájmu */}
                                <circle 
                                  cx={hoveredGraphPoint.x} 
                                  cy={hoveredGraphPoint.y} 
                                  r="8" 
                                  fill="none" 
                                  stroke="#ffffff" 
                                  strokeWidth="1.5" 
                                  className="animate-pulse"
                                />
                                <circle 
                                  cx={hoveredGraphPoint.x} 
                                  cy={hoveredGraphPoint.y} 
                                  r="3" 
                                  fill="#ffffff" 
                                />
                                
                                {/* Vodící linky k osám */}
                                <line 
                                  x1={hoveredGraphPoint.x} 
                                  y1="100" 
                                  x2={hoveredGraphPoint.x} 
                                  y2={hoveredGraphPoint.y} 
                                  stroke="#ffffff" 
                                  strokeWidth="0.5" 
                                  strokeDasharray="3,3" 
                                  opacity="0.4" 
                                />
                                <line 
                                  x1="200" 
                                  y1={hoveredGraphPoint.y} 
                                  x2={hoveredGraphPoint.x} 
                                  y2={hoveredGraphPoint.y} 
                                  stroke="#ffffff" 
                                  strokeWidth="0.5" 
                                  strokeDasharray="3,3" 
                                  opacity="0.4" 
                                />
                              </motion.g>
                            )}
                          </AnimatePresence>
                        </>
                      );
                    })()}
                  </svg>

                  {/* Moderní HTML Tooltip */}
                  <AnimatePresence>
                    {hoveredGraphPoint && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        className="absolute z-50 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700 px-2 py-1 rounded shadow-xl text-[9px] font-mono text-white flex flex-col gap-0.5"
                        style={{ 
                          left: `${(hoveredGraphPoint.x / 400) * 100}%`, 
                          top: `${(hoveredGraphPoint.y / 200) * 100}%`,
                          transform: 'translate(10px, -110%)'
                        }}
                      >
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">U:</span>
                          <span className="text-blue-400 font-bold">{hoveredGraphPoint.u.toFixed(2)} V</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">I:</span>
                          <span className="text-emerald-400 font-bold">{hoveredGraphPoint.i.toFixed(1)} mA</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-[10px] text-slate-500 italic text-center">
                  Pracovní bod se pohybuje po charakteristice v závislosti na přiloženém napětí.
                </p>
              </div>

              <div className="space-y-4">
                <Oscilloscope 
                  title="Osciloskop: Průběh proudu v čase"
                  unit="mA"
                  color={isForward ? "#10b981" : (diodeType === 'zener' ? "#a855f7" : "#ef4444")}
                  time={time}
                  height={200}
                  dataFn={(t) => {
                    // Simulujeme mírné kolísání nebo AC složku pro vizualizaci
                    const noise = Math.sin(t / 10) * 2;
                    return Math.max(0, currentCurrent + noise);
                  }}
                />
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-[10px] text-slate-400 italic">
                  Tip: Osciloskop zobrazuje aktuální proud protékající diodou v čase. Změňte napětí sliderem a sledujte reakci trace.
                </div>
              </div>
            </div>

            {/* Analogie: Vodní přehrada */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Waves size={14} className="text-cyan-400" /> 
                Analogie: Vodní přehrada
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-40 bg-slate-950/50 rounded border border-slate-800/50 relative overflow-hidden">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    {/* Voda vlevo (P-typ / Anoda) */}
                    <motion.rect 
                      animate={{ 
                        height: isForward ? 40 + voltage * 10 : 40,
                        y: isForward ? 60 - voltage * 10 : 60
                      }}
                      x="0" width="90" fill="#0ea5e9" opacity="0.6" 
                    />
                    {/* Přehrada (Hradlová vrstva) */}
                    <motion.rect 
                      animate={{ 
                        height: !isForward ? 60 + voltage * 8 : Math.max(10, 60 - voltage * 12),
                        y: !isForward ? 40 - voltage * 8 : Math.min(90, 40 + voltage * 12)
                      }}
                      x="90" width="20" fill="#475569" 
                    />
                    {/* Voda vpravo (N-typ / Katoda) */}
                    <rect x="110" y="80" width="90" height="20" fill="#0ea5e9" opacity="0.3" />
                    
                    {/* Přetékající voda (Proud) */}
                    {isConducting && (
                      <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        d="M 85 40 Q 100 20 115 80"
                        fill="none" stroke="#0ea5e9" strokeWidth="3" strokeDasharray="4 2"
                      />
                    )}

                    <text x="45" y="90" className="text-[8px] fill-white text-center" textAnchor="middle">Anoda (P)</text>
                    <text x="155" y="90" className="text-[8px] fill-white text-center" textAnchor="middle">Katoda (N)</text>
                  </svg>
                </div>
                <div className="text-xs text-slate-400 space-y-2">
                  <p>
                    <strong className="text-cyan-400">Výška přehrady</strong> představuje energetickou bariéru přechodu.
                  </p>
                  <p>
                    <strong className="text-blue-400">Hladina vody</strong> představuje přiložené napětí (tlak).
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-1">
                    <li><strong>Závěrný směr:</strong> Přehrada se zvyšuje, voda nemá šanci protéct.</li>
                    <li><strong>Propustný směr:</strong> Přehrada klesá (nebo hladina stoupá). Jakmile voda přeteče korunu, začne téct proud.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'acdc' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">Jednocestný usměrňovač</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Vstupní AC napětí */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-2">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                  <Zap size={14} className="text-blue-400" /> Vstupní střídavé napětí (AC)
                </h3>
                <div className="h-32 bg-slate-950/50 rounded border border-slate-800 relative p-2">
                  <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                    <path 
                      d="M 0 50 Q 25 0 50 50 Q 75 100 100 50 Q 125 0 150 50 Q 175 100 200 50 Q 225 0 250 50 Q 275 100 300 50 Q 325 0 350 50 Q 375 100 400 50" 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="2" 
                    />
                    <text x="5" y="15" className="text-[8px] fill-slate-500">+U</text>
                    <text x="5" y="95" className="text-[8px] fill-slate-500">-U</text>
                    
                    {/* Časový kurzor */}
                    <motion.line 
                      animate={{ x1: time, x2: time }}
                      y1="0" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2" opacity="0.5"
                    />
                    <motion.circle 
                      animate={{ 
                        cx: time, 
                        cy: 50 - Math.sin((time / 100) * Math.PI * 2) * 40 
                      }}
                      r="3" fill="#3b82f6"
                    />
                  </svg>
                </div>
              </div>

              {/* Výstupní DC napětí */}
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-2">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-300">
                  <Activity size={14} className="text-emerald-400" /> Výstupní usměrněné napětí (DC)
                </h3>
                <div className="h-32 bg-slate-950/50 rounded border border-slate-800 relative p-2">
                  <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                    {/* Usměrněná vlna - jen kladné půlvlny */}
                    <path 
                      d="M 0 50 Q 25 0 50 50 L 100 50 Q 125 0 150 50 L 200 50 Q 225 0 250 50 L 300 50 Q 325 0 350 50 L 400 50" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="3" 
                    />
                    <text x="5" y="15" className="text-[8px] fill-slate-500">+U</text>
                    <text x="5" y="95" className="text-[8px] fill-slate-500">-U</text>
                    
                    {/* Indikace "uříznuté" části */}
                    <path 
                      d="M 50 50 Q 75 100 100 50 M 150 50 Q 175 100 200 50 M 250 50 Q 275 100 300 50 M 350 50 Q 375 100 400 50" 
                      fill="none" 
                      stroke="#ef4444" 
                      strokeWidth="1" 
                      strokeDasharray="2"
                      opacity="0.3"
                    />

                    {/* Časový kurzor */}
                    <motion.line 
                      animate={{ x1: time, x2: time }}
                      y1="0" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2" opacity="0.5"
                    />
                    <motion.circle 
                      animate={{ 
                        cx: time, 
                        cy: (() => {
                          const sin = Math.sin((time / 100) * Math.PI * 2);
                          return sin > 0 ? 50 - sin * 40 : 50;
                        })()
                      }}
                      r="3" fill="#10b981"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <Info size={16} className="text-blue-400 shrink-0" />
                Dioda v tomto zapojení funguje jako ventil: propouští proud pouze tehdy, když je na anodě kladné napětí vůči katodě. Záporná půlvlna je zablokována, což vede k pulzujícímu stejnosměrnému proudu.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'bridge' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Schéma můstku */}
              <div className="flex-1 bg-slate-900 rounded-xl p-6 border border-slate-700 relative min-h-[300px] flex items-center justify-center">
                <div className="relative w-64 h-64 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center">
                  {/* Diody v můstku */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-slate-800 p-1 rounded-md">
                        <div className={`rotate-45 ${acPhase === 1 ? 'text-yellow-400' : 'text-slate-600'}`}>
                            <DiodeSymbol forward={true} conducting={acPhase === 1} label="D1" />
                        </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className="bg-slate-800 p-1 rounded-md">
                        <div className={`rotate-45 ${acPhase === 1 ? 'text-yellow-400' : 'text-slate-600'}`}>
                            <DiodeSymbol forward={true} conducting={acPhase === 1} label="D3" />
                        </div>
                    </div>
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div className="bg-slate-800 p-1 rounded-md">
                        <div className={`-rotate-45 ${acPhase === -1 ? 'text-yellow-400' : 'text-slate-600'}`}>
                            <DiodeSymbol forward={false} conducting={acPhase === -1} label="D4" />
                        </div>
                    </div>
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                    <div className="bg-slate-800 p-1 rounded-md">
                        <div className={`-rotate-45 ${acPhase === -1 ? 'text-yellow-400' : 'text-slate-600'}`}>
                            <DiodeSymbol forward={false} conducting={acPhase === -1} label="D2" />
                        </div>
                    </div>
                  </div>

                  {/* Vstupy a výstupy */}
                  <div className={`absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col items-center ${acPhase === 1 ? 'text-red-500' : 'text-blue-500'}`}>
                    <Zap size={24} />
                    <span className="text-[10px] font-bold">Vstup L1</span>
                  </div>
                  <div className={`absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center ${acPhase === 1 ? 'text-blue-500' : 'text-red-500'}`}>
                    <Zap size={24} />
                    <span className="text-[10px] font-bold">Vstup N</span>
                  </div>
                  <div className="absolute top-[-40px] right-[-40px] text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
                    <span className="font-bold">+</span> <span className="text-[10px]">VÝSTUP</span>
                  </div>
                  <div className="absolute bottom-[-40px] right-[-40px] text-blue-500 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded">
                    <span className="font-bold">-</span> <span className="text-[10px]">VÝSTUP</span>
                  </div>
                </div>
              </div>

              {/* Ovládání a info */}
              <div className="flex-1 space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="text-blue-400" /> Aktuální fáze AC
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAcPhase(1)}
                      className={`flex-1 py-3 rounded-md font-bold transition ${acPhase === 1 ? 'bg-red-600 shadow-lg' : 'bg-slate-700'}`}
                    >
                      Kladná (+)
                    </button>
                    <button 
                      onClick={() => setAcPhase(-1)}
                      className={`flex-1 py-3 rounded-md font-bold transition ${acPhase === -1 ? 'bg-blue-600 shadow-lg' : 'bg-slate-700'}`}
                    >
                      Záporná (-)
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-slate-300 italic">
                    {acPhase === 1 
                      ? "Proud teče přes D1 k zátěži a vrací se přes D3. Výstup je kladný." 
                      : "Proud teče přes D2 k zátěži a vrací se přes D4. Výstup je ZNOVU kladný!"}
                  </p>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 text-xs space-y-2">
                   <p><strong>Proč je to lepší?</strong></p>
                   <ul className="list-disc ml-4 space-y-1">
                     <li>Využívá <strong>obě půlvlny</strong> střídavého proudu.</li>
                     <li>Výsledný proud má <strong>dvojnásobnou frekvenci</strong> kmitů (100 Hz místo 50 Hz).</li>
                     <li>Mnohem lépe se vyhlazuje kondenzátorem.</li>
                   </ul>
                </div>
              </div>
            </div>

            {/* Graf srovnání */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><Activity size={14}/> Výstupní napětí (Full-wave)</h4>
              <div className="h-32 w-full">
                <svg viewBox="0 0 400 100" className="w-full h-full">
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#475569" strokeDasharray="4" />
                  <path 
                    d="M 0 80 Q 25 20 50 80 Q 75 20 100 80 Q 125 20 150 80 Q 175 20 200 80 Q 225 20 250 80 Q 275 20 300 80" 
                    fill="none" stroke="#fbbf24" strokeWidth="3" 
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'combinations' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <ArrowRightLeft className="text-blue-400" /> 
                  {combinationType === 'series' ? 'Sériové zapojení' : 'Paralelní zapojení'}
                </h3>
                
                <div className={`flex ${combinationType === 'series' ? 'flex-row items-center gap-4' : 'flex-col gap-8'}`}>
                  <div className={`flex ${combinationType === 'series' ? 'flex-row items-center gap-4' : 'flex-row gap-12'}`}>
                    <div className="flex flex-col items-center gap-2">
                      <DiodeSymbol forward={isForward} conducting={isConducting} type={diodeType} label="D1" />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {combinationType === 'series' ? `ΔU ≈ ${isConducting ? props.v_threshold : 0}V` : `I ≈ ${isConducting ? (currentCurrent/2).toFixed(1) : 0}mA`}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <DiodeSymbol forward={isForward} conducting={isConducting} type={diodeType} label="D2" />
                      <span className="text-[10px] text-slate-500 font-mono">
                        {combinationType === 'series' ? `ΔU ≈ ${isConducting ? props.v_threshold : 0}V` : `I ≈ ${isConducting ? (currentCurrent/2).toFixed(1) : 0}mA`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-12 w-full pt-6 border-t border-slate-700 flex justify-around text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Celkový úbytek</div>
                    <div className="text-xl font-mono text-blue-400">
                      {combinationType === 'series' 
                        ? (isConducting ? (props.v_threshold * 2).toFixed(1) : "0.0") 
                        : (isConducting ? props.v_threshold.toFixed(1) : "0.0")} V
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Celkový proud</div>
                    <div className="text-xl font-mono text-emerald-400">
                      {isConducting ? currentCurrent.toFixed(1) : "0.0"} mA
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                  <h4 className="text-sm font-bold">Typ zapojení</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCombinationType('series')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold transition ${combinationType === 'series' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      Sériové
                    </button>
                    <button 
                      onClick={() => setCombinationType('parallel')}
                      className={`flex-1 py-2 rounded-md text-xs font-bold transition ${combinationType === 'parallel' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      Paralelní
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                  <label className="block text-sm font-medium flex justify-between w-full">
                    <span>Napětí zdroje:</span>
                    <span className="text-blue-400">{voltage.toFixed(1)} V</span>
                  </label>
                  <input 
                    type="range" min="0" max="5" step="0.1" value={voltage} 
                    onChange={(e) => setVoltage(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/50 text-xs space-y-2">
                  <p><strong>{combinationType === 'series' ? 'Sériové zapojení:' : 'Paralelní zapojení:'}</strong></p>
                  <p className="text-slate-300 leading-relaxed">
                    {combinationType === 'series' 
                      ? "Napětí se sčítá. Aby obvod vedl, musí napětí zdroje překonat součet prahových napětí všech diod." 
                      : "Proud se dělí. Úbytek napětí zůstává stejný jako u jedné diody, ale celkový proud se rozdělí mezi větve."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'filter' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Waves className="text-emerald-400" /> 
                    {filterMode === 'rectified' ? 'Vyhlazování usměrněného napětí' : 'RC Dolní propust (Low Pass)'}
                  </h3>
                  <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setFilterMode('rectified')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${filterMode === 'rectified' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                    >
                      Usměrněný
                    </button>
                    <button 
                      onClick={() => setFilterMode('lowpass')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${filterMode === 'lowpass' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
                    >
                      Čistý RC
                    </button>
                  </div>
                </div>
                
                <div className="h-48 w-full relative mb-8">
                  <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                    {/* Schéma */}
                    <line x1="20" y1="75" x2="80" y2="75" stroke="#475569" strokeWidth="2" />
                    
                    {filterMode === 'rectified' ? (
                      <>
                        <g transform="translate(80, 45) scale(0.8)">
                          <DiodeSymbol forward={true} conducting={acPhase === 1} type={diodeType} />
                        </g>
                        <line x1="160" y1="75" x2="250" y2="75" stroke="#475569" strokeWidth="2" />
                      </>
                    ) : (
                      <>
                        {/* Rezistor v sérii */}
                        <rect x="100" y="65" width="40" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" />
                        <line x1="80" y1="75" x2="100" y2="75" stroke="#475569" strokeWidth="2" />
                        <line x1="140" y1="75" x2="250" y2="75" stroke="#475569" strokeWidth="2" />
                        <text x="110" y="60" className="text-[10px] fill-amber-400 font-bold">{resistance}Ω</text>
                      </>
                    )}
                    
                    {/* Kondenzátor */}
                    <line x1="250" y1="75" x2="250" y2="100" stroke="#475569" strokeWidth="2" />
                    <line x1="235" y1="100" x2="265" y2="100" stroke="#60a5fa" strokeWidth="3" />
                    <line x1="235" y1="110" x2="265" y2="110" stroke="#60a5fa" strokeWidth="3" />
                    <line x1="250" y1="110" x2="250" y2="135" stroke="#475569" strokeWidth="2" />
                    <text x="275" y="110" className="text-[10px] fill-blue-400 font-bold">{capacitance}µF</text>

                    {/* Rezistor (zátěž) - pouze v rectified módu, v lowpass je to výstup */}
                    {filterMode === 'rectified' && (
                      <>
                        <line x1="250" y1="75" x2="350" y2="75" stroke="#475569" strokeWidth="2" />
                        <rect x="340" y="90" width="20" height="40" fill="none" stroke="#fbbf24" strokeWidth="2" />
                        <line x1="350" y1="75" x2="350" y2="90" stroke="#475569" strokeWidth="2" />
                        <line x1="350" y1="130" x2="350" y2="135" stroke="#475569" strokeWidth="2" />
                        <text x="375" y="115" className="text-[10px] fill-amber-400 font-bold">{resistance}Ω</text>
                      </>
                    )}

                    <line x1="20" y1="135" x2="380" y2="135" stroke="#475569" strokeWidth="2" />
                    
                    {/* Animace částic */}
                    <motion.circle 
                      r="3" fill="#fbbf24"
                      animate={filterMode === 'rectified' ? (
                        acPhase === 1 ? { cx: [30, 90, 250, 250], cy: [75, 75, 75, 100] } : { opacity: 0 }
                      ) : {
                        cx: [30, 120, 250, 250],
                        cy: [75, 75, 75, 100],
                        opacity: [1, 1, 1, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  </svg>
                </div>

                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">
                    {filterMode === 'rectified' ? 'Průběh napětí na zátěži' : 'Frekvenční odezva (Vstup vs Výstup)'}
                  </h4>
                  <div className="h-40 w-full">
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#1e293b" />
                      
                      {filterMode === 'rectified' ? (
                        <>
                          {/* Vstupní usměrněné */}
                          <path 
                            d="M 0 90 Q 25 10 50 90 M 100 90 Q 125 10 150 90 M 200 90 Q 225 10 250 90 M 300 90 Q 325 10 350 90" 
                            fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2" 
                          />
                          {/* Vyhlazené napětí */}
                          {(() => {
                            const ripple = 80 / (1 + (capacitance * resistance / 100000));
                            const d = [];
                            for (let x = 0; x <= 400; x += 5) {
                              const phase = (x % 100);
                              let y;
                              if (phase < 50) {
                                y = 90 - 80 * Math.sin((phase / 50) * Math.PI / 2);
                              } else {
                                const t = (phase - 50) / 50;
                                y = (90 - 80) + ripple * t;
                              }
                              d.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                            }
                            return <path d={d.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" />;
                          })()}
                        </>
                      ) : (
                        <>
                          {/* Vstupní AC (Sine) */}
                          {(() => {
                            const d = [];
                            for (let x = 0; x <= 400; x += 2) {
                              const y = 50 - 40 * Math.sin((x / 100) * (inputFrequency / 50) * 2 * Math.PI);
                              d.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                            }
                            return <path d={d.join(' ')} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2" opacity="0.5" />;
                          })()}
                          
                          {/* Výstupní AC (Phase shifted & Attenuated) */}
                          {(() => {
                            const f = inputFrequency;
                            const R = resistance;
                            const C = capacitance / 1000000;
                            const omega = 2 * Math.PI * f;
                            const gain = 1 / Math.sqrt(1 + Math.pow(omega * R * C, 2));
                            const phaseShift = -Math.atan(omega * R * C);
                            
                            const d = [];
                            for (let x = 0; x <= 400; x += 2) {
                              const angle = (x / 100) * (f / 50) * 2 * Math.PI + phaseShift;
                              const y = 50 - 40 * gain * Math.sin(angle);
                              d.push(`${x === 0 ? 'M' : 'L'} ${x} ${y}`);
                            }
                            return <path d={d.join(' ')} fill="none" stroke="#10b981" strokeWidth="2.5" />;
                          })()}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-mono">
                    {filterMode === 'rectified' ? (
                      <>
                        <span className="text-slate-500">Zvlnění (Ripple):</span>
                        <span className="text-emerald-400">{(80 / (1 + (capacitance * resistance / 100000))).toFixed(1)} %</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-500">Útlum (Gain):</span>
                        <span className="text-emerald-400">
                          {(1 / Math.sqrt(1 + Math.pow(2 * Math.PI * inputFrequency * resistance * (capacitance / 1000000), 2))).toFixed(3)}
                        </span>
                        <span className="text-slate-500 ml-4">Fázový posuv:</span>
                        <span className="text-blue-400">
                          {(-Math.atan(2 * Math.PI * inputFrequency * resistance * (capacitance / 1000000)) * (180 / Math.PI)).toFixed(1)}°
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-6">
                {/* Diagnostické zprávy pro Filtr */}
                <AnimatePresence mode="wait">
                  {filterMode === 'rectified' && (80 / (1 + (capacitance * resistance / 100000))) > 30 && (
                    <StatusAlert 
                      alertId="high-ripple-filter"
                      type="warning" 
                      icon={Waves}
                      message="Vysoké zvlnění: Kapacita kondenzátoru nebo odpor zátěže jsou příliš malé pro efektivní vyhlazení. Výstupní napětí výrazně kolísá."
                    />
                  )}
                  {filterMode === 'lowpass' && inputFrequency > (1 / (2 * Math.PI * (resistance * capacitance / 1000000))) && (
                    <StatusAlert 
                      alertId="lowpass-cutoff"
                      type="info" 
                      icon={Info}
                      message="Nad mezní frekvencí: Vstupní signál je filtrem výrazně utlumen. RC článek v tomto režimu funguje jako dolní propust."
                    />
                  )}
                </AnimatePresence>

                {filterMode === 'lowpass' && (
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                    <label className="block text-sm font-medium flex justify-between w-full">
                      <span>Frekvence (f):</span>
                      <span className="text-blue-400">{inputFrequency} Hz</span>
                    </label>
                    <input 
                      type="range" min="1" max="1000" step="1" value={inputFrequency} 
                      onChange={(e) => setInputFrequency(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                  <label className="block text-sm font-medium flex justify-between w-full">
                    <span>Kapacita (C):</span>
                    <span className="text-blue-400">{capacitance} µF</span>
                  </label>
                  <input 
                    type="range" min="1" max="1000" step="1" value={capacitance} 
                    onChange={(e) => setCapacitance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                  <label className="block text-sm font-medium flex justify-between w-full">
                    <span>Odpor (R):</span>
                    <span className="text-amber-400">{resistance} Ω</span>
                  </label>
                  <input 
                    type="range" min="10" max="10000" step="10" value={resistance} 
                    onChange={(e) => setResistance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-800/50 text-xs space-y-2">
                  <p><strong>{filterMode === 'rectified' ? 'Jak to funguje?' : 'RC Dolní propust:'}</strong></p>
                  <p className="text-slate-300 leading-relaxed">
                    {filterMode === 'rectified' 
                      ? "Kondenzátor se během kladné půlvlny nabije na špičkové napětí. Když napětí zdroje klesne, kondenzátor začne dodávat energii do zátěže (vybíjí se)." 
                      : "RC článek funguje jako frekvenční filtr. Nízké frekvence procházejí téměř beze změny, zatímco vysoké frekvence jsou kondenzátorem zkratovány k zemi (útlum)."}
                  </p>
                  <p className="text-slate-400 italic">
                    {filterMode === 'lowpass' && `Mezní frekvence f_c = ${(1 / (2 * Math.PI * resistance * (capacitance / 1000000))).toFixed(1)} Hz`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'power-supply' && (
          <div className="space-y-8">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Zap className="text-yellow-400" /> Kompletní napájecí zdroj
                </h3>
                <div className="flex gap-2">
                  <div className="flex bg-slate-800 p-1 rounded border border-slate-700">
                    <button 
                      onClick={() => setCapacitorFault('none')}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition ${capacitorFault === 'none' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      OK
                    </button>
                    <button 
                      onClick={() => setCapacitorFault('degraded')}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition ${capacitorFault === 'degraded' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      VYSCHLÝ
                    </button>
                    <button 
                      onClick={() => setCapacitorFault('shorted')}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition ${capacitorFault === 'shorted' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      ZKrat
                    </button>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono">
                    <span className="text-slate-500 mr-2">V_OUT:</span>
                    <span className="text-purple-400 font-bold">{capacitorFault === 'shorted' ? '0.0' : zenerVoltage.toFixed(1)} V</span>
                  </div>
                  <div className="px-3 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] font-mono">
                    <span className="text-slate-500 mr-2">RIPPLE:</span>
                    <span className="text-emerald-400 font-bold">
                      {(() => {
                        const effectiveCap = capacitorFault === 'degraded' ? 5 : (capacitorFault === 'shorted' ? 0.1 : capacitance);
                        return (80 / (1 + (effectiveCap * resistance / 50000))).toFixed(1);
                      })()} %
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Blokové schéma zdroje */}
              <div className="relative h-48 w-full mb-8 flex items-center justify-between px-4">
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 800 200">
                    {/* Dráty s animovaným proudem */}
                    <path d="M 50 100 L 750 100" stroke="#1e293b" strokeWidth="4" fill="none" />
                    <path d="M 50 140 L 750 140" stroke="#1e293b" strokeWidth="4" fill="none" />
                    
                    {/* Animované částice proudu */}
                    <motion.path 
                      d="M 50 100 L 750 100" 
                      stroke="#3b82f6" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="10,20"
                      animate={{ strokeDashoffset: [-30, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                    <motion.path 
                      d="M 750 140 L 50 140" 
                      stroke="#3b82f6" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="10,20"
                      animate={{ strokeDashoffset: [0, -30] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      opacity="0.5"
                    />
                  </svg>
                </div>

                {/* Jednotlivé bloky s interakcí */}
                {[
                  { id: 'source', icon: Activity, color: 'blue', label: 'AC Zdroj', desc: 'Vstupní střídavé napětí 230V/50Hz (zde transformované na 5V).' },
                  { id: 'rectifier', icon: RefreshCw, color: 'emerald', label: 'Usměrňovač', desc: 'Graetzův můstek, který překlápí záporné půlvlny na kladné.' },
                  { id: 'filter', icon: 'filter', color: 'cyan', label: 'Filtr (C)', desc: 'Kondenzátor, který vyrovnává kolísání napětí dodáváním energie.' },
                  { id: 'stabilizer', icon: ShieldAlert, color: 'purple', label: 'Stabilizátor', desc: 'Zenerova dioda, která ořezává špičky a udržuje přesné napětí.' },
                  { id: 'load', icon: Lightbulb, color: 'amber', label: 'Zátěž (R)', desc: 'Spotřebič, který využívá stabilizované stejnosměrné napětí.' }
                ].map((block) => (
                  <motion.div 
                    key={block.id}
                    className="z-10 flex flex-col items-center gap-2 group cursor-help"
                    onMouseEnter={() => setHoveredSupplyBlock(block.id)}
                    onMouseLeave={() => setHoveredSupplyBlock(null)}
                    whileHover={{ scale: 1.1 }}
                    animate={block.id === 'filter' && capacitorFault !== 'none' ? {
                      x: [0, -2, 2, -2, 2, 0],
                      transition: { repeat: Infinity, duration: 0.2 }
                    } : {}}
                  >
                    <motion.div 
                      className={`w-16 h-16 bg-slate-800 border-2 ${block.id === 'filter' && capacitorFault !== 'none' ? '' : `border-${block.color}-500`} rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-${block.color}-500/20 relative`}
                      animate={block.id === 'filter' && capacitorFault !== 'none' ? {
                        backgroundColor: capacitorFault === 'shorted' ? ["#1e293b", "#7f1d1d", "#1e293b"] : ["#1e293b", "#431407", "#1e293b"],
                        borderColor: capacitorFault === 'shorted' ? ["#ef4444", "#ffffff", "#ef4444"] : ["#f97316", "#ffffff", "#f97316"],
                        boxShadow: capacitorFault === 'shorted' 
                          ? ["0 0 0px #ef4444", "0 0 20px #ef4444", "0 0 0px #ef4444"] 
                          : ["0 0 0px #f97316", "0 0 15px #f97316", "0 0 0px #f97316"],
                        transition: { repeat: Infinity, duration: 0.8 }
                      } : {}}
                    >
                      {block.id === 'filter' && capacitorFault !== 'none' && (
                        <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 z-20">
                          <ShieldAlert size={12} className="text-white" />
                        </div>
                      )}
                      {block.id === 'filter' ? (
                        <div className="flex flex-col gap-0.5">
                          <div className={`w-8 h-1 ${capacitorFault !== 'none' ? 'bg-red-400' : 'bg-cyan-400'}`}></div>
                          <div className={`w-8 h-1 ${capacitorFault !== 'none' ? 'bg-red-400' : 'bg-cyan-400'}`}></div>
                        </div>
                      ) : (
                        <block.icon 
                          className={block.id === 'load' ? 'text-amber-400' : `text-${block.color}-400`} 
                          size={24}
                          style={block.id === 'load' ? {
                            filter: `drop-shadow(0 0 ${Math.max(0, (capacitorFault === 'shorted' ? 0 : zenerVoltage - 1) * 3)}px #fbbf24)`,
                            opacity: capacitorFault === 'shorted' ? 0.2 : 0.5 + (zenerVoltage / 5) * 0.5
                          } : {}}
                        />
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-bold uppercase ${hoveredSupplyBlock === block.id ? `text-${block.color}-400` : 'text-slate-500'} transition-colors`}>
                      {block.label}
                    </span>
                    
                    {/* Tooltip pro blok */}
                    <AnimatePresence>
                      {hoveredSupplyBlock === block.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -bottom-16 w-48 bg-slate-800 border border-slate-700 p-2 rounded shadow-2xl z-50 text-[10px] text-slate-300 text-center leading-tight"
                        >
                          {block.desc}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Diagnostické zprávy pro Zdroj */}
              <AnimatePresence mode="wait">
                {capacitorFault !== 'none' && (
                  <div className="mb-8">
                    {capacitorFault === 'shorted' ? (
                      <StatusAlert 
                        alertId="cap-short"
                        type="error" 
                        icon={AlertTriangle}
                        message="KRITICKÁ PORUCHA: Kondenzátor je ve zkratu. Veškerý proud z usměrňovače teče přímo do země. Výstupní napětí je nulové, hrozí přetížení transformátoru a nevratné poškození zdroje."
                      />
                    ) : (
                      <StatusAlert 
                        alertId="cap-degraded"
                        type="warning" 
                        icon={ShieldAlert}
                        message="VAROVÁNÍ: Kondenzátor má sníženou kapacitu (vyschlý elektrolyt). Filtrace je nedostatečná, což způsobuje vysoké zvlnění napětí. Připojená elektronika může vykazovat chyby nebo bzučet."
                      />
                    )}
                  </div>
                )}
              </AnimatePresence>

              {/* Grafy průběhů s plnohodnotným osciloskopem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Oscilloscope 
                  title="Osciloskop: Filtrované napětí (Ripple)"
                  unit="V"
                  color="#06b6d4"
                  time={time}
                  dataFn={(t) => {
                    if (capacitorFault === 'shorted') return 0;
                    const effectiveCap = capacitorFault === 'degraded' ? 5 : (capacitorFault === 'shorted' ? 0.1 : capacitance);
                    const ripple = 80 / (1 + (effectiveCap * resistance / 50000));
                    const phase = (t % 100);
                    if (phase < 50) {
                      return 80 * Math.sin((phase / 50) * Math.PI / 2);
                    } else {
                      const tRel = (phase - 50) / 50;
                      return 80 - ripple * tRel;
                    }
                  }}
                />

                <Oscilloscope 
                  title="Osciloskop: Stabilizované napětí (Zener)"
                  unit="V"
                  color="#a855f7"
                  time={time}
                  dataFn={(t) => {
                    if (capacitorFault === 'shorted') return 0;
                    const effectiveCap = capacitorFault === 'degraded' ? 5 : (capacitorFault === 'shorted' ? 0.1 : capacitance);
                    const ripple = 80 / (1 + (effectiveCap * resistance / 50000));
                    const zenerY = (zenerVoltage / 5) * 80;
                    const phase = (t % 100);
                    let filteredY;
                    if (phase < 50) {
                      filteredY = 80 * Math.sin((phase / 50) * Math.PI / 2);
                    } else {
                      const tRel = (phase - 50) / 50;
                      filteredY = 80 - ripple * tRel;
                    }
                    return Math.min(filteredY, zenerY);
                  }}
                />
              </div>
            </div>

            {/* Živý stavový panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Vstupní AC', value: '5.0 V', sub: '50 Hz', color: 'blue' },
                { label: 'Usměrněné', value: '4.3 V', sub: '100 Hz', color: 'emerald' },
                { 
                  label: 'Filtrované', 
                  value: capacitorFault === 'shorted' ? '0.0 V' : `${(4.3 - (80 / (1 + ((capacitorFault === 'degraded' ? 5 : capacitance) * resistance / 50000)))/20).toFixed(1)} V`, 
                  sub: capacitorFault === 'shorted' ? 'ZKrat' : `Zvlnění: ${(80 / (1 + ((capacitorFault === 'degraded' ? 5 : capacitance) * resistance / 50000))).toFixed(1)}%`, 
                  color: 'cyan' 
                },
                { 
                  label: 'Stabilizované', 
                  value: capacitorFault === 'shorted' ? '0.0 V' : `${zenerVoltage.toFixed(1)} V`, 
                  sub: capacitorFault === 'shorted' ? 'BEZ NAPĚTÍ' : 'Čisté DC', 
                  color: 'purple' 
                }
              ].map((stat, i) => (
                <div key={i} className={`bg-slate-900/80 p-3 rounded-lg border transition-colors duration-300 flex flex-col items-center text-center ${stat.label === 'Stabilizované' && capacitorFault !== 'none' ? 'border-red-900/50 bg-red-900/10' : 'border-slate-800'}`}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase mb-1">{stat.label}</span>
                  <span className={`text-lg font-mono font-bold text-${stat.color}-400`}>{stat.value}</span>
                  <span className={`text-[8px] ${stat.label === 'Stabilizované' && capacitorFault !== 'none' ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                    {stat.label === 'Stabilizované' && capacitorFault !== 'none' ? (capacitorFault === 'shorted' ? '!!! ZKRAT !!!' : '!!! NESTABILNÍ !!!') : stat.sub}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase">Filtrace (C)</label>
                <div className="flex justify-between text-xs mb-1">
                  <span>Kapacita:</span>
                  <span className="text-cyan-400 font-mono">{capacitance} µF</span>
                </div>
                <input 
                  type="range" min="10" max="1000" step="10" value={capacitance} 
                  onChange={(e) => setCapacitance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase">Stabilizace (Uz)</label>
                <div className="flex justify-between text-xs mb-1">
                  <span>Zenerovo napětí:</span>
                  <span className="text-purple-400 font-mono">{zenerVoltage.toFixed(1)} V</span>
                </div>
                <input 
                  type="range" min="1" max="4.5" step="0.1" value={zenerVoltage} 
                  onChange={(e) => setZenerVoltage(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase">Zátěž (R)</label>
                <div className="flex justify-between text-xs mb-1">
                  <span>Odpor zátěže:</span>
                  <span className="text-amber-400 font-mono">{resistance} Ω</span>
                </div>
                <input 
                  type="range" min="100" max="5000" step="100" value={resistance} 
                  onChange={(e) => setResistance(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            <div className="bg-blue-900/10 p-6 rounded-xl border border-blue-800/30">
              <h4 className="font-bold text-blue-300 mb-4 flex items-center gap-2">
                <Info size={18} /> Jak funguje tento řetězec?
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300 leading-relaxed">
                <div className="space-y-3">
                  <p>
                    <strong className="text-emerald-400">1. Usměrnění:</strong> Graetzův můstek překlopí záporné půlvlny střídavého napětí na kladné. Napětí už nemění polaritu, ale stále silně kolísá (pulzuje).
                  </p>
                  <p>
                    <strong className="text-cyan-400">2. Filtrace:</strong> Kondenzátor funguje jako malý akumulátor. Nabije se na maximum a během poklesu napětí dodává energii zátěži, čímž "vyhlazuje" propady.
                  </p>
                </div>
                <div className="space-y-3">
                  <p>
                    <strong className="text-purple-400">3. Stabilizace:</strong> Zenerova dioda v závěrném směru ořeže zbývající zvlnění. Pokud je napětí nad její prahovou hodnotou ($U_z$), udržuje na výstupu konstantní hladinu.
                  </p>
                  <p className={capacitorFault !== 'none' ? "text-red-400 font-bold animate-pulse" : ""}>
                    <strong className="text-amber-400">4. Výsledek:</strong> {capacitorFault === 'shorted' 
                      ? "KRITICKÁ CHYBA! Kondenzátor je ve zkratu. Veškerý proud teče do země, výstupní napětí je nulové a hrozí poškození usměrňovače nebo transformátoru."
                      : (capacitorFault === 'degraded' 
                        ? "POZOR! Kvůli vadnému kondenzátoru napětí klesá pod úroveň stabilizace. Výstupní napětí pulzuje a zařízení může bzučet nebo se restartovat." 
                        : "Na zátěži máme čisté stejnosměrné napětí, které je odolné vůči kolísání vstupu i změnám zátěže.")
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'test' && (
          <Quiz />
        )}
      </main>
    </div>
  );
}
