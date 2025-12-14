import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Save, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast/ToastContext';

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = searchParams.get('token');

  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado sincronizado para visibilidade
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Validação Local de Senha Forte
  const validarSenhaForte = (senha: string) => {
    const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/;
    return regex.test(senha) && senha.length >= 8;
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-red-600 font-bold mb-2">Link Inválido</h2>
          <p className="text-gray-500">Este link de recuperação não é válido.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirma) {
      showToast('error', 'Erro', 'As senhas não conferem.');
      return;
    }

    if (!validarSenhaForte(senha)) {
      showToast('error', 'Senha Fraca', 'A senha deve ter mín. 8 caracteres, maiúscula, minúscula, número e símbolo (@#$%...).');
      return;
    }

    setLoading(true);

    try {
      await api.post('/usuarios/redefinir-senha', { token, novaSenha: senha });
      showToast('success', 'Senha Alterada!', 'Sua senha foi redefinida com sucesso.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      if (Array.isArray(error.response?.data)) {
        showToast('error', 'Senha Inválida', error.response.data[0].mensagem);
      } else {
        showToast('error', 'Erro', error.response?.data?.mensagem || 'Link expirado ou inválido.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nova Senha</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <p>Sua nova senha deve conter letras maiúsculas, minúsculas, números e símbolos.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
            <div className="relative">
              <CheckCircle className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type={mostrarSenha ? "text" : "password"}
                value={confirma}
                onChange={e => setConfirma(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Repita a senha"
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-bold flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? 'Salvando...' : <><Save size={18} /> Redefinir Senha</>}
          </button>
        </form>
      </div>
    </div>
  );
}