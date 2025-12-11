import Toast, { type ToastMessage } from './index';

interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ messages, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {/* pointer-events-auto é necessário dentro do toast para permitir clique no fechar */}
      <div className="pointer-events-auto flex flex-col gap-2">
        {messages.map(msg => (
          <Toast key={msg.id} toast={msg} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
