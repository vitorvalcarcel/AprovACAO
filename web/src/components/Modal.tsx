import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      
      {/* Container do Modal - Responsivo: Bottom Sheet no Mobile, Card no Desktop */}
      <div className="bg-white w-full md:w-full md:max-w-md rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden animate-slide-up md:animate-fade-in max-h-[90vh] md:max-h-full flex flex-col">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com scroll se necessário */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}