import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast/ToastContext';

interface CampoErro {
  campo: string;
  mensagem: string;
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errosCampos, setErrosCampos] = useState<Record<string, string>>({});

  // Estado sincronizado para visibilidade de senhas
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrosCampos({});

    if (senha !== confirmarSenha) {
      setErrosCampos({ confirmarSenha: 'As senhas não coincidem!' });
      showToast('error', 'Erro de Validação', 'Verifique os campos destacados.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/usuarios', { nome, email, senha });
      navigate('/verificar-email', { state: { email } });
    } catch (error: any) {
      if (error.response && Array.isArray(error.response.data)) {
        const novosErros: Record<string, string> = {};
        error.response.data.forEach((err: CampoErro) => {
          novosErros[err.campo] = err.mensagem;
        });
        setErrosCampos(novosErros);
        showToast('error', 'Dados Inválidos', 'Por favor, corrija os campos em vermelho.');
      } 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        
        <div className="flex items-center justify-center mb-6 opacity-80 scale-90">
          <GraduationCap className="text-blue-600 mr-2" size={32} />
          <span className="text-2xl font-bold text-gray-800">
            Aprov<span className="text-blue-600">AÇÃO</span>
          </span>
        </div>

        <h1 className="text-xl font-bold text-center text-gray-800 mb-2">
          Crie sua conta
        </h1>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Comece sua jornada rumo à aprovação
        </p>

        <form onSubmit={handleCadastro} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                errosCampos.nome ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Seu nome"
            />
            {errosCampos.nome && <p className="text-xs text-red-500 mt-1">{errosCampos.nome}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                errosCampos.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="seu@email.com"
            />
            {errosCampos.email && <p className="text-xs text-red-500 mt-1">{errosCampos.email}</p>}
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none pr-10 ${
                  errosCampos.senha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Mín. 8 caracteres, Maiúsculas e Símbolos"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errosCampos.senha ? (
              <p className="text-xs text-red-500 mt-1">{errosCampos.senha}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">Ex: SenhaForte@123</p>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none pr-10 ${
                  errosCampos.confirmarSenha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errosCampos.confirmarSenha && <p className="text-xs text-red-500 mt-1">{errosCampos.confirmarSenha}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-bold rounded-md transition duration-300 mt-2
              ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? 'Processando...' : 'CRIAR CONTA GRÁTIS'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Entrar agora
          </Link>
        </div>
      </div>
    </div>
  );
}