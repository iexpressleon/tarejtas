import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Landing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get(`${API}/auth/me`, { withCredentials: true });
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{t('landing.title')}</span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector variant="compact" />
          <Button
            data-testid="header-login-btn"
            variant="outline"
            onClick={() => navigate("/registro")}
            className="hover:scale-105 transition-transform"
          >
            {t('auth.login')}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
            {t('landing.hero_title')}
          </h1>
          
          {/* Pricing Banner */}
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <div className="text-3xl font-bold mb-1">🎉 {t('landing.trial_text')}</div>
            <div className="text-lg">Después solo $300 pesos al año</div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              data-testid="hero-cta-btn"
              size="lg"
              onClick={() => navigate("/registro")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              {t('landing.cta_primary')}
            </Button>
            <Button
              data-testid="demo-btn"
              size="lg"
              variant="outline"
              onClick={() => navigate("/t/demo")}
              className="px-8 py-6 text-lg rounded-xl hover:scale-105 transition-all"
            >
              Ver demo
            </Button>
          </div>
        </div>

        {/* Preview Card */}
        <div className="mt-16 max-w-md mx-auto">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-2xl rounded-3xl hover:shadow-3xl transition-shadow">
            <div className="space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">JD</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Juan Pérez</h3>
                <p className="text-gray-600 mt-2">Diseñador & Desarrollador</p>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse delay-75"></div>
                <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl animate-pulse delay-150"></div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">
            Precio simple y transparente
          </h2>
          <p className="text-xl text-center text-gray-600 mb-12">
            Sin sorpresas, sin pagos ocultos
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Trial */}
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-green-200 rounded-2xl shadow-xl">
              <div className="text-center">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  🎉 GRATIS
                </div>
                <h3 className="text-3xl font-bold mb-2">30 días</h3>
                <p className="text-gray-600 mb-6">Prueba completa sin restricciones</p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Tarjeta digital completa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Enlaces ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Código QR personalizado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Subir archivos PDF/JPG</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>Todas las funciones</span>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Annual */}
            <Card className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 text-xs font-bold transform rotate-12 translate-x-8 translate-y-2">
                MEJOR VALOR
              </div>
              <div className="text-center relative z-10">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  💳 SUSCRIPCIÓN
                </div>
                <div className="mb-2">
                  <span className="text-5xl font-bold">$300</span>
                  <span className="text-xl ml-2">MXN</span>
                </div>
                <p className="text-white/90 mb-6">por año</p>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span>Todo lo del período de prueba</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span>Actualizaciones continuas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">✓</span>
                    <span>Sin límites de uso</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              💡 <span className="font-semibold">Empieza gratis hoy</span> - No se requiere tarjeta de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Características principales
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-2xl hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Fácil de usar</h3>
            <p className="text-gray-600">Crea tu tarjeta en minutos sin conocimientos técnicos</p>
          </Card>
          <Card className="p-8 bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-2xl hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Responsive</h3>
            <p className="text-gray-600">Se ve perfecta en cualquier dispositivo</p>
          </Card>
          <Card className="p-8 bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-2xl hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Personalizable</h3>
            <p className="text-gray-600">Elige colores, plantillas y contenido a tu gusto</p>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros usuarios
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Miles de profesionales ya están usando TarjetaQR.app
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Testimonio 1 */}
          <Card className="p-8 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">María González</h4>
                <p className="text-sm text-gray-600">Diseñadora Freelance</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">⭐</span>
              ))}
            </div>
            <p className="text-gray-700 italic">
              "Increíble herramienta para compartir mi portafolio. Mis clientes pueden ver todo mi trabajo con solo escanear un código QR. ¡Me encanta!"
            </p>
          </Card>

          {/* Testimonio 2 */}
          <Card className="p-8 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Carlos Méndez</h4>
                <p className="text-sm text-gray-600">Dueño de Restaurante</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">⭐</span>
              ))}
            </div>
            <p className="text-gray-700 italic">
              "Puse un código QR en cada mesa y ahora los clientes ven el menú digital al instante. Super profesional y fácil de actualizar."
            </p>
          </Card>

          {/* Testimonio 3 */}
          <Card className="p-8 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Ana Rodríguez</h4>
                <p className="text-sm text-gray-600">Agente de Bienes Raíces</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">⭐</span>
              ))}
            </div>
            <p className="text-gray-700 italic">
              "Perfecto para networking. Comparto mi tarjeta digital en eventos y todos pueden guardar mi contacto sin necesidad de aplicaciones."
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 TarjetaQR.app. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
