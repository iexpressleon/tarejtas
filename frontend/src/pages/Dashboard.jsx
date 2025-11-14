import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tarjetas, setTarjetas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, tarjetasRes, messagesRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { withCredentials: true }),
        axios.get(`${API}/tarjetas`, { withCredentials: true }),
        axios.get(`${API}/messages/user`, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);
      setUser(userRes.data);
      setTarjetas(tarjetasRes.data);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response?.status === 401) {
        navigate("/registro");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success("Sesión cerrada");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/tarjetas/${deleteId}`, {
        withCredentials: true,
      });
      setTarjetas(tarjetas.filter((t) => t.id !== deleteId));
      toast.success("Tarjeta eliminada");
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting tarjeta:", error);
      toast.error("Error al eliminar tarjeta");
    }
  };

  const handleCreateNew = () => {
    // For now, just edit the first tarjeta
    if (tarjetas.length > 0) {
      navigate(`/editor/${tarjetas[0].id}`);
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
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TarjetaDigital</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              data-testid="upgrade-premium-btn"
              variant="outline"
              onClick={() => navigate("/premium")}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 hover:from-yellow-500 hover:to-orange-500 hover:scale-105 transition-all"
            >
              {user?.plan === "paid" ? "💳 Renovar Suscripción" : "⭐ Actualizar a Premium"}
            </Button>
            <Button
              data-testid="logout-btn"
              variant="outline"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Admin Messages */}
        {messages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📢 Mensajes del Administrador</h2>
            <div className="space-y-3">
              {messages.map((msg) => (
                <Card
                  key={msg.id}
                  className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
                >
                  <p className="text-gray-800">{msg.text}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(msg.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  ¡Hola, {user?.name}!
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* License Info */}
            {user && (
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.plan === 'trial' ? 'bg-blue-100 text-blue-800' :
                      user.plan === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.plan === 'trial' ? 'Período de Prueba' :
                       user.plan === 'paid' ? 'Suscripción Activa' :
                       'Expirado'}
                    </span>
                  </div>
                  <div className="text-sm">
                    {user.plan === 'trial' && user.trial_ends_at && (
                      <p className="text-gray-600">
                        Vence: <span className="font-semibold">
                          {new Date(user.trial_ends_at).toLocaleDateString('es-MX')}
                        </span>
                      </p>
                    )}
                    {user.plan === 'paid' && user.subscription_ends_at && (
                      <p className="text-gray-600">
                        Vence: <span className="font-semibold">
                          {new Date(user.subscription_ends_at).toLocaleDateString('es-MX')}
                        </span>
                      </p>
                    )}
                    {user.plan === 'expired' && (
                      <p className="text-red-600 font-semibold">
                        Por favor renueva tu suscripción
                      </p>
                    )}
                  </div>
                  {user.role === 'admin' && (
                    <Button
                      data-testid="admin-panel-btn"
                      onClick={() => navigate("/admin")}
                      size="sm"
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
                    >
                      ⚡ Panel Admin
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Tarjetas Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Mis tarjetas</h2>
          </div>

          {tarjetas.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <p className="text-gray-600 mb-4">Aún no tienes tarjetas</p>
              <Button
                data-testid="create-first-card-btn"
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Crear mi primera tarjeta
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tarjetas.map((tarjeta) => (
                <Card
                  key={tarjeta.id}
                  data-testid={`tarjeta-card-${tarjeta.id}`}
                  className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl hover:shadow-xl transition-all"
                  style={{
                    borderTopColor: tarjeta.color_tema,
                    borderTopWidth: "4px",
                  }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {tarjeta.foto_url ? (
                        <img
                          src={tarjeta.foto_url}
                          alt={tarjeta.nombre}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tarjeta.color_tema }}
                        >
                          {tarjeta.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {tarjeta.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">/{tarjeta.slug}</p>
                      </div>
                    </div>

                    {tarjeta.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {tarjeta.descripcion}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        data-testid={`edit-tarjeta-btn-${tarjeta.id}`}
                        onClick={() => navigate(`/editor/${tarjeta.id}`)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Editar
                      </Button>
                      <Button
                        data-testid={`view-tarjeta-btn-${tarjeta.id}`}
                        onClick={() => window.open(`/t/${tarjeta.slug}`, "_blank")}
                        variant="outline"
                        className="flex-1"
                      >
                        Ver
                      </Button>
                      <Button
                        data-testid={`delete-tarjeta-btn-${tarjeta.id}`}
                        onClick={() => setDeleteId(tarjeta.id)}
                        variant="destructive"
                        size="icon"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarjeta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarjeta y todos sus enlaces
              serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-delete-btn"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
