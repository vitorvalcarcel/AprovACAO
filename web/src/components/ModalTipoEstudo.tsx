import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from './Modal';
import { Clock } from 'lucide-react';

interface TipoEstudo { id?: number; nome: string; contaHorasCiclo?: boolean; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  edicao?: TipoEstudo | null;
  onSalvo: () => void;
}

export default function ModalTipoEstudo({ isOpen, onClose, edicao, onSalvo }: Props) {
  const [nome, setNome] = useState('');
  const [contaHorasCiclo, setContaHorasCiclo] = useState(true); // Padrão ligado
  
  useEffect(() => {
    if(isOpen) {
      setNome(edicao?.nome || '');
      // Se for edição, puxa o valor. Se for novo, padrão true.
      setContaHorasCiclo(edicao?.contaHorasCiclo !== undefined ? edicao.contaHorasCiclo : true);
    }
  }, [isOpen, edicao]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!nome.trim()) return;
    try {
      const payload = { nome, contaHorasCiclo };
      if(edicao?.id) await api.put('/tipos-estudo', { id: edicao.id, ...payload });
      else await api.post('/tipos-estudo', payload);
      onSalvo(); onClose();
    } catch(e) { alert('Erro ao salvar'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={edicao ? 'Editar Tipo' : 'Novo Tipo'}>
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input autoFocus value={nome} onChange={e=>setNome(e.target.value)} className="w-full border p-2 rounded focus:ring-2 outline-none" placeholder="Ex: Videoaula"/>
        </div>

        {/* SWITCH CONFIGURAÇÃO */}
        <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">Contabilizar horas no Ciclo?</p>
              <p className="text-xs text-gray-500">Se desligado, conta apenas questões.</p>
            </div>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={contaHorasCiclo} onChange={e => setContaHorasCiclo(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="text-gray-500 px-3">Cancelar</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
        </div>
      </form>
    </Modal>
  );
}