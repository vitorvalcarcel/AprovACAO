import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';

interface Topico {
  id?: number;
  nome: string;
}

interface ModalTopicoProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: number | null;
  topicoEdicao?: Topico | null; // Se vier preenchido, é edição
  onSalvo: () => void; // Avisa o pai para recarregar a lista
}

export default function ModalTopico({ isOpen, onClose, materiaId, topicoEdicao, onSalvo }: ModalTopicoProps) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Reseta ou preenche o formulário ao abrir
  useEffect(() => {
    if (isOpen) {
      setNome(topicoEdicao?.nome || '');
      setErro('');
    }
  }, [isOpen, topicoEdicao]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !materiaId) return;

    setLoading(true);
    setErro('');

    try {
      if (topicoEdicao?.id) {
        // Edição
        await api.put('/topicos', { id: topicoEdicao.id, nome, materiaId });
      } else {
        // Criação
        await api.post('/topicos', { nome, materiaId });
      }
      onSalvo();
      onClose();
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || 'Erro ao salvar tópico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={topicoEdicao ? 'Editar Tópico' : 'Novo Tópico'}
    >
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Assunto</label>
          <input 
            autoFocus
            type="text" 
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Crase, Regra de Três..."
          />
        </div>

        {erro && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{erro}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || !nome.trim()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}