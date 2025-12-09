export default function Dashboard() {

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Conteúdo de Exemplo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Ciclos Ativos</h2>
            <p className="text-gray-600 text-3xl font-bold">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Horas Estudadas</h2>
            <p className="text-gray-600 text-3xl font-bold">0h</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Próxima Meta</h2>
            <p className="text-gray-500 text-sm">Nenhum ciclo configurado.</p>
          </div>
        </div>

      </div>
    </div>
  );
}