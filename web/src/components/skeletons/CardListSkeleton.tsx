import Skeleton from '../Skeleton';

export default function CardListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Simula 5 cards na lista */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Ícone */}
            <Skeleton className="w-10 h-10 rounded-lg" />
            
            <div className="space-y-2 flex-1 max-w-sm">
              {/* Título */}
              <Skeleton className="h-5 w-48" />
              {/* Subtítulo / Badges */}
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="flex gap-2">
            {/* Botões de ação */}
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}