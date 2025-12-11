import Skeleton from '../Skeleton';

export default function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
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
            <div className="w-24">
              <Skeleton className="h-4 w-16" />
            </div>
            
            {/* Coluna 2: Info Principal */}
            <div className="flex-1 max-w-md space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>

            {/* Coluna 3: Badges/Numeros */}
            <div className="w-20 flex justify-center">
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>

            {/* Coluna 4: Ações */}
            <div className="w-10 flex justify-end">
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}