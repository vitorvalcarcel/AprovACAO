import { Archive, BookOpen, Building2, Calendar, Pencil, PlayCircle, Timer, Trash2 } from 'lucide-react';
import MobileActionMenu from '../MobileActionMenu';

export interface Concurso {
    id: number;
    nome: string;
    banca?: string;
    dataProva?: string;
    arquivado: boolean;
}

interface ConcursoCardProps {
    concurso: Concurso;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onOpenDisciplinas: () => void;
    onOpenCiclo: () => void;
}

export default function ConcursoCard({
    concurso,
    onEdit,
    onArchive,
    onDelete,
    onOpenDisciplinas,
    onOpenCiclo
}: ConcursoCardProps) {

    const calcularDiasRestantes = (dataProva?: string) => {
        if (!dataProva) return null;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const prova = new Date(dataProva + 'T00:00:00');
        const diffTime = prova.getTime() - hoje.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatarData = (data?: string) => {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const dias = calcularDiasRestantes(concurso.dataProva);
    let badgeCor = 'bg-blue-50 text-blue-700';
    let badgeTexto = `${dias} dias`;

    if (dias !== null) {
        if (dias < 0) { badgeCor = 'bg-gray-100 text-gray-500'; badgeTexto = 'Já passou'; }
        else if (dias === 0) { badgeCor = 'bg-green-100 text-green-700'; badgeTexto = 'É HOJE!'; }
        else if (dias <= 30) { badgeCor = 'bg-red-50 text-red-700 font-bold'; }
    }

    return (
        <div className="group relative bg-white p-4 rounded-xl border border-gray-100 shadow-sm md:shadow-none md:border-none md:rounded-none md:p-3 md:flex md:items-center md:justify-between hover:bg-gray-50 transition-colors">

            <div className="flex flex-col gap-3 md:flex-row md:gap-0 md:flex-1 md:items-center">

                <div className="flex items-start justify-between md:justify-start md:gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`hidden md:block w-1.5 h-1.5 rounded-full ${concurso.arquivado ? 'bg-orange-400' : 'bg-blue-600'}`} />
                        <span className={`font-bold text-lg md:text-base md:font-medium text-gray-800 ${concurso.arquivado ? 'line-through text-gray-400' : ''}`}>
                            {concurso.nome}
                        </span>
                        {concurso.arquivado && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Arquivado</span>}
                    </div>

                    <div className="md:hidden">
                        <MobileActionMenu
                            onEdit={onEdit}
                            onArchive={onArchive}
                            onDelete={onDelete}
                            isArchived={concurso.arquivado}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 md:pl-4">
                    {concurso.banca && <div className="flex items-center gap-1.5"><Building2 size={14} className="text-gray-400" />{concurso.banca}</div>}
                    {concurso.dataProva && <div className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" />{formatarData(concurso.dataProva)}</div>}
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 md:mt-0 md:justify-end md:gap-3">
                {dias !== null && !concurso.arquivado ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeCor}`}>
                        <Timer size={14} /> {badgeTexto}
                    </div>
                ) : <div />}

                {!concurso.arquivado && (
                    <div className="flex gap-2 md:hidden">
                        <button onClick={onOpenDisciplinas} className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BookOpen size={18} /></button>
                        <button onClick={onOpenCiclo} className="p-2 bg-green-50 text-green-600 rounded-lg"><PlayCircle size={18} /></button>
                    </div>
                )}

                {/* Botões Desktop */}
                <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!concurso.arquivado && (
                        <>
                            <button onClick={onOpenCiclo} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Gerar Ciclo"><PlayCircle size={16} /></button>
                            <button onClick={onOpenDisciplinas} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors" title="Disciplinas"><BookOpen size={16} /></button>
                        </>
                    )}
                    <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Editar"><Pencil size={16} /></button>
                    <button onClick={onArchive} className={`p-1.5 rounded transition-colors ${concurso.arquivado ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}><Archive size={16} /></button>
                    <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
}
