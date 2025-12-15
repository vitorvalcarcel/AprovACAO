import { createContext, useContext, useState, useEffect, type ReactNode, useRef, useCallback, useMemo } from 'react';

// --- TIPOS ---
interface TimerData {
  materiaId?: string;
  materiaNome?: string;
  topicoId?: string;
  tipoEstudoId?: string;
}

interface PersistentState {
  isActive: boolean;
  isPaused: boolean;
  accumulatedTime: number;
  lastStartTime: number | null;
  data: TimerData;
}

// Contexto 1: ESTADO E AÇÕES (Estável)
interface TimerStateContextData {
  isActive: boolean;
  isPaused: boolean;
  timerData: TimerData;
  startTimer: (data?: TimerData) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTimerData: (data: Partial<TimerData>) => void;
  getCurrentSeconds: () => number; // Nova função para pegar o tempo sem re-renderizar
}

// Contexto 2: TEMPO (Volátil)
interface TimerTickContextData {
  seconds: number;
}

const TimerStateContext = createContext<TimerStateContextData>({} as TimerStateContextData);
const TimerTickContext = createContext<TimerTickContextData>({} as TimerTickContextData);

const STORAGE_KEY = 'aprovacao_timer_v2';

export function TimerProvider({ children }: { children: ReactNode }) {
  // --- LÓGICA DE ESTADO ---
  const [state, setState] = useState<PersistentState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) { return { isActive: false, isPaused: false, accumulatedTime: 0, lastStartTime: null, data: {} }; }
    }
    return { isActive: false, isPaused: false, accumulatedTime: 0, lastStartTime: null, data: {} };
  });

  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Helper de cálculo (Puro)
  const calcularSegundosReais = useCallback((current: PersistentState) => {
    if (!current.isActive) return 0;
    if (current.isPaused) return current.accumulatedTime;
    const agora = Date.now();
    const inicio = current.lastStartTime || agora;
    const decorrido = Math.floor((agora - inicio) / 1000);
    return current.accumulatedTime + decorrido;
  }, []);

  // Persistência
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Tick do Relógio (Visual)
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      setSeconds(calcularSegundosReais(state)); 
      intervalRef.current = window.setInterval(() => {
        setSeconds(calcularSegundosReais(state));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(state.accumulatedTime);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.isActive, state.isPaused, state.accumulatedTime, state.lastStartTime, calcularSegundosReais]);

  // --- ACTIONS ---
  const startTimer = useCallback((data: TimerData = {}) => {
    setState({ isActive: true, isPaused: false, accumulatedTime: 0, lastStartTime: Date.now(), data });
  }, []);

  const pauseTimer = useCallback(() => {
    setState(prev => {
      const agora = Date.now();
      const inicio = prev.lastStartTime || agora;
      return {
        ...prev,
        isPaused: true,
        accumulatedTime: prev.accumulatedTime + Math.floor((agora - inicio) / 1000),
        lastStartTime: null
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false, lastStartTime: Date.now() }));
  }, []);
  
  const stopTimer = useCallback(() => {
    setState({ isActive: false, isPaused: false, accumulatedTime: 0, lastStartTime: null, data: {} });
    setSeconds(0);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateTimerData = useCallback((newData: Partial<TimerData>) => {
    setState(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
  }, []);

  // Função para obter segundos sob demanda (sem reatividade automática no componente consumidor)
  const getCurrentSeconds = useCallback(() => {
    return calcularSegundosReais(state);
  }, [state, calcularSegundosReais]);

  // MEMOIZAÇÃO CRÍTICA: 
  // O objeto value só muda se 'state' mudar. Não muda quando 'seconds' muda.
  const stateContextValue = useMemo(() => ({
    isActive: state.isActive,
    isPaused: state.isPaused,
    timerData: state.data,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    updateTimerData,
    getCurrentSeconds
  }), [state, startTimer, pauseTimer, resumeTimer, stopTimer, updateTimerData, getCurrentSeconds]);

  return (
    <TimerStateContext.Provider value={stateContextValue}>
      <TimerTickContext.Provider value={{ seconds }}>
        {children}
      </TimerTickContext.Provider>
    </TimerStateContext.Provider>
  );
}

// --- HOOKS ---

export function useTimerState() {
  const context = useContext(TimerStateContext);
  if (!context) throw new Error('useTimerState deve ser usado dentro de um TimerProvider');
  return context;
}

export function useTimerSeconds() {
  const context = useContext(TimerTickContext);
  if (!context) throw new Error('useTimerSeconds deve ser usado dentro de um TimerProvider');
  return context;
}

// Legado (evite usar se não precisar dos segundos reativos)
export function useTimer() {
  const state = useTimerState();
  const tick = useTimerSeconds();
  return { ...state, ...tick };
}