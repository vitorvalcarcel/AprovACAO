import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ServerCrash, Loader2, RefreshCw, AlertTriangle, Lightbulb } from 'lucide-react';
import axios from 'axios';

export default function MaintenanceOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [servidorOffline, setServidorOffline] = useState(false);

  useEffect(() => {
    const handleMaintenanceEvent = () => {
      if (!isVisible) {
        setIsVisible(true);
        setSegundos(0);
        setServidorOffline(false);
      }
    };
    
    window.addEventListener('maintenance-event', handleMaintenanceEvent);
    return () => window.removeEventListener('maintenance-event', handleMaintenanceEvent);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setSegundos(s => {
        const novoTempo = s + 1;
        if (novoTempo >= 240) {
          setServidorOffline(true);
        }
        return novoTempo;
      });
    }, 1000);

    const checkConnection = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        await axios.get(`${baseUrl}/actuator/health`, { timeout: 5000 });
        
        setIsVisible(false);
        setSegundos(0);
        setServidorOffline(false);
      } catch (error) {
      }
    };

    const polling = setInterval(checkConnection, 5000);
    checkConnection();

    return () => {
      clearInterval(timer);
      clearInterval(polling);
    };
  }, [isVisible]);

  const formatarTempo = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in transition-all duration-500">
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border border-gray-100 flex flex-col items-center gap-6 animate-scale-in relative">
        
        {servidorOffline ? (
          <>
            <div className="bg-red-100 p-6 rounded-full text-red-600 animate-bounce">
              <AlertTriangle size={64} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Servidor Fora do Ar</h1>
              <p className="text-gray-500">
                O tempo limite excedeu. O servidor pode estar em manutenção profunda.
              </p>
            </div>
            <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm font-bold">
              Tempo decorrido: {formatarTempo(segundos)}
            </div>
          </>
        ) : (
          <>
            <div className="bg-orange-100 p-6 rounded-full text-orange-600 animate-pulse">
              <ServerCrash size={64} />
            </div>
            
            <div className="text-center space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Iniciando Servidor...</h1>
                <p className="text-gray-500">Estamos ligando os motores 🚀</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
                <div className="flex gap-2 items-start mb-1">
                  <Lightbulb size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    Para manter o app <strong>100% gratuito para todos</strong>, utilizamos servidores de alta eficiência que "dormem" quando não estão em uso.
                  </p>
                </div>
                <p className="text-[11px] text-blue-600 pl-6 leading-relaxed">
                   Por isso, essa inicialização pode levar <strong>alguns minutos</strong>. Agradecemos muito sua paciência!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium border border-gray-100">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              Aguardando resposta ({formatarTempo(segundos)})
            </div>
          </>
        )}

        <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-blue-500 w-1/3 animate-progress origin-left"></div>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-xs transition-colors"
        >
          <RefreshCw size={12} /> Tentar recarregar a página
        </button>
      </div>
    </div>,
    document.body
  );
}