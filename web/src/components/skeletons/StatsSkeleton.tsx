import Skeleton from '../Skeleton';

export default function StatsSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Filtros */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Cards de Resumo (Grid de 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 flex flex-col">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex-1 flex items-end gap-2 px-4 pb-2">
          {/* Simula barras do gráfico */}
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}