import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast/ToastContext';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado para visibilidade da senha
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Estado para controlar se precisa reenviar o email
  const [contaInativa, setContaInativa] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContaInativa(false);

    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, senha });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      await refreshUser(); // Assuming refreshUser is defined elsewhere or will be added.

      navigate('/app');
    } catch (error: any) {
      console.error(error);

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
      setContaInativa(false);
    } catch (error: any) {
      showToast('error', 'Erro', error.response?.data?.mensagem || 'Erro ao reenviar e-mail.');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">

        {/* Identidade Visual AprovAÇÃO */}
        <div className="flex items-center justify-center mb-8">
          <GraduationCap className="text-blue-600 mr-2" size={40} />
          <span className="text-3xl font-bold text-gray-800">
            Aprov<span className="text-blue-600">AÇÃO</span>
          </span>
        </div>

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
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1} // Evita foco via tab, melhor UX neste caso
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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

          {contaInativa && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md text-center animate-fade-in">
              <p className="text-xs text-yellow-800 mb-2">Sua conta ainda não foi ativada.</p>
              <button
                type="button"
                onClick={handleReenviarEmail}
                disabled={reenviando}
                className="text-sm font-bold text-yellow-700 hover:text-yellow-900 flex items-center justify-center gap-2 mx-auto"
              >
                {reenviando ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
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