import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Pencil, Check, Loader2 } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';
import { useToast } from './Toast/ToastContext'; // Importamos o Toast

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
  materiaId: number;
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
  const { showToast } = useToast(); // Hook para disparar erro manualmente se necessário
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<Materia[]>([]);

  const [idVinculoEmEdicao, setIdVinculoEmEdicao] = useState<number | null>(null);

  const [materiaSelecionada, setMateriaSelecionada] = useState('');
  const [peso, setPeso] = useState(1);
  const [questoes, setQuestoes] = useState(10);

  const [loading, setLoading] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'objetiva' | 'discursiva'>('objetiva');

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
    setActiveTab('objetiva');
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

    setLoading(true);

    try {
      if (idVinculoEmEdicao) {
        await api.put('/concursos/materias', {
          id: idVinculoEmEdicao,
          peso: Number(peso),
          questoesProva: Number(questoes)
        });
      } else {
        if (activeTab === 'discursiva') {
          // Lógica Discursiva: backend exige @Positive, então enviamos 1/1 (valores dummy)
          await api.post(`/concursos/${concurso.id}/materias`, {
            materiaId: 0,
            peso: 1,
            questoesProva: 1,
            incluirDiscursiva: true
          });
        } else {
          // Lógica Objetiva
          if (!materiaSelecionada) {
            setLoading(false);
            return;
          }
          await api.post(`/concursos/${concurso.id}/materias`, {
            materiaId: Number(materiaSelecionada),
            peso: Number(peso),
            questoesProva: Number(questoes)
          });
        }
      }

      limparForm();
      carregarDados();
    } catch (error: any) {
      setLoading(false);
      if (error.response?.data && Array.isArray(error.response.data)) {
        const msgs = error.response.data.map((err: any) => `${err.campo}: ${err.mensagem}`).join(' | ');
        showToast('error', 'Erro de Validação', msgs);
      }
    }
  };

  const prepararEdicao = (vinculo: Vinculo) => {
    const materia = materiasDisponiveis.find(m => m.nome === vinculo.nomeMateria);
    if (materia) {
      setMateriaSelecionada(String(materia.id));
      setPeso(vinculo.peso);
      setQuestoes(vinculo.questoesProva);
      setIdVinculoEmEdicao(vinculo.id);
      setActiveTab('objetiva');
    }
  };

  const removerDisciplina = async () => {
    if (!confirmarExclusao) return;
    try {
      await api.delete(`/concursos/materias/${confirmarExclusao}`);
      carregarDados();
      setConfirmarExclusao(null);
      if (idVinculoEmEdicao === confirmarExclusao) limparForm();
    } catch (error) {
      console.log("Erro removendo");
    }
  };

  const materiasParaAdicionar = materiasDisponiveis.filter(
    m => !vinculos.some(v => v.nomeMateria === m.nome)
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Disciplinas: ${concurso?.nome}`}>
        <div className="space-y-4">

          {/*--- TAB SWITCHER ---*/}
          {!idVinculoEmEdicao && (
            <div className="flex p-0.5 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('objetiva')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'objetiva' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BookOpen size={14} /> Objetiva
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discursiva')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'discursiva' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Pencil size={14} /> Redação/Discursiva
              </button>
            </div>
          )}

          <form onSubmit={salvarDisciplina} className={`p-3 rounded-xl border transition-all ${idVinculoEmEdicao ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200 shadow-sm'}`}>

            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {idVinculoEmEdicao ? 'Editando Vínculo' : (activeTab === 'objetiva' ? 'Adicionar Matéria Objetiva' : 'Adicionar Discursiva')}
            </h4>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-end">
              {/*--- CONTEÚDO TAB: OBJETIVA ---*/}
              {(activeTab === 'objetiva' || idVinculoEmEdicao) && (
                <div className="flex-1 space-y-2 w-full animate-fade-in">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 mb-0.5 block">Matéria</label>
                    <select
                      value={materiaSelecionada}
                      onChange={e => setMateriaSelecionada(e.target.value)}
                      className="w-full px-2 h-8 border border-gray-300 rounded-md text-xs bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      required
                      disabled={!!idVinculoEmEdicao}
                    >
                      <option value="">Selecione...</option>
                      {idVinculoEmEdicao
                        ? <option value={materiaSelecionada}>{materiasDisponiveis.find(m => m.id === Number(materiaSelecionada))?.nome}</option>
                        : materiasParaAdicionar.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)
                      }
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 sm:w-20">
                      <label className="text-[10px] font-bold text-gray-600 mb-0.5 block">Peso</label>
                      <input
                        type="number" step="0.1" min="0.1"
                        value={peso}
                        onChange={e => setPeso(Number(e.target.value))}
                        className="w-full px-2 h-8 border border-gray-300 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div className="flex-1 sm:w-20">
                      <label className="text-[10px] font-bold text-gray-600 mb-0.5 block">Questões</label>
                      <input
                        type="number" min="1"
                        value={questoes}
                        onChange={e => setQuestoes(Number(e.target.value))}
                        className="w-full px-2 h-8 border border-gray-300 rounded-md text-xs outline-none focus:ring-1 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*--- CONTEÚDO TAB: DISCURSIVA ---*/}
              {activeTab === 'discursiva' && !idVinculoEmEdicao && (
                <div className="flex-1 w-full animate-fade-in">
                  <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-2">
                    <div className="bg-orange-100 p-1.5 rounded-full text-orange-600 shrink-0 mt-0.5">
                      <Pencil size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-orange-800 mb-0.5">Matéria de Sistema</h4>
                      <p className="text-[10px] text-orange-700 leading-snug">
                        A disciplina <strong>"Prova Discursiva"</strong> será vinculada com tempo fixo. Peso e questões são ignorados neste cálculo.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/*--- BUTTONS ---*/}
              <div className="flex flex-col gap-2 pt-1 sm:pt-0">
                {idVinculoEmEdicao ? (
                  <div className="flex gap-1 w-full sm:w-auto">
                    <button type="button" onClick={limparForm} className="flex-1 sm:flex-none sm:w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-all" title="Cancelar">
                      <Plus size={16} className="rotate-45" />
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 sm:flex-none sm:w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-all shadow-sm" title="Salvar">
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || (activeTab === 'objetiva' && !materiaSelecionada)}
                    className={`w-full sm:w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm text-white ${activeTab === 'objetiva' ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300' : 'bg-orange-600 hover:bg-orange-700'}`}
                    title="Adicionar Matéria"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/*--- LISTA ---*/}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Matérias Vinculadas <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[9px]">{vinculos.length}</span>
            </h4>

            {loading && vinculos.length === 0 ? (
              <div className="flex justify-center py-6 opacity-50"><Loader2 className="animate-spin text-blue-500" size={20} /></div>
            ) : vinculos.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <BookOpen className="mx-auto text-gray-300 mb-1" size={24} />
                <p className="text-xs text-gray-500">Nenhuma matéria vinculada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
                {vinculos.map(v => (
                  <div key={v.id} className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${idVinculoEmEdicao === v.id ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${v.nomeMateria.includes('Discursiva') ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {v.nomeMateria.includes('Discursiva') ? <Pencil size={12} /> : <BookOpen size={12} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold truncate ${idVinculoEmEdicao === v.id ? 'text-blue-700' : 'text-gray-800'}`}>{v.nomeMateria}</p>
                        {!v.nomeMateria.includes('Discursiva') && (
                          <p className="text-[9px] text-gray-500 font-medium">Peso {v.peso} • {v.questoesProva} questões</p>
                        )}
                        {v.nomeMateria.includes('Discursiva') && (
                          <p className="text-[9px] text-orange-500 font-medium">Tempo Fixo</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => prepararEdicao(v)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setConfirmarExclusao(v.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Remover">
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