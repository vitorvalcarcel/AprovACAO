import Skeleton from '../Skeleton';

export default function TableSkeleton() {
  return (
    <div className="w-full">
      
      {/* =========================================
          VERSION MOBILE (Lista Compacta)
          ========================================= */}
      <div className="md:hidden space-y-3 pb-32">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
             {/* Checkbox placeholder */}
             <Skeleton className="w-5 h-5 rounded-md shrink-0" />
             
             <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" /> {/* Data */}
                    <Skeleton className="h-4 w-4" />  {/* Edit Icon */}
                </div>
                <Skeleton className="h-5 w-3/4" /> {/* Título Matéria */}
                <Skeleton className="h-3 w-1/2" /> {/* Tópico */}
                
                <div className="flex gap-2 pt-1">
                    <Skeleton className="h-4 w-16 rounded" /> {/* Tempo */}
                    <Skeleton className="h-4 w-12 rounded" /> {/* Questões */}
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* =========================================
          VERSION DESKTOP (Tabela Completa)
          ========================================= */}
      <div className="hidden md:flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-col h-full">
        {/* Header da Tabela */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex gap-4">
          <Skeleton className="h-4 w-24 bg-gray-300" />
          <Skeleton className="h-4 w-32 bg-gray-300" />
          <Skeleton className="h-4 w-20 bg-gray-300 ml-auto" />
        </div>

        {/* Linhas da Tabela */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4">
              {/* Coluna 1: Data */}
              <div className="w-24 shrink-0">
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Coluna 2: Info Principal */}
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-4 w-full max-w-[200px]" />
                <Skeleton className="h-3 w-32" />
              </div>

              {/* Coluna 3: Badges/Numeros */}
              <div className="w-20 shrink-0 flex justify-center">
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>

              {/* Coluna 4: Ações */}
              <div className="w-10 shrink-0 flex justify-end">
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}