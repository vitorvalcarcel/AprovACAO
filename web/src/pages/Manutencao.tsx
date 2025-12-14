import { useEffect, useState } from 'react';
import { ServerCrash, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Manutencao() {
  const [segundos, setSegundos] = useState(0);
  const [servidorOffline, setServidorOffline] = useState(false);

  useEffect(() => {
    // Timer para contar o tempo de espera
    const timer = setInterval(() => {
      setSegundos(s => {
        const novoTempo = s + 1;
        // 4 minutos = 240 segundos
        if (novoTempo >= 240) {
          setServidorOffline(true);
        }
        return novoTempo;
      });
    }, 1000);

    // Polling para verificar o servidor
    const verificarServidor = async () => {
      try {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/actuator/health`;
        const res = await fetch(url);
        
        if (res.status === 200) {
          window.location.href = '/app';
        }
      } catch (error) {
        console.log("Aguardando servidor...");
      }
    };

    const polling = setInterval(verificarServidor, 5000); // Verifica a cada 5s
    verificarServidor(); // Verifica imediatamente

    return () => {
      clearInterval(timer);
      clearInterval(polling);
    };
  }, []);

  const formatarTempo = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 flex flex-col items-center gap-6 animate-fade-in">
        
        {servidorOffline ? (
          // ESTADO: CRÍTICO (Passou de 4min)
          <>
            <div className="bg-red-100 p-6 rounded-full text-red-600 animate-bounce">
              <AlertTriangle size={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Servidor Fora do Ar</h1>
              <p className="text-gray-500">
                O tempo limite de conexão excedeu. O servidor pode estar desligado ou em manutenção profunda.
              </p>
            </div>
            <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg text-sm font-bold">
              Tempo decorrido: {formatarTempo(segundos)}
            </div>
          </>
        ) : (
          // ESTADO: ACORDANDO (Menos de 4min)
          <>
            <div className="bg-orange-100 p-6 rounded-full text-orange-600 animate-pulse">
              <ServerCrash size={64} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Iniciando Servidor...</h1>
              <p className="text-gray-500">
                Estamos ligando os motores. Isso pode levar alguns minutos se o sistema estava em repouso.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              <Loader2 className="animate-spin" size={18} />
              Aguardando resposta ({formatarTempo(segundos)})
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Não feche esta página. Redirecionaremos você automaticamente.
        </p>

        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-gray-400 hover:text-blue-600 flex items-center gap-1 text-xs transition-colors"
        >
          <RefreshCw size={12} /> Forçar recarregamento
        </button>
      </div>
    </div>
  );
}