import { useState, useEffect } from 'react';
import { Play, Pause, Save, Clock, Edit3, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Materia { id: number; nome: string; }
interface TipoEstudo { id: number; nome: string; }
interface Topico { id: number; nome: string; }

export default function RegistroRapido() {
  const [modo, setModo] = useState<'manual' | 'timer'>('timer');
  
  // Listas do Banco
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tiposEstudo, setTiposEstudo] = useState<TipoEstudo[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);

  // Cronômetro
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [dataInicioReal, setDataInicioReal] = useState<Date | null>(null);

  // Estados de Interface (Modais e Erros)
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false); // <--- NOVO: Modal de Sucesso
  const [erro, setErro] = useState(''); // <--- NOVO: Erro inline (sem alert)
  const [loading, setLoading] = useState(false);

  // Formulário
  const [form, setForm] = useState({
    materiaId: '',
    topicoId: '',
    tipoEstudoId: '',
    questoes: '',
    acertos: '',
    anotacoes: '',
    dataInicioManual: new Date().toISOString().slice(0, 16),
    duracaoManual: '' 
  });

  // 1. Carregar Listas
  useEffect(() => {
    api.get('/materias').then(res => setMaterias(res.data));
    api.get('/tipos-estudo').then(res => setTiposEstudo(res.data)).catch(() => {});
  }, []);

  // 2. Carregar Tópicos
  useEffect(() => {
    if (form.materiaId) {
      api.get(`/topicos/${form.materiaId}`).then(res => setTopicos(res.data)).catch(() => setTopicos([]));
    } else {
      setTopicos([]);
    }
  }, [form.materiaId]);

  // 3. Tic-Tac do Cronômetro
  useEffect(() => {
    let intervalo: any = null;
    if (ativo && !pausado) {
      intervalo = setInterval(() => {
        setSegundos(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [ativo, pausado]);

  const formatarTempo = (total: number) => {
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // --- Ações ---
  const iniciar = () => {
    if (!ativo) setDataInicioReal(new Date());
    setAtivo(true);
    setPausado(false);
    setErro('');
  };

  const pausar = () => setPausado(true);
  const retomar = () => setPausado(false);

  const resetarTudo = () => {
    setAtivo(false);
    setPausado(false);
    setSegundos(0);
    setDataInicioReal(null);
    setForm({
      materiaId: '', topicoId: '', tipoEstudoId: '', questoes: '', acertos: '', anotacoes: '',
      dataInicioManual: new Date().toISOString().slice(0, 16), duracaoManual: ''
    });
    setModalCancelarAberto(false);
    setErro('');
  };

  const salvar = async () => {
    setErro(''); // Limpa erros anteriores

    // Validação Manual (Substituindo o alert)
    if (!form.materiaId) {
      setErro("Selecione uma matéria para salvar.");
      return;
    }

    setLoading(true);
    try {
      let segundosFinais = 0;
      let dataInicioEnvio = new Date();

      if (modo === 'timer') {
        segundosFinais = segundos;
        dataInicioEnvio = dataInicioReal || new Date(); 
      } else {
        const partes = form.duracaoManual.split(':').map(Number);
        const h = partes[0] || 0;
        const m = partes[1] || 0;
        const s = partes[2] || 0;
        segundosFinais = (h * 3600) + (m * 60) + s;
        dataInicioEnvio = new Date(form.dataInicioManual);
      }

      if (segundosFinais < 1) {
        setErro("A duração deve ser maior que 0.");
        setLoading(false);
        return;
      }

      const payload = {
        materiaId: Number(form.materiaId),
        topicoId: form.topicoId ? Number(form.topicoId) : null,
        tipoEstudoId: form.tipoEstudoId ? Number(form.tipoEstudoId) : null,
        dataInicio: dataInicioEnvio.toISOString(),
        segundos: segundosFinais,
        questoesFeitas: form.questoes ? Number(form.questoes) : 0,
        questoesCertas: form.acertos ? Number(form.acertos) : 0,
        anotacoes: form.anotacoes
      };

      await api.post('/registros', payload);
      
      // SUCESSO: Abre modal e reseta depois
      setModalSucessoAberto(true);
      
      setTimeout(() => {
        setModalSucessoAberto(false);
        resetarTudo();
      }, 2000); // 2 segundos para ler a mensagem

    } catch (error: any) {
      console.error(error);
      setErro(error.response?.data?.mensagem || "Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-full">
      
      {/* Abas */}
      <div className="flex border-b">
        <button 
          onClick={() => !ativo && setModo('timer')}
          disabled={ativo}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'timer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Clock size={16} /> Cronômetro
        </button>
        <button 
          onClick={() => !ativo && setModo('manual')}
          disabled={ativo}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Edit3 size={16} /> Manual
        </button>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        
        {/* TIMER */}
        {modo === 'timer' && (
          <div className="space-y-6 text-center">
            <div className={`text-6xl font-mono font-bold tracking-wider ${ativo && !pausado ? 'text-blue-600' : 'text-gray-700'}`}>
              {formatarTempo(segundos)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Matéria</label>
                <select 
                  value={form.materiaId}
                  onChange={e => setForm({...form, materiaId: e.target.value})}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tópico</label>
                <select 
                  value={form.topicoId}
                  onChange={e => setForm({...form, topicoId: e.target.value})}
                  disabled={!form.materiaId}
                  className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100"
                >
                  <option value="">{form.materiaId ? "Selecione..." : "Escolha a matéria"}</option>
                  {topicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>

            {!ativo ? (
              <button onClick={iniciar} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]">
                <Play size={20} fill="currentColor" /> INICIAR
              </button>
            ) : (
              <div className="flex gap-2">
                {!pausado ? (
                  <button onClick={pausar} className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm">
                    <Pause size={20} fill="currentColor" /> PAUSAR
                  </button>
                ) : (
                  <button onClick={retomar} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm">
                    <Play size={20} fill="currentColor" /> RETOMAR
                  </button>
                )}
                <button onClick={() => setModalCancelarAberto(true)} className="px-4 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold transition-all">
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* MANUAL */}
        {modo === 'manual' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Matéria *</label>
                <select value={form.materiaId} onChange={e => setForm({...form, materiaId: e.target.value})} className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none bg-white">
                  <option value="">Selecione...</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tópico</label>
                <select value={form.topicoId} onChange={e => setForm({...form, topicoId: e.target.value})} disabled={!form.materiaId} className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100">
                  <option value="">...</option>
                  {topicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Início</label>
                <input type="datetime-local" value={form.dataInicioManual} onChange={e => setForm({...form, dataInicioManual: e.target.value})} className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Duração (HH:MM:SS)</label>
                <input type="text" placeholder="00:00:00" value={form.duracaoManual} onChange={e => setForm({...form, duracaoManual: e.target.value})} className="w-full border rounded-md p-2 text-sm focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* DETALHES (Visível se Manual ou Timer Pausado) */}
        {(modo === 'manual' || (modo === 'timer' && pausado)) && (
          <div className="space-y-4 pt-4 border-t animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                <select value={form.tipoEstudoId} onChange={e => setForm({...form, tipoEstudoId: e.target.value})} className="w-full border rounded-md p-2 text-sm outline-none bg-white">
                  <option value="">...</option>
                  {tiposEstudo.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Questões</label>
                <input type="number" value={form.questoes} onChange={e => setForm({...form, questoes: e.target.value})} className="w-full border rounded-md p-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Acertos</label>
                <input type="number" value={form.acertos} onChange={e => setForm({...form, acertos: e.target.value})} className="w-full border rounded-md p-2 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Anotações</label>
              <textarea rows={2} value={form.anotacoes} onChange={e => setForm({...form, anotacoes: e.target.value})} className="w-full border rounded-md p-2 text-sm outline-none resize-none" placeholder="Detalhes do estudo..." />
            </div>

            {/* MENSAGEM DE ERRO (Personalizada) */}
            {erro && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2 animate-pulse">
                <AlertCircle size={16} /> {erro}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalCancelarAberto(true)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transition-colors">
                <Save size={18} /> {loading ? 'Salvando...' : 'SALVAR REGISTRO'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Cancelar */}
      <Modal isOpen={modalCancelarAberto} onClose={() => setModalCancelarAberto(false)} title="Descartar Estudo?">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Tem certeza que deseja descartar o tempo registrado?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalCancelarAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Voltar</button>
            <button onClick={resetarTudo} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">Descartar</button>
          </div>
        </div>
      </Modal>

      {/* Modal de Sucesso (Feedback) */}
      <Modal isOpen={modalSucessoAberto} onClose={() => {}} title="">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-full animate-bounce">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Estudo Registrado!</h3>
          <p className="text-gray-500 text-sm">Continue assim! 🚀</p>
        </div>
      </Modal>

    </div>
    </>
  );
}