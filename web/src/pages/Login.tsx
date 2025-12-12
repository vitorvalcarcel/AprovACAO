import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast/ToastContext';

interface LoginResponse {
  token: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar se precisa reenviar o email
  const [contaInativa, setContaInativa] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContaInativa(false);

    try {
      const response = await api.post<LoginResponse>('/login', { email, senha });
      const token = response.data.token;
      localStorage.setItem('token', token);
      navigate('/app');
    } catch (error: any) {
      console.error(error);
      
      // Detecção de conta inativa (400 com mensagem específica ou tratado via DisabledException)
      if (error.response?.data?.mensagem?.includes('inativa') || error.response?.data?.mensagem?.includes('verifique')) {
        setContaInativa(true);
      } else if (error.response?.status === 401) {
        showToast('error', 'Acesso Negado', 'E-mail ou senha incorretos.');
      } else if (!error.response?.data?.mensagem) {
        showToast('error', 'Erro', 'Não foi possível fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarEmail = async () => {
    setReenviando(true);
    try {
      await api.post('/usuarios/reenviar-confirmacao', { email });
      showToast('success', 'E-mail Reenviado', `Um novo link foi enviado para ${email}`);
      setContaInativa(false); // Esconde o botão para não floodar
    } catch (error: any) {
      showToast('error', 'Erro', error.response?.data?.mensagem || 'Erro ao reenviar e-mail.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          NomeAÇÃO 🎯
        </h1>

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-bold rounded-md transition duration-300
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>

          {/* Botão de Reenvio Condicional */}
          {contaInativa && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md text-center animate-fade-in">
              <p className="text-xs text-yellow-800 mb-2">Sua conta ainda não foi ativada.</p>
              <button
                type="button"
                onClick={handleReenviarEmail}
                disabled={reenviando}
                className="text-sm font-bold text-yellow-700 hover:text-yellow-900 flex items-center justify-center gap-2 mx-auto"
              >
                {reenviando ? <Loader2 size={14} className="animate-spin"/> : <Mail size={14}/>}
                Reenviar E-mail de Ativação
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm text-gray-600">
          <div>
            <Link to="/esqueci-senha" className="text-gray-500 hover:text-blue-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>
          <div>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="text-blue-600 hover:underline font-medium">
              Cadastre-se aqui
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}