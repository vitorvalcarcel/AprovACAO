import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from 'react';

// Dados opcionais para permitir iniciar sem matéria
interface TimerData {
  materiaId?: string;
  materiaNome?: string;
  topicoId?: string;
  tipoEstudoId?: string;
}

interface PersistentState {
  isActive: boolean;
  isPaused: boolean;
  accumulatedTime: number; // Tempo acumulado em segundos (banco de horas)
  lastStartTime: number | null; // Timestamp de quando iniciou/retomou pela última vez
  data: TimerData;
}

interface TimerContextData {
  isActive: boolean;
  isPaused: boolean;
  seconds: number;
  timerData: TimerData;
  startTimer: (data?: TimerData) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  updateTimerData: (data: Partial<TimerData>) => void;
}

const TimerContext = createContext<TimerContextData>({} as TimerContextData);

const STORAGE_KEY = 'aprovacao_timer_v2';

export function TimerProvider({ children }: { children: ReactNode }) {
  
  // 1. ESTADO LÓGICO (A "Verdade" do sistema)
  // Usamos Lazy Initialization: Lemos o storage ANTES de criar o estado.
  // Isso impede que o estado nasça "vazio" e sobrescreva o storage.
  const [state, setState] = useState<PersistentState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Erro ao restaurar timer", e);
        return { isActive: false, isPaused: false, accumulatedTime: 0, lastStartTime: null, data: {} };
      }
    }
    // Estado inicial padrão se não houver nada salvo
    return { isActive: false, isPaused: false, accumulatedTime: 0, lastStartTime: null, data: {} };
  });

  // Função Pura para calcular o tempo real (usada na renderização)
  const calcularSegundosReais = (current: PersistentState) => {
    if (!current.isActive) return 0;
    if (current.isPaused) return current.accumulatedTime;
    
    const agora = Date.now();
    // Se não tiver lastStartTime (erro de integridade), usa agora para não dar salto gigante
    const inicio = current.lastStartTime || agora; 
    const decorridoDesdeUltimoStart = Math.floor((agora - inicio) / 1000);
    
    return current.accumulatedTime + decorridoDesdeUltimoStart;
  };

  // 2. ESTADO VISUAL (Segundos na tela)
  // Também inicializa já calculado para não piscar "00:00:00"
  const [seconds, setSeconds] = useState(() => calcularSegundosReais(state));
  
  const intervalRef = useRef<number | null>(null);

  // 3. PERSISTÊNCIA: Salva no localStorage sempre que o STATE mudar (Ações do usuário)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // 4. TICK VISUAL: Atualiza a cada segundo, mas baseando-se no timestamp (precisão absoluta)
  useEffect(() => {
    if (state.isActive && !state.isPaused) {
      // Atualiza imediatamente ao montar/retomar para instant feedback
      setSeconds(calcularSegundosReais(state));

      intervalRef.current = window.setInterval(() => {
        setSeconds(calcularSegundosReais(state));
      }, 1000);
    } else {
      // Se pausado ou parado, garante que o valor estático esteja correto e limpa intervalo
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(state.accumulatedTime);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.isPaused, state.accumulatedTime, state.lastStartTime]);

  // --- ACTIONS ---

  const startTimer = (data: TimerData = {}) => {
    setState({
      isActive: true,
      isPaused: false,
      accumulatedTime: 0,
      lastStartTime: Date.now(),
      data
    });
  };

  const pauseTimer = () => {
    setState(prev => {
      // Ao pausar, consolidamos o tempo decorrido no "banco de horas" (accumulatedTime)
      const agora = Date.now();
      const inicio = prev.lastStartTime || agora;
      const decorrido = Math.floor((agora - inicio) / 1000);
      
      return {
        ...prev,
        isPaused: true,
        accumulatedTime: prev.accumulatedTime + decorrido,
        lastStartTime: null // Resetamos o marco temporal pois parou de correr
      };
    });
  };

  const resumeTimer = () => {
    setState(prev => ({
      ...prev,
      isPaused: false,
      lastStartTime: Date.now() // Cria novo marco temporal
    }));
  };
  
  const stopTimer = () => {
    setState({
      isActive: false,
      isPaused: false,
      accumulatedTime: 0,
      lastStartTime: null,
      data: {}
    });
    setSeconds(0);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateTimerData = (newData: Partial<TimerData>) => {
    setState(prev => ({ ...prev, data: { ...prev.data, ...newData } }));
  };

  return (
    <TimerContext.Provider value={{
      isActive: state.isActive,
      isPaused: state.isPaused,
      seconds,
      timerData: state.data,
      startTimer, pauseTimer, resumeTimer, stopTimer, updateTimerData
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer deve ser usado dentro de um TimerProvider');
  return context;
}