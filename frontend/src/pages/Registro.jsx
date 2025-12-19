import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Registro() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [visitCount, setVisitCount] = useState(0);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkAuth();
    loadStats();
    registerVisit();
    
    // Check for error from OAuth callback
    if (location.state?.error) {
      toast.error(location.state.error);
    }
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get(`${API}/auth/me`, { withCredentials: true });
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/register/stats`);
      setVisitCount(response.data.visit_count || 0);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const registerVisit = async () => {
    try {
      // Register visit (fire and forget)
      await axios.post(`${API}/register/visit`);
      // Reload stats after registering
      setTimeout(loadStats, 500);
    } catch (error) {
      // Ignore errors for visit tracking
      console.error("Error registering visit:", error);
    }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!isLogin && !name) {
      toast.error("Por favor ingresa tu nombre");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = isLogin 
        ? { email, password }
        : { name, email, password };

      const response = await axios.post(
        `${API}${endpoint}`,
        payload,
        { withCredentials: true }
      );

      // Save token to localStorage for mobile compatibility
      if (response.data.session_token) {
        localStorage.setItem('session_token', response.data.session_token);
      }

      toast.success(isLogin ? "¡Bienvenido de nuevo!" : "¡Cuenta creada exitosamente!");
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      const message = error.response?.data?.detail || 
        (isLogin ? "Email o contraseña incorrectos" : "Error al crear cuenta");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100 shadow-2xl rounded-3xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? "Bienvenido de nuevo a TarjetaQR.app"
                : "Crea tu tarjeta QR en segundos"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  data-testid="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="mt-2"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-2"
                required
                minLength={6}
              />
            </div>

            <Button
              data-testid="submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg rounded-xl hover:scale-105 transition-all shadow-lg"
            >
              {isSubmitting 
                ? "Procesando..." 
                : isLogin 
                  ? "Iniciar sesión" 
                  : "Crear cuenta"}
            </Button>
          </form>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            data-testid="google-login-btn"
            type="button"
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full py-6 text-lg rounded-xl border-2 border-gray-300 hover:border-indigo-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          {/* Toggle Login/Register */}
          <div className="text-center">
            <button
              data-testid="toggle-mode-btn"
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setName("");
                setEmail("");
                setPassword("");
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin 
                ? "¿No tienes cuenta? Regístrate aquí"
                : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center pt-4">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </div>
        </div>
      </Card>
    </div>
  );
}
