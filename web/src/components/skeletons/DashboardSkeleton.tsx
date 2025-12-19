import Skeleton from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full">
      
      {/* Header: Título e Botões (Responsivo) */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 md:w-64" /> {/* Título */}
          <Skeleton className="h-4 w-32 md:w-48" /> {/* Subtítulo */}
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <Skeleton className="h-9 w-24 rounded-lg" /> {/* Botão */}
          <Skeleton className="h-9 w-32 rounded-lg" /> {/* Badge */}
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Header da Tabela (Some no mobile se a tabela real também sumir headers) */}
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between">
          <Skeleton className="h-4 w-20 bg-gray-300" />
          <Skeleton className="h-4 w-20 bg-gray-300 hidden md:block" />
          <Skeleton className="h-4 w-20 bg-gray-300" />
        </div>

        {/* Itens */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4">
              {/* Coluna Matéria - Flexível */}
              <div className="w-1/2 md:w-1/3 flex items-center gap-2 md:gap-3">
                <Skeleton className="w-1.5 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>

              {/* Coluna Barra de Progresso - Esconde no mobile se ficar apertado ou ajusta largura */}
              <div className="hidden md:block flex-1 px-2 space-y-2">
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-2.5 w-2/3 rounded-full" />
              </div>

              {/* Coluna Saldos */}
              <div className="w-1/4 md:w-1/6 flex flex-col items-end gap-1 ml-auto">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}