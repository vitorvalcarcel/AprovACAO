import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';

interface TipoEstudo { id?: number; nome: string; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  edicao?: TipoEstudo | null;
  onSalvo: () => void;
}

export default function ModalTipoEstudo({ isOpen, onClose, edicao, onSalvo }: Props) {
  const [nome, setNome] = useState('');
  
  useEffect(() => {
    if(isOpen) setNome(edicao?.nome || '');
  }, [isOpen, edicao]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nome.trim()) return;
    try {
      if(edicao?.id) await api.put('/tipos-estudo', { id: edicao.id, nome });
      else await api.post('/tipos-estudo', { nome });
      onSalvo(); onClose();
    } catch(e) { alert('Erro ao salvar'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={edicao ? 'Editar Tipo' : 'Novo Tipo'}>
      <form onSubmit={salvar} className="space-y-4">
        <input autoFocus value={nome} onChange={e=>setNome(e.target.value)} className="w-full border p-2 rounded focus:ring-2 outline-none" placeholder="Ex: Videoaula"/>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-gray-500 px-3">Cancelar</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}