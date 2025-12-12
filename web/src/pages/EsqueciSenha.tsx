import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast/ToastContext';

export default function EsqueciSenha() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    
    try {
      await api.post('/usuarios/esqueci-senha', { email });
      // Sempre mostramos sucesso por segurança
      setEnviado(true);
    } catch (error) {
      showToast('error', 'Erro', 'Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        
        {!enviado ? (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h1>
            <p className="text-gray-500 mb-6 text-sm">Digite seu e-mail para receber as instruções.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-bold flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? 'Enviando...' : <><Send size={18} /> Enviar Link</>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <Mail size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">E-mail Enviado!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Verifique sua caixa de entrada (e spam). Se o e-mail {email} estiver cadastrado, você receberá um link para redefinir a senha.
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center gap-1">
            <ArrowLeft size={16} /> Voltar para Login
          </Link>
        </div>

      </div>
    </div>
  );
}