import { useLocation, Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerificarEmail() {
  const location = useLocation();
  const email = location.state?.email || "seu e-mail";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        
        <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={40} className="text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifique seu e-mail</h1>
        <p className="text-gray-600 mb-6">
          Enviamos um link de confirmação para <br/>
          <strong className="text-gray-800">{email}</strong>
        </p>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-500 mb-6">
          <p>Não recebeu? Verifique sua pasta de Spam ou Lixo Eletrônico.</p>
        </div>

        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
        >
          <CheckCircle size={18} /> Voltar para Login
        </Link>
      </div>
    </div>
  );
}