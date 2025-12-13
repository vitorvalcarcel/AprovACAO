import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Archive } from 'lucide-react';

interface MobileActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}

export default function MobileActionMenu({ onEdit, onDelete, onArchive, isArchived }: MobileActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
          <div className="flex flex-col">
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50"
              >
                <Edit2 size={16} className="text-blue-600" /> Editar
              </button>
            )}
            
            {onArchive && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onArchive(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 border-b border-gray-50"
              >
                <Archive size={16} className="text-orange-500" /> 
                {isArchived ? 'Desarquivar' : 'Arquivar'}
              </button>
            )}

            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-100"
              >
                <Trash2 size={16} /> Excluir
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}