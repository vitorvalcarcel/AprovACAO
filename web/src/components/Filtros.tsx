import { useState, useEffect, useRef } from 'react';
import { Calendar, Filter, ChevronDown, Check, X } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Opcao { id: number; nome: string; }

export interface FiltrosState {
  dataInicio: string;
  dataFim: string;
  concursoIds: number[];
  materiaIds: number[];
  topicoIds: number[];
  tipoEstudoIds: number[];
}

interface FiltrosProps {
  onChange: (filtros: FiltrosState) => void;
}

export default function Filtros({ onChange }: FiltrosProps) {
  // Listas
  const [concursos, setConcursos] = useState<Opcao[]>([]);
  const [materias, setMaterias] = useState<Opcao[]>([]);
  const [tiposEstudo, setTiposEstudo] = useState<Opcao[]>([]);

  // Seleção
  const [periodo, setPeriodo] = useState('maximo');
  const [datas, setDatas] = useState({ inicio: '', fim: '' });
  
  const [selConcursos, setSelConcursos] = useState<number[]>([]);
  const [selMaterias, setSelMaterias] = useState<number[]>([]);
  const [selTipos, setSelTipos] = useState<number[]>([]);

  // Estado Mobile Off-Canvas
  const [mobileFiltrosOpen, setMobileFiltrosOpen] = useState(false);

  // Carrega listas
  useEffect(() => {
    api.get('/concursos').then(res => setConcursos(res.data)).catch(() => {});
    api.get('/materias').then(res => setMaterias(res.data)).catch(() => {});
    api.get('/tipos-estudo').then(res => setTiposEstudo(res.data)).catch(() => {});
  }, []);

  // Lógica de Datas (Automática)
  useEffect(() => {
    const hoje = new Date();
    let inicio = new Date();
    let fim = new Date();

    switch (periodo) {
      case 'hoje': break;
      case 'ontem': 
        inicio.setDate(hoje.getDate() - 1); 
        fim.setDate(hoje.getDate() - 1); 
        break;
      case 'esta_semana': 
        inicio.setDate(hoje.getDate() - hoje.getDay()); 
        break;
      case 'semana_passada': 
        inicio.setDate(hoje.getDate() - hoje.getDay() - 7); 
        fim.setDate(hoje.getDate() - hoje.getDay() - 1); 
        break;
      case 'este_mes': 
        inicio.setDate(1); 
        break;
      case 'mes_passado': 
        inicio.setMonth(hoje.getMonth() - 1); 
        inicio.setDate(1); 
        fim.setDate(0); 
        break;
      case '7dias': 
        inicio.setDate(hoje.getDate() - 6); 
        break;
      case '30dias': 
        inicio.setDate(hoje.getDate() - 29); 
        break;
      case 'maximo':
        setDatas({ inicio: '', fim: '' });
        return;
      case 'personalizado': 
        return;
    }

    if (periodo !== 'personalizado' && periodo !== 'maximo') {
      setDatas({ 
        inicio: inicio.toISOString().split('T')[0], 
        fim: fim.toISOString().split('T')[0] 
      });
    }
  }, [periodo]);

  // Notifica o Pai
  useEffect(() => {
    onChange({
      dataInicio: datas.inicio,
      dataFim: datas.fim,
      concursoIds: selConcursos,
      materiaIds: selMaterias,
      topicoIds: [], 
      tipoEstudoIds: selTipos
    });
  }, [datas, selConcursos, selMaterias, selTipos]);

  // Componente Dropdown Interno
  const MultiSelect = ({ label, options, selected, setSelected }: any) => {
    const [aberto, setAberto] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const clickFora = (e: any) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false); };
      document.addEventListener('mousedown', clickFora);
      return () => document.removeEventListener('mousedown', clickFora);
    }, []);

    const toggle = (id: number) => {
      setSelected(selected.includes(id) ? selected.filter((i: number) => i !== id) : [...selected, id]);
    };

    return (
      <div className="relative min-w-[140px]" ref={ref}>
        <button onClick={() => setAberto(!aberto)} className={`w-full border rounded-md px-3 py-1.5 text-sm flex items-center justify-between bg-white transition-colors ${selected.length > 0 ? 'border-blue-500 text-blue-700 bg-blue-50' : 'text-gray-600'}`}>
          <span className="truncate">{selected.length === 0 ? label : `${selected.length} selecionados`}</span>
          <ChevronDown size={14} />
        </button>
        {aberto && (
          <div className="absolute z-50 mt-1 w-60 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto p-1">
            {options.map((op: Opcao) => (
              <div key={op.id} onClick={() => toggle(op.id)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer rounded-md">
                <div className={`w-4 h-4 border rounded flex items-center justify-center ${selected.includes(op.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                  {selected.includes(op.id) && <Check size={10} />}
                </div>
                <span className="truncate">{op.nome}</span>
              </div>
            ))}
            {selected.length > 0 && <div onClick={() => setSelected([])} className="border-t mt-1 pt-1 text-center text-xs text-red-500 cursor-pointer py-1">Limpar</div>}
          </div>
        )}
      </div>
    );
  };

  const contagemFiltrosAtivos = selConcursos.length + selMaterias.length + selTipos.length;

  return (
    <>
      {/* --- BLOCO DESKTOP (Original) --- */}
      <div className="hidden lg:block bg-white p-3 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded text-blue-600"><Calendar size={18} /></div>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="bg-transparent font-medium text-gray-700 outline-none text-sm cursor-pointer">
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="esta_semana">Esta Semana</option>
              <option value="semana_passada">Semana Passada</option>
              <option value="este_mes">Este Mês</option>
              <option value="mes_passado">Mês Passado</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="maximo">Máximo (Tudo)</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div className={`flex items-center gap-2 text-sm ${periodo !== 'personalizado' ? 'opacity-50 pointer-events-none' : ''}`}>
            <input type="date" value={datas.inicio} onChange={e => { setDatas({...datas, inicio: e.target.value}); setPeriodo('personalizado'); }} className="border rounded px-2 py-1 outline-none focus:border-blue-500" />
            <span className="text-gray-400">até</span>
            <input type="date" value={datas.fim} onChange={e => { setDatas({...datas, fim: e.target.value}); setPeriodo('personalizado'); }} className="border rounded px-2 py-1 outline-none focus:border-blue-500" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1 text-gray-400 mr-2 text-xs font-medium uppercase"><Filter size={14} /> Filtros:</div>
          <MultiSelect label="Concursos" options={concursos} selected={selConcursos} setSelected={setSelConcursos} />
          <MultiSelect label="Matérias" options={materias} selected={selMaterias} setSelected={setSelMaterias} />
          <MultiSelect label="Tipos" options={tiposEstudo} selected={selTipos} setSelected={setSelTipos} />
          
          {contagemFiltrosAtivos > 0 && (
            <button onClick={() => { setSelConcursos([]); setSelMaterias([]); setSelTipos([]); }} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 ml-auto">
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* --- BLOCO MOBILE (Dual View) --- */}
      <div className="lg:hidden flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-sm text-gray-500 font-medium">
          {contagemFiltrosAtivos > 0 ? `${contagemFiltrosAtivos} filtros ativos` : 'Filtrar resultados'}
        </span>
        <button 
          onClick={() => setMobileFiltrosOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${contagemFiltrosAtivos > 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Filter size={16} /> Filtros
        </button>
      </div>

      {/* MODAL DE FILTROS MOBILE */}
      <Modal isOpen={mobileFiltrosOpen} onClose={() => setMobileFiltrosOpen(false)} title="Filtrar">
        <div className="flex flex-col gap-6">
          
          {/* Seção Data */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase">Período</label>
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <Calendar size={18} className="text-blue-600" />
              <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="bg-transparent w-full text-sm font-medium outline-none">
                <option value="hoje">Hoje</option>
                <option value="ontem">Ontem</option>
                <option value="esta_semana">Esta Semana</option>
                <option value="semana_passada">Semana Passada</option>
                <option value="este_mes">Este Mês</option>
                <option value="mes_passado">Mês Passado</option>
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="maximo">Máximo (Tudo)</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            {periodo === 'personalizado' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Início</label>
                  <input type="date" value={datas.inicio} onChange={e => setDatas({...datas, inicio: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-1 block">Fim</label>
                  <input type="date" value={datas.fim} onChange={e => setDatas({...datas, fim: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Seção Categorias */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Concursos</label>
              <MultiSelect label="Selecionar Concursos" options={concursos} selected={selConcursos} setSelected={setSelConcursos} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Matérias</label>
              <MultiSelect label="Selecionar Matérias" options={materias} selected={selMaterias} setSelected={setSelMaterias} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tipos de Estudo</label>
              <MultiSelect label="Selecionar Tipos" options={tiposEstudo} selected={selTipos} setSelected={setSelTipos} />
            </div>
          </div>

          <button 
            onClick={() => setMobileFiltrosOpen(false)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm active:scale-[0.98] transition-transform"
          >
            Aplicar Filtros
          </button>
        </div>
      </Modal>
    </>
  );
}