import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Search } from 'lucide-react';
import api from '../services/api';
import Filtros, { type FiltrosState } from '../components/Filtros';

interface Registro {
  id: number;
  nomeMateria: string;
  nomeTopico?: string;
  nomeConcurso?: string;
  dataInicio: string;
  segundos: number;
  questoesFeitas: number;
  questoesCertas: number;
  anotacoes?: string;
}

export default function Historico() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Guardamos o filtro atual para poder recarregar
  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosState | null>(null);

  const carregarDados = async (filtros: FiltrosState) => {
    setLoading(true);
    setFiltrosAtuais(filtros);
    
    try {
      // Converte array [1,2] para string "1,2" para passar na URL
      const params: any = {};
      if (filtros.dataInicio) params.inicio = filtros.dataInicio + 'T00:00:00';
      if (filtros.dataFim) params.fim = filtros.dataFim + 'T23:59:59';
      if (filtros.materiaIds.length) params.materias = filtros.materiaIds.join(',');
      if (filtros.concursoIds.length) params.concursos = filtros.concursoIds.join(',');
      if (filtros.tipoEstudoIds.length) params.tipos = filtros.tipoEstudoIds.join(',');

      const response = await api.get<Registro[]>('/registros', { params });
      setRegistros(response.data);
    } catch (error) {
      console.error("Erro ao filtrar", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarTempo = (seg: number) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatarData = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-theme(spacing.24))] flex flex-col">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Histórico de Estudos</h1>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
          {registros.length} registros encontrados
        </div>
      </div>

      {/* COMPONENTE DE FILTROS REUTILIZÁVEL */}
      <Filtros onChange={carregarDados} />

      {/* TABELONA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Matéria / Tópico</th>
                <th className="px-4 py-3">Concurso</th>
                <th className="px-4 py-3 text-center">Tempo</th>
                <th className="px-4 py-3 text-center">Questões</th>
                <th className="px-4 py-3 text-center">Desempenho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Carregando...</td></tr>
              ) : registros.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400">Nenhum registro encontrado com esses filtros.</td></tr>
              ) : (
                registros.map(reg => (
                  <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatarData(reg.dataInicio)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{reg.nomeMateria}</div>
                      {reg.nomeTopico && <div className="text-xs text-gray-500">{reg.nomeTopico}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {reg.nomeConcurso || '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-blue-700">
                      <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                        <Clock size={14} /> {formatarTempo(reg.segundos)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {reg.questoesFeitas > 0 ? reg.questoesFeitas : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {reg.questoesFeitas > 0 ? (
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                          (reg.questoesCertas/reg.questoesFeitas) >= 0.8 ? 'bg-green-100 text-green-700' :
                          (reg.questoesCertas/reg.questoesFeitas) >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {Math.round((reg.questoesCertas / reg.questoesFeitas) * 100)}%
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}