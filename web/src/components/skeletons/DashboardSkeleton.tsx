import Skeleton from '../Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* Header: Título e Botões */}
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" /> {/* Título */}
          <Skeleton className="h-4 w-32" /> {/* Subtítulo */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" /> {/* Botão Encerrar */}
          <Skeleton className="h-9 w-32 rounded-lg" /> {/* Badge Progresso */}
        </div>
      </div>

      {/* Card Principal (Tabela de Ciclo) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        {/* Header da Tabela */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between">
          <Skeleton className="h-4 w-20 bg-gray-300" />
          <Skeleton className="h-4 w-20 bg-gray-300" />
          <Skeleton className="h-4 w-20 bg-gray-300" />
        </div>

        {/* Itens do Ciclo */}
        <div className="divide-y divide-gray-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-3 flex items-center gap-4">
              {/* Coluna Matéria */}
              <div className="w-1/3 flex items-center gap-3">
                <Skeleton className="w-1.5 h-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>

              {/* Coluna Barra de Progresso */}
              <div className="flex-1 px-2 space-y-2">
                <Skeleton className="h-2.5 w-full rounded-full" />
                <Skeleton className="h-2.5 w-2/3 rounded-full" />
              </div>

              {/* Coluna Saldos */}
              <div className="w-1/6 flex flex-col items-end gap-1">
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