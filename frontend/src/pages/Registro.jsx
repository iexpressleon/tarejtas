import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      await axios.post(
        `${API}${endpoint}`,
        payload,
        { withCredentials: true }
      );

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
                ? "Bienvenido de nuevo a TarjetaDigital"
                : "Crea tu tarjeta digital en segundos"}
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
