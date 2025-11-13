import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white/80 backdrop-blur-sm border-2 border-yellow-200 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">⏳</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Pago Pendiente</h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            Recibirás una notificación por correo electrónico cuando se complete el proceso. Esto puede tomar algunos minutos.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white py-6 text-lg rounded-xl"
          >
            Ir al Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            Podrás revisar el estado de tu suscripción en tu dashboard
          </p>
        </div>
      </Card>
    </div>
  );
}
