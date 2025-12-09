import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Tipagem da resposta que esperamos do Java
interface LoginResponse {
  token: string;
}

export default function Login() {
  const navigate = useNavigate(); // Hook para mudar de tela

  // Estados para guardar o que o usuário digita
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados para controle de tela (erro e carregamento)
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Função disparada ao clicar em "Entrar"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que a página recarregue
    setErro(''); // Limpa erros anteriores

    // 1. Validação Manual (Para não usar o popup padrão do navegador)
    if (!email.trim() || !senha.trim()) {
      setErro('Por favor, preencha todos os campos para continuar.');
      return;
    }

    setLoading(true); // Ativa o "Carregando..."

    try {
      // 2. Chama o Backend (POST http://localhost:8080/login)
      const response = await api.post<LoginResponse>('/login', { email, senha });
      
      // 3. Se deu certo:
      const token = response.data.token;
      
      // Salva o crachá (token) no navegador
      localStorage.setItem('token', token);
      
      // Manda o usuário para o Dashboard (/app)
      navigate('/app');

    } catch (error) {
      // 4. Se deu erro (403/401/500):
      setErro('E-mail ou senha incorretos. Tente novamente.');
      console.error(error);
    } finally {
      setLoading(false); // Desativa o "Carregando..."
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        
        {/* Título */}
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          NomeAÇÃO 🎯
        </h1>

        {/* Formulário com noValidate para desligar validação do HTML */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          
          {/* Campo E-mail */}
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

          {/* Campo Senha */}
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

          {/* Área de Erro (Só aparece se tiver erro) */}
          {erro && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 text-sm">{erro}</p>
            </div>
          )}

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 text-white font-bold rounded-md transition duration-300
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>

        {/* Link para criar conta */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="text-blue-600 hover:underline font-medium">
            Cadastre-se aqui
          </Link>
        </div>

      </div>
    </div>
  );
}