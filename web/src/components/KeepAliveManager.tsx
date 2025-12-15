import { useEffect } from 'react';
import api from '../services/api';

export default function KeepAliveManager() {
  useEffect(() => {
    const pingServer = async () => {
      try {
        // Faz uma requisição leve apenas para dizer ao servidor "estou aqui"
        await api.get('/actuator/health');
      } catch (error) {
        // Erros aqui são ignorados silenciosamente ou tratados pelo api.ts
        // O importante é tentar fazer a requisição
      }
    };

    // O Free Tier do Render/Heroku dorme após 15 minutos de inatividade.
    // Vamos pingar a cada 9 minutos (540000 ms) para garantir.
    const interval = setInterval(pingServer, 540000); 

    return () => clearInterval(interval);
  }, []);

  // Componente funcional puro, não renderiza nada visual
  return null;
}