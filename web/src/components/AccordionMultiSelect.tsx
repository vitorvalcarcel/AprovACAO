import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, Minus } from 'lucide-react';

interface Topico { id: number; nome: string; }
interface MateriaComTopicos { id: number; nome: string; topicos: Topico[]; }

interface AccordionMultiSelectProps {
  options: MateriaComTopicos[];
  selectedParents: number[];
  selectedChildren: number[];
  onChange: (parents: number[], children: number[]) => void;
  label?: string;
}

export default function AccordionMultiSelect({ options, selectedParents, selectedChildren, onChange, label }: AccordionMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpand = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpanded(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleParentClick = (materia: MateriaComTopicos) => {
    const isSelected = selectedParents.includes(materia.id);
    let newParents = [...selectedParents];
    let newChildren = [...selectedChildren];

    if (isSelected) {
      // Desmarcar Pai: remove pai e limpa filhos dessa matéria
      newParents = newParents.filter(id => id !== materia.id);
      newChildren = newChildren.filter(childId => !materia.topicos.some(t => t.id === childId));
    } else {
      // Marcar Pai: adiciona pai e remove filhos (pois pai engloba tudo)
      newParents.push(materia.id);
      newChildren = newChildren.filter(childId => !materia.topicos.some(t => t.id === childId));
    }
    onChange(newParents, newChildren);
  };

  const handleChildClick = (materiaId: number, topicoId: number) => {
    // Se o pai já está selecionado, ao clicar no filho, removemos o pai e marcamos APENAS esse filho
    // Isso permite refinar a busca de "Tudo da Matéria" para "Só este tópico"
    if (selectedParents.includes(materiaId)) {
       const newParents = selectedParents.filter(p => p !== materiaId);
       const newChildren = [...selectedChildren, topicoId];
       onChange(newParents, newChildren);
       return;
    }

    const isChildSelected = selectedChildren.includes(topicoId);
    let newChildren = isChildSelected 
      ? selectedChildren.filter(c => c !== topicoId)
      : [...selectedChildren, topicoId];

    // LÓGICA ALTERADA: Não promovemos mais a Pai automaticamente.
    // O usuário pode selecionar todos os tópicos explicitamente se desejar.
    
    onChange(selectedParents, newChildren);
  };

  const totalSelected = selectedParents.length + selectedChildren.length;

  return (
    <div className="relative min-w-[200px]" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full border rounded-md px-3 py-1.5 text-sm flex items-center justify-between bg-white transition-colors ${totalSelected > 0 ? 'border-blue-500 text-blue-700 bg-blue-50' : 'text-gray-600'}`}
      >
        <span className="truncate">{totalSelected === 0 ? label : `${totalSelected} selecionados`}</span>
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white border rounded-lg shadow-xl max-h-[400px] overflow-y-auto p-1 flex flex-col gap-1">
          {options.map(materia => {
            const isParentSelected = selectedParents.includes(materia.id);
            const childrenSelectedCount = materia.topicos.filter(t => selectedChildren.includes(t.id)).length;
            // Visualmente 'Indeterminado' se tem filhos selecionados mas não o pai
            const isIndeterminate = !isParentSelected && childrenSelectedCount > 0;
            const isExpanded = expanded.includes(materia.id);

            return (
              <div key={materia.id} className="rounded-md overflow-hidden border border-transparent hover:bg-gray-50">
                {/* Linha da Matéria (Pai) */}
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <button 
                    onClick={(e) => toggleExpand(e, materia.id)}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500"
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  <div 
                    onClick={() => handleParentClick(materia)}
                    className={`w-4 h-4 border rounded flex items-center justify-center cursor-pointer transition-colors ${
                      isParentSelected || isIndeterminate 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {isParentSelected && <Check size={10} />}
                    {isIndeterminate && <Minus size={10} />}
                  </div>

                  <span onClick={() => handleParentClick(materia)} className="text-sm font-medium text-gray-700 flex-1 cursor-pointer truncate select-none">
                    {materia.nome}
                  </span>
                </div>

                {/* Lista de Tópicos (Filhos) */}
                {isExpanded && (
                  <div className="pl-9 pr-2 pb-2 space-y-1 border-l-2 border-gray-100 ml-4 mb-1">
                    {materia.topicos.length === 0 && <span className="text-xs text-gray-400 italic">Sem tópicos</span>}
                    {materia.topicos.map(topico => {
                      const isSelected = isParentSelected || selectedChildren.includes(topico.id);
                      return (
                        <div 
                          key={topico.id} 
                          onClick={() => handleChildClick(materia.id, topico.id)}
                          className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                        >
                          <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
                            {isSelected && <Check size={8} />}
                          </div>
                          <span className={`text-xs select-none ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                            {topico.nome}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {totalSelected > 0 && (
            <div 
              onClick={() => onChange([], [])} 
              className="border-t mt-1 pt-2 pb-1 text-center text-xs text-red-500 cursor-pointer font-medium hover:bg-red-50 rounded"
            >
              Limpar Filtros
            </div>
          )}
        </div>
      )}
    </div>
  );
}