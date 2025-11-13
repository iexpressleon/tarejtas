import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">❌</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Pago Rechazado</h1>
          <p className="text-gray-600">
            No pudimos procesar tu pago en este momento
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            Por favor, verifica tu método de pago e intenta nuevamente
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/premium")}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl"
          >
            Intentar Nuevamente
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="w-full py-3"
          >
            Volver al Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}
