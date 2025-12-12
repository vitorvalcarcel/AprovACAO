import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function ConfirmarConta() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const confirmar = async () => {
      try {
        // Chama API de confirmação
        // O backend retorna o JWT diretamente (Magic Link)
        const response = await api.post(`/usuarios/confirmar-email?token=${token}`);
        
        const jwt = response.data.token;
        localStorage.setItem('token', jwt);
        
        setStatus('success');
        
        // Redireciona para o App em 2 segundos
        setTimeout(() => navigate('/app'), 2000);

      } catch (error) {
        console.error(error);
        setStatus('error');
      }
    };

    confirmar();
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-10 text-center">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-700">Validando sua conta...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Conta Ativada!</h2>
            <p className="text-gray-500">Redirecionando para o seu Dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="bg-red-100 p-4 rounded-full text-red-600">
              <XCircle size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Link Inválido</h2>
            <p className="text-gray-500">Este link de confirmação expirou ou não existe.</p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
            >
              Voltar ao Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}