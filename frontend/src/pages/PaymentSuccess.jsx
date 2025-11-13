import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-3xl shadow-2xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-5xl">✅</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">¡Pago Exitoso!</h1>
          <p className="text-gray-600">
            Tu suscripción anual ha sido activada correctamente
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-700">
            Ahora tienes acceso a todas las funciones premium por 1 año completo
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-6 text-lg rounded-xl"
          >
            Ir al Dashboard
          </Button>
          <p className="text-sm text-gray-500">
            Serás redirigido automáticamente en 5 segundos...
          </p>
        </div>
      </Card>
    </div>
  );
}
