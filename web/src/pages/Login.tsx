import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface LoginResponse {
  token: string;
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/login', { email, senha });
      
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      navigate('/app');

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        </form>

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