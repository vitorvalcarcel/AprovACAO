import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    // 1. Validações Locais
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    setLoading(true);

    try {
      // 2. Chama o Backend
      await api.post('/usuarios', {
        nome,
        email,
        senha
      });

      // 3. Sucesso Personalizado (Sem Alert)
      setSucesso('Conta criada com sucesso! Redirecionando...');
      
      // Espera 2 segundos para o usuário ler a mensagem antes de ir pro login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error(error);
      
      // 4. Tratamento de Erro Real do Backend
      // Se o backend mandou uma mensagem (ex: "Senha fraca"), mostramos ela.
      if (error.response && error.response.data && error.response.data.mensagem) {
        setErro(error.response.data.mensagem);
      } else {
        setErro('Erro ao conectar com o servidor. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Crie sua conta
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Comece sua jornada rumo à aprovação
        </p>

        <form onSubmit={handleCadastro} className="space-y-4" noValidate>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>

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
              placeholder="Mín. 8 caracteres, letras, números e símbolos"
            />
            <p className="text-xs text-gray-400 mt-1">Ex: SenhaForte@123</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:outline-none ${
                confirmarSenha && senha !== confirmarSenha 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="********"
            />
          </div>

          {/* Área de Erro (Vermelho) */}
          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded animate-pulse">
              <p className="text-red-700 text-sm font-medium">{erro}</p>
            </div>
          )}

          {/* Área de Sucesso (Verde) */}
          {sucesso && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-green-700 text-sm font-bold">{sucesso}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-bold rounded-md transition duration-300 mt-2
              ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? 'Validando dados...' : 'CRIAR CONTA GRÁTIS'}
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