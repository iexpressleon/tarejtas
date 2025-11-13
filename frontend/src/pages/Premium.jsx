import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Premium() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error loading user:", error);
      if (error.response?.status === 401) {
        navigate("/registro");
      }
    }
  };

  const handleUpgrade = async () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para actualizar");
      navigate("/registro");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API}/payments/create-preference`,
        { user_id: currentUser.id },
        { withCredentials: true }
      );
      
      const { init_point } = response.data;
      
      if (init_point) {
        // Redirect to Mercado Pago checkout
        window.location.href = init_point;
      } else {
        toast.error("Error al crear la preferencia de pago");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error(error.response?.data?.detail || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: "Sin marca TarjetaDigital",
      description: "Remueve el footer con nuestra marca",
      icon: "✨",
    },
    {
      title: "Más plantillas",
      description: "Acceso a plantillas premium exclusivas",
      icon: "🎨",
    },
    {
      title: "Estadísticas",
      description: "Ve quién visita tu tarjeta y cuándo",
      icon: "📈",
    },
    {
      title: "Más enlaces",
      description: "Enlaces ilimitados (free: hasta 10)",
      icon: "🔗",
    },
    {
      title: "Soporte prioritario",
      description: "Respuestas rápidas a tus consultas",
      icon: "👥",
    },
    {
      title: "Dominio personalizado",
      description: "Usa tu propio dominio para tu tarjeta",
      icon: "🌐",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            data-testid="back-to-dashboard-btn"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            ← Volver
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                ⭐ PREMIUM
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-900">
              {currentUser?.plan === "paid" ? (
                <>
                  Renovar tu
                  <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    suscripción premium
                  </span>
                </>
              ) : (
                <>
                  Lleva tu tarjeta al
                  <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    siguiente nivel
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {currentUser?.plan === "paid" 
                ? "Extiende tu suscripción por un año adicional y sigue disfrutando de todas las funciones premium"
                : "Desbloquea funciones exclusivas y destaca aún más con tu tarjeta digital profesional"
              }
            </p>
          </div>

          {/* Pricing */}
          <Card className="p-8 max-w-sm mx-auto bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-3xl shadow-2xl">
            <div className="space-y-6">
              <div>
                <div className="text-5xl font-bold text-gray-900">
                  $300
                  <span className="text-xl text-gray-600 font-normal">/año</span>
                </div>
                <p className="text-gray-600 mt-2">Pago único anual</p>
              </div>
              <Button
                data-testid="upgrade-btn"
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? "Procesando..." 
                  : currentUser?.plan === "paid" 
                    ? "💳 Renovar por 1 año más" 
                    : "💳 Pagar con Mercado Pago"
                }
              </Button>
              <p className="text-sm text-gray-500">
                {currentUser?.plan === "paid" 
                  ? "Tu suscripción se extenderá automáticamente por 1 año adicional"
                  : "Pago seguro procesado por Mercado Pago"
                }
              </p>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Todo lo que obtienes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-indigo-200 rounded-2xl hover:shadow-xl transition-all text-left"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
