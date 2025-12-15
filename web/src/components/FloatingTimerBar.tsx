import { useState } from 'react';
import { Play, Pause, X, Maximize2, AlertTriangle } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import Modal from './Modal';

interface Props {
  onMaximize: () => void;
}

export default function FloatingTimerBar({ onMaximize }: Props) {
  const { isActive, isPaused, seconds, timerData, pauseTimer, resumeTimer, stopTimer } = useTimer();
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  const formatarTempo = (total: number) => {
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  if (!isActive) return null;

  return (
    <>
      <div 
        className="fixed z-40 left-4 right-4 bg-gray-900 text-white rounded-xl shadow-2xl flex items-center justify-between p-3 border border-gray-700 animate-fade-in-up bottom-[90px] lg:bottom-8 lg:right-8 lg:left-auto lg:w-96 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={onMaximize}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isPaused ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-gray-400 font-bold uppercase truncate max-w-[150px]">
              {timerData.materiaNome || "Selecionar Matéria..."}
            </span>
            <div className="font-mono text-lg font-bold leading-none flex items-center gap-2">
              {formatarTempo(seconds)}
              {isPaused && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded">PAUSADO</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {isPaused ? (
            <button onClick={resumeTimer} className="p-2 hover:bg-gray-700 rounded-full text-green-400 transition-colors">
              <Play size={20} fill="currentColor" />
            </button>
          ) : (
            <button onClick={pauseTimer} className="p-2 hover:bg-gray-700 rounded-full text-yellow-400 transition-colors">
              <Pause size={20} fill="currentColor" />
            </button>
          )}

          <button onClick={onMaximize} className="p-2 hover:bg-gray-700 rounded-full text-blue-400 transition-colors hidden sm:block" title="Expandir">
            <Maximize2 size={18} />
          </button>

          <button onClick={() => setConfirmarDescarte(true)} className="p-2 hover:bg-red-900/50 rounded-full text-red-400 transition-colors ml-1">
            <X size={20} />
          </button>
        </div>
      </div>

      {confirmarDescarte && (
        <Modal isOpen={true} onClose={() => setConfirmarDescarte(false)} title="Descartar Estudo?">
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg flex gap-3 items-start text-red-800">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-sm">Tem certeza?</p>
                <p className="text-sm mt-1">Isso irá parar o cronômetro e apagar o tempo registrado ({formatarTempo(seconds)}).</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmarDescarte(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={() => { stopTimer(); setConfirmarDescarte(false); }} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">Sim, Descartar</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}