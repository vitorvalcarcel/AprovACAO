import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { type ToastMessage } from './index';
import ToastContainer from './ToastContainer';

interface ToastContextData {
  showToast(type: 'success' | 'error' | 'info', title: string, message?: string): void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2);
    setMessages(prev => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Escuta eventos globais disparados pelo interceptor do Axios
  useEffect(() => {
    const handleAxiosEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, title, message } = customEvent.detail;
      showToast(type, title, message);
    };

    window.addEventListener('toast-event', handleAxiosEvent);
    return () => window.removeEventListener('toast-event', handleAxiosEvent);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer messages={messages} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
