import React, { useState } from 'react';
import { X, Send, AlertTriangle, Lightbulb, Heart, MessageSquare } from 'lucide-react';
import { enviarFeedback, type IFeedbackDTO } from '../services/api';
import { useToast } from './Toast/ToastContext';

interface ModalFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalFeedback: React.FC<ModalFeedbackProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [tipo, setTipo] = useState<IFeedbackDTO['tipo']>('SUGESTAO');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mensagem.length < 10) {
      showToast('error', 'Muito curto', 'Mínimo de 10 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await enviarFeedback({ tipo, mensagem });
      showToast('success', 'Obrigado!', 'Feedback enviado com sucesso.');
      setMensagem('');
      onClose();
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" />
            Enviar Feedback
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'SUGESTAO', label: 'Sugestão', icon: Lightbulb, color: 'text-yellow-500' },
                { id: 'BUG', label: 'Erro', icon: AlertTriangle, color: 'text-red-500' },
                { id: 'ELOGIO', label: 'Elogio', icon: Heart, color: 'text-pink-500' },
                { id: 'OUTRO', label: 'Outro', icon: MessageSquare, color: 'text-gray-500' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTipo(item.id as any)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                    tipo === item.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={16} className={tipo === item.id ? 'text-blue-600' : item.color} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
              placeholder="Descreva aqui..."
              maxLength={1000}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{mensagem.length}/1000</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {loading ? 'Enviando...' : <><Send size={18} /> Enviar</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalFeedback;