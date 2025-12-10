import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, AlertCircle, Pencil, Check } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Concurso {
  id: number;
  nome: string;
}

interface Materia {
  id: number;
  nome: string;
}

interface Vinculo {
  id: number;
  materiaId: number; // Precisamos do ID da matéria para o select
  nomeMateria: string;
  peso: number;
  questoesProva: number;
}

interface ModalDisciplinasProps {
  isOpen: boolean;
  onClose: () => void;
  concurso: Concurso | null;
}

export default function ModalDisciplinas({ isOpen, onClose, concurso }: ModalDisciplinasProps) {
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<Materia[]>([]);
  
  // Estado de Edição
  const [idVinculoEmEdicao, setIdVinculoEmEdicao] = useState<number | null>(null);

  // Formulário
  const [materiaSelecionada, setMateriaSelecionada] = useState('');
  const [peso, setPeso] = useState(1);
  const [questoes, setQuestoes] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Modal de confirmação
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && concurso) {
      carregarDados();
      limparForm();
    }
  }, [isOpen, concurso]);

  const limparForm = () => {
    setMateriaSelecionada('');
    setPeso(1);
    setQuestoes(10);
    setIdVinculoEmEdicao(null);
    setErro('');
  };

  const carregarDados = async () => {
    setLoading(true);
    try {
      const resVinculos = await api.get<Vinculo[]>(`/concursos/${concurso?.id}/materias`);
      setVinculos(resVinculos.data);
      const resMaterias = await api.get<Materia[]>('/materias');
      setMateriasDisponiveis(resMaterias.data);
    } catch (error) {
      console.error("Erro ao carregar", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarDisciplina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concurso) return;
    setErro('');

    try {
      if (idVinculoEmEdicao) {
        // --- ATUALIZAR (PUT) ---
        await api.put('/concursos/materias', {
          id: idVinculoEmEdicao,
          peso: Number(peso),
          questoesProva: Number(questoes)
        });
      } else {
        // --- CRIAR (POST) ---
        if (!materiaSelecionada) return;
        await api.post(`/concursos/${concurso.id}/materias`, {
          materiaId: Number(materiaSelecionada),
          peso: Number(peso),
          questoesProva: Number(questoes)
        });
      }
      
      limparForm();
      carregarDados();
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar.");
    }
  };

  const prepararEdicao = (vinculo: Vinculo) => {
    const materia = materiasDisponiveis.find(m => m.nome === vinculo.nomeMateria);
    
    if (materia) {
        setMateriaSelecionada(String(materia.id));
        setPeso(vinculo.peso);
        setQuestoes(vinculo.questoesProva);
        setIdVinculoEmEdicao(vinculo.id);
        setErro('');
    }
  };

  const removerDisciplina = async () => {
    if (!confirmarExclusao) return;
    try {
      await api.delete(`/concursos/materias/${confirmarExclusao}`);
      carregarDados();
      setConfirmarExclusao(null);
      if (idVinculoEmEdicao === confirmarExclusao) limparForm(); // Se estava editando o que apagou
    } catch (error) {
      setErro("Erro ao remover.");
    }
  };

  const materiasParaAdicionar = materiasDisponiveis.filter(
    m => !vinculos.some(v => v.nomeMateria === m.nome)
  );

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title={`Disciplinas: ${concurso?.nome}`}>
      <div className="space-y-4">
        
        <form onSubmit={salvarDisciplina} className={`p-3 rounded-lg border transition-colors ${idVinculoEmEdicao ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-end gap-2">
            
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">
                {idVinculoEmEdicao ? 'Editando Matéria:' : 'Adicionar Matéria'}
              </label>
              <select 
                value={materiaSelecionada}
                onChange={e => setMateriaSelecionada(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                required
                disabled={!!idVinculoEmEdicao} // Não pode trocar a matéria na edição, só peso
              >
                <option value="">Selecione...</option>
                {/* Se estiver editando, mostra a opção atual mesmo se já vinculada */}
                {idVinculoEmEdicao 
                  ? <option value={materiaSelecionada}>{materiasDisponiveis.find(m => m.id === Number(materiaSelecionada))?.nome}</option>
                  : materiasParaAdicionar.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)
                }
              </select>
            </div>

            <div className="w-16">
              <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Peso</label>
              <input type="number" step="0.1" min="0.1" value={peso} onChange={e => setPeso(Number(e.target.value))} className="w-full px-2 py-1.5 border rounded-md text-sm outline-none text-center" />
            </div>

            <div className="w-16">
              <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Quest.</label>
              <input type="number" min="1" value={questoes} onChange={e => setQuestoes(Number(e.target.value))} className="w-full px-2 py-1.5 border rounded-md text-sm outline-none text-center" />
            </div>

            {idVinculoEmEdicao ? (
               // Botões de Edição (Salvar e Cancelar)
               <div className="flex gap-1">
                   <button type="button" onClick={limparForm} className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-md h-[34px] w-[34px] flex items-center justify-center" title="Cancelar Edição">
                     <Plus size={18} className="rotate-45" />
                   </button>
                   <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md h-[34px] w-[34px] flex items-center justify-center" title="Salvar Alterações">
                     <Check size={18} />
                   </button>
               </div>
            ) : (
               // Botão Adicionar Padrão
               <button type="submit" disabled={!materiaSelecionada} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md disabled:opacity-50 h-[34px] w-[34px] flex items-center justify-center" title="Adicionar">
                 <Plus size={18} />
               </button>
            )}
          </div>

          {erro && <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> {erro}</div>}
        </form>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Matérias Vinculadas ({vinculos.length})
            </h4>
          </div>
          
          {loading ? (
            <p className="text-center text-gray-400 text-xs py-4">Carregando...</p>
          ) : vinculos.length === 0 ? (
            <p className="text-center text-gray-400 text-xs py-8 border border-dashed rounded-md bg-gray-50">Nenhuma matéria vinculada ainda.</p>
          ) : (
            <div className="border rounded-md divide-y overflow-hidden max-h-[250px] overflow-y-auto bg-white scrollbar-thin">
              {vinculos.map(v => (
                <div key={v.id} className={`flex items-center justify-between p-2 transition-colors group ${idVinculoEmEdicao === v.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <div className="flex-1">
                    <p className={`text-sm truncate font-medium ${idVinculoEmEdicao === v.id ? 'text-blue-700' : 'text-gray-800'}`}>{v.nomeMateria}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Peso {v.peso} • {v.questoesProva} questões</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => prepararEdicao(v)} className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md transition-colors" title="Editar">
                        <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirmarExclusao(v.id)} className="text-gray-400 hover:text-red-600 p-1.5 rounded-md transition-colors" title="Remover">
                        <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>

    {/* Modal Confirmação de Exclusão */}
    <Modal isOpen={!!confirmarExclusao} onClose={() => setConfirmarExclusao(null)} title="Remover Disciplina">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Tem certeza que deseja remover esta disciplina do concurso?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setConfirmarExclusao(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={removerDisciplina} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">Remover</button>
          </div>
        </div>
    </Modal>
    </>
  );
}