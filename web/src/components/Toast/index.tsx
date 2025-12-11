import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    requestAnimationFrame(() => setVisible(true));
    
    // Auto-remove após 4 segundos
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Espera a animação de saída
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleRemove = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle className="text-green-500" size={24} />,
    error: <AlertCircle className="text-red-500" size={24} />,
    info: <Info className="text-blue-500" size={24} />
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500'
  };

  return (
    <div 
      className={`
        relative flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg border-l-4 w-80 md:w-96 transition-all duration-300 transform
        ${borderColors[toast.type]}
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm">{toast.title}</h4>
        {toast.message && <p className="text-gray-600 text-sm mt-1 leading-snug">{toast.message}</p>}
      </div>

      <button onClick={handleRemove} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={18} />
      </button>
    </div>
  );
}