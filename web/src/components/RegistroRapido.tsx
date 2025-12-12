import { useState, useEffect } from 'react';
import { Play, Pause, Save, Clock, Edit3, X, CheckCircle, AlertCircle, Plus, Check} from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Materia { id: number; nome: string; }
// Agora o Tipo traz a configuração do banco
interface TipoEstudo { id: number; nome: string; contaHorasCiclo: boolean; } 
interface Topico { id: number; nome: string; }

interface RegistroRapidoProps {
  onRegistroSalvo?: () => void;
}

export default function RegistroRapido({ onRegistroSalvo }: RegistroRapidoProps) {
  const [modo, setModo] = useState<'manual' | 'timer'>('timer');
  
  // Listas
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tiposEstudo, setTiposEstudo] = useState<TipoEstudo[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);

  // Estados do Cronômetro
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [dataInicioReal, setDataInicioReal] = useState<Date | null>(null);

  // Estados de Interface
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  // Cadastro Rápido de Tópico
  const [criandoTopico, setCriandoTopico] = useState(false);
  const [novoTopicoNome, setNovoTopicoNome] = useState('');
  const [salvandoTopico, setSalvandoTopico] = useState(false);

  // Form
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

  // NOVO ESTADO: Controla se o registro vai contar horas no ciclo
  const [contarHoras, setContarHoras] = useState(true);

  useEffect(() => {
    api.get('/materias').then(res => setMaterias(res.data));
    api.get('/tipos-estudo').then(res => setTiposEstudo(res.data)).catch(() => {});
  }, []);

  // Monitora mudança no Tipo de Estudo para ajustar o "Contar Horas" automaticamente
  useEffect(() => {
    if (form.tipoEstudoId) {
      const tipoSelecionado = tiposEstudo.find(t => t.id === Number(form.tipoEstudoId));
      if (tipoSelecionado) {
        setContarHoras(tipoSelecionado.contaHorasCiclo);
      }
    }
  }, [form.tipoEstudoId, tiposEstudo]);

  useEffect(() => {
    if (form.materiaId) {
      carregarTopicos(Number(form.materiaId));
    } else {
      setTopicos([]);
      setForm(f => ({ ...f, topicoId: '' }));
    }
  }, [form.materiaId]);

  const carregarTopicos = async (materiaId: number) => {
    try {
      const res = await api.get(`/topicos/${materiaId}`);
      setTopicos(res.data);
    } catch (e) {
      setTopicos([]);
    }
  };

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
    setContarHoras(true); // Reseta para o padrão
    setModalCancelarAberto(false);
    setErro('');
    setCriandoTopico(false);
  };

  const salvarNovoTopico = async () => {
    if (!novoTopicoNome.trim()) { setErro("Nome inválido"); return; }
    if (!form.materiaId) { setErro("Selecione a matéria"); return; }
    setSalvandoTopico(true);
    try {
      const response = await api.post('/topicos', { nome: novoTopicoNome, materiaId: Number(form.materiaId) });
      await carregarTopicos(Number(form.materiaId));
      setForm(f => ({ ...f, topicoId: response.data.id }));
      setCriandoTopico(false);
      setNovoTopicoNome('');
    } catch (error) { setErro("Erro ao criar tópico"); } finally { setSalvandoTopico(false); }
  };

  const salvar = async () => {
    setErro('');
    if (!form.materiaId) { setErro("Selecione uma matéria."); return; }

    const qtdQuestoes = form.questoes ? Number(form.questoes) : 0;
    const qtdAcertos = form.acertos ? Number(form.acertos) : 0;

    if (qtdAcertos > qtdQuestoes) { setErro("Acertos maior que questões."); return; }

    setLoading(true);
    try {
      let segundosFinais = 0;
      let dataInicioEnvio = new Date();

      if (modo === 'timer') {
        segundosFinais = segundos;
        dataInicioEnvio = dataInicioReal || new Date(); 
      } else {
        const partes = form.duracaoManual.split(':').map(Number);
        segundosFinais = (partes[0] || 0) * 3600 + (partes[1] || 0) * 60 + (partes[2] || 0);
        dataInicioEnvio = new Date(form.dataInicioManual);
      }

      if (segundosFinais < 1) { setErro("Tempo inválido."); setLoading(false); return; }

      const payload = {
        materiaId: Number(form.materiaId),
        topicoId: form.topicoId ? Number(form.topicoId) : null,
        tipoEstudoId: form.tipoEstudoId ? Number(form.tipoEstudoId) : null,
        dataInicio: dataInicioEnvio.toISOString(),
        segundos: segundosFinais,
        questoesFeitas: qtdQuestoes,
        questoesCertas: qtdAcertos,
        anotacoes: form.anotacoes,
        contarHorasNoCiclo: contarHoras // <--- ENVIANDO A DECISÃO DO USUÁRIO
      };

      await api.post('/registros', payload);
      
      if (onRegistroSalvo) onRegistroSalvo();

      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        resetarTudo();
      }, 2000);

    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  // Renderiza o input de tópico
  const renderSeletorTopico = () => {
    if (criandoTopico) {
      return (
        <div className="flex gap-1 animate-fade-in">
          <input 
            type="text" autoFocus placeholder="Nome do tópico..." value={novoTopicoNome}
            onChange={e => setNovoTopicoNome(e.target.value)}
            className="flex-1 border rounded-md p-1.5 text-sm outline-none"
            onKeyDown={e => e.key === 'Enter' && salvarNovoTopico()}
          />
          <button onClick={salvarNovoTopico} disabled={salvandoTopico} className="p-1.5 bg-green-100 text-green-700 rounded-md"><Check size={16} /></button>
          <button onClick={() => { setCriandoTopico(false); setErro(''); }} className="p-1.5 bg-gray-100 text-gray-600 rounded-md"><X size={16} /></button>
        </div>
      );
    }
    return (
      <div className="flex gap-1">
        <select 
          value={form.topicoId} onChange={e => setForm({...form, topicoId: e.target.value})}
          disabled={!form.materiaId} className="flex-1 border rounded-md p-2 text-sm bg-white disabled:bg-gray-50"
        >
          <option value="">{form.materiaId && topicos.length === 0 ? "Nenhum tópico..." : "Geral"}</option>
          {topicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
        </select>
        <button onClick={() => setCriandoTopico(true)} disabled={!form.materiaId} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md disabled:opacity-50"><Plus size={16} /></button>
      </div>
    );
  };

  // Renderiza os detalhes (Tipo, Questões, Switch)
  const renderDetalhes = () => (
    <div className="space-y-3 pt-3 border-t animate-fade-in">
      
      {/* LINHA 1: Tipo e Switch de Horas */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo de Estudo</label>
          <select value={form.tipoEstudoId} onChange={e => setForm({...form, tipoEstudoId: e.target.value})} className="w-full border rounded-md p-1.5 text-sm bg-white">
            <option value="">Selecione...</option>
            {tiposEstudo.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        {/* SWITCH INTELIGENTE */}
        <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 p-2 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={contarHoras} 
              onChange={e => setContarHoras(e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
          </div>
          <span className={`text-xs font-medium ${contarHoras ? 'text-green-700' : 'text-gray-500'}`}>
            {contarHoras ? 'Contabilizar tempo na meta do ciclo' : 'Não contar tempo no ciclo (apenas registro)'}
          </span>
        </label>
      </div>

      {/* LINHA 2: Questões */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Questões Feitas</label>
          <input type="number" min="0" value={form.questoes} onChange={e => setForm({...form, questoes: e.target.value})} className="w-full border rounded-md p-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acertos</label>
          <input type="number" min="0" value={form.acertos} onChange={e => setForm({...form, acertos: e.target.value})} className="w-full border rounded-md p-1.5 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Anotações</label>
        <textarea rows={2} value={form.anotacoes} onChange={e => setForm({...form, anotacoes: e.target.value})} className="w-full border rounded-md p-2 text-sm resize-none" placeholder="..." />
      </div>

      {erro && <div className="p-2 bg-red-50 text-red-700 text-xs rounded-md flex items-center gap-2"><AlertCircle size={14} /> {erro}</div>}

      <div className="flex gap-2 pt-1">
        <button onClick={() => setModalCancelarAberto(true)} className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium">Cancelar</button>
        <button onClick={salvar} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-sm">
          <Save size={16} /> {loading ? 'Salvando...' : 'SALVAR'}
        </button>
      </div>
    </div>
  );

  return (
    <>
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-auto transition-all">
      <div className="flex border-b">
        <button onClick={() => !ativo && setModo('timer')} disabled={ativo} className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'timer' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}><Clock size={16} /> Cronômetro</button>
        <button onClick={() => !ativo && setModo('manual')} disabled={ativo} className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50 cursor-pointer'}`}><Edit3 size={16} /> Manual</button>
      </div>

      <div className="p-4 space-y-4">
        {modo === 'timer' && (
          <div className="space-y-4 text-center">
            <div className={`text-5xl font-mono font-bold tracking-wider ${ativo && !pausado ? 'text-blue-600' : 'text-gray-700'}`}>{formatarTempo(segundos)}</div>
            <div className="grid grid-cols-1 gap-3 text-left">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Matéria</label>
                <select value={form.materiaId} onChange={e => setForm({...form, materiaId: e.target.value})} className="w-full border rounded-md p-2 text-sm bg-white">
                  <option value="">Selecione...</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Tópico</label>{renderSeletorTopico()}</div>
            </div>
            {!ativo ? (
              <button onClick={iniciar} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm transform hover:scale-[1.02]"><Play size={18} fill="currentColor" /> INICIAR</button>
            ) : (
              <div className="flex gap-2">
                {!pausado ? <button onClick={pausar} className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Pause size={18} fill="currentColor" /> PAUSAR</button>
                          : <button onClick={retomar} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Play size={18} fill="currentColor" /> RETOMAR</button>}
                <button onClick={() => setModalCancelarAberto(true)} className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold"><X size={18} /></button>
              </div>
            )}
          </div>
        )}

        {modo === 'manual' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Matéria *</label>
                <select value={form.materiaId} onChange={e => setForm({...form, materiaId: e.target.value})} className="w-full border rounded-md p-2 text-sm bg-white">
                  <option value="">Selecione...</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Tópico</label>{renderSeletorTopico()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Início</label><input type="datetime-local" value={form.dataInicioManual} onChange={e => setForm({...form, dataInicioManual: e.target.value})} className="w-full border rounded-md p-1.5 text-sm" /></div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Duração</label><input type="text" placeholder="HH:MM:SS" value={form.duracaoManual} onChange={e => setForm({...form, duracaoManual: e.target.value})} className="w-full border rounded-md p-2 text-sm" /></div>
            </div>
          </div>
        )}

        {/* DETALHES (Visível se Manual ou Timer Pausado) */}
        {(modo === 'manual' || (modo === 'timer' && pausado)) && renderDetalhes()}
      </div>

      <Modal isOpen={modalCancelarAberto} onClose={() => setModalCancelarAberto(false)} title="Descartar?">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Tem certeza que deseja descartar o tempo registrado?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalCancelarAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Voltar</button>
            <button onClick={resetarTudo} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">Descartar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalSucessoAberto} onClose={() => {}} title="">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-full animate-bounce"><CheckCircle size={48} /></div>
          <h3 className="text-xl font-bold text-gray-800">Registrado!</h3>
        </div>
      </Modal>
    </div>
    </>
  );
}