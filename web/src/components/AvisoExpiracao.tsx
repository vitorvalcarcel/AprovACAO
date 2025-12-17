import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';

export default function AvisoExpiracao() {
  const navigate = useNavigate();
  const [minutosRestantes, setMinutosRestantes] = useState<number | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const verificarExpiracao = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setVisivel(false);
        return;
      }

      try {
        const payloadBase64 = token.split('.')[1];
        const payloadDecoded = JSON.parse(atob(payloadBase64));
        const exp = payloadDecoded.exp;

        if (!exp) return;

        const agora = Math.floor(Date.now() / 1000);
        const diffSegundos = exp - agora;
        const diffMinutos = Math.floor(diffSegundos / 60);

        setMinutosRestantes(diffMinutos);

        if (diffMinutos <= 120) {
          setVisivel(true);
        } else {
          setVisivel(false);
        }

      } catch (error) {
        console.error("Erro ao verificar token", error);
        setVisivel(false);
      }
    };

    verificarExpiracao();
    const intervalo = setInterval(verificarExpiracao, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  if (!visivel || minutosRestantes === null) return null;

  const isCritico = minutosRestantes <= 30;
  const isExpirado = minutosRestantes <= 0;

  let corFundo = 'bg-yellow-50 border-yellow-200';
  let corTexto = 'text-yellow-800';
  let icone = <Clock className="text-yellow-600" size={20} />;
  
  let tempoFormatado = `${minutosRestantes} min`;
  if (minutosRestantes > 60) {
    const h = Math.floor(minutosRestantes / 60);
    const m = minutosRestantes % 60;
    tempoFormatado = `${h}h ${m}min`;
  }
  
  let mensagem = `Sua sessão expira em ${tempoFormatado}.`;

  if (isCritico) {
    corFundo = 'bg-red-50 border-red-200 animate-pulse';
    corTexto = 'text-red-800';
    icone = <AlertTriangle className="text-red-600" size={20} />;
    mensagem = "Atenção: Salve seu estudo! Sessão acabando.";
  }

  if (isExpirado) {
    corFundo = 'bg-red-100 border-red-300';
    corTexto = 'text-red-900 font-bold';
    mensagem = "Sessão expirada. Entre novamente.";
  }

  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-xl border ${corFundo} transition-all duration-300 animate-slide-down`}>
      <div className="shrink-0">
        {icone}
      </div>
      
      <div className="flex-1 text-center md:text-left whitespace-nowrap">
        <p className={`text-sm ${corTexto}`}>{mensagem}</p>
      </div>

      <button 
        onClick={handleLogout}
        className="px-3 py-1.5 bg-white/80 border border-gray-200 text-gray-600 text-xs font-bold rounded-full hover:bg-white hover:text-red-600 transition-colors flex items-center gap-1 shrink-0"
      >
        <LogOut size={12} />
        {isExpirado ? "Entrar" : "Sair"}
      </button>
    </div>
  );
}