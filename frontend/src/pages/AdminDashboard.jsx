import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [resetPasswordDisplay, setResetPasswordDisplay] = useState("");
  
  // Messages state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageTargetUser, setMessageTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, usersRes, statsRes, messagesRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/admin/messages`, { withCredentials: true }).catch(() => ({ data: [] })),
      ]);

      setCurrentUser(userRes.data);
      
      // Check if user is admin
      if (userRes.data.role !== "admin") {
        toast.error("Acceso denegado - Solo administradores");
        navigate("/dashboard");
        return;
      }

      setUsers(usersRes.data);
      setStats(statsRes.data);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate("/registro");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await axios.put(
        `${API}/admin/users/${userId}/toggle-active`,
        {},
        { withCredentials: true }
      );
      toast.success("Estado del usuario actualizado");
      loadData();
    } catch (error) {
      console.error("Error toggling user:", error);
      toast.error("Error al actualizar usuario");
    }
    setSelectedUser(null);
  };

  const handleExtendSubscription = async (userId) => {
    try {
      const response = await axios.put(
        `${API}/admin/users/${userId}/extend-subscription`,
        {},
        { withCredentials: true }
      );
      toast.success("Suscripción extendida por 1 año");
      loadData();
    } catch (error) {
      console.error("Error extending subscription:", error);
      toast.error("Error al extender suscripción");
    }
    setSelectedUser(null);
  };

  const handleRegenerateLicense = async (userId) => {
    try {
      const response = await axios.post(
        `${API}/admin/users/${userId}/regenerate-license`,
        {},
        { withCredentials: true }
      );
      toast.success(`Nueva licencia: ${response.data.license_key}`);
      loadData();
    } catch (error) {
      console.error("Error regenerating license:", error);
      toast.error("Error al generar licencia");
    }
    setSelectedUser(null);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await axios.put(
        `${API}/admin/users/${resetPasswordUser.id}/reset-password`,
        { new_password: newPassword },
        { withCredentials: true }
      );
      toast.success(`Contraseña actualizada para ${resetPasswordUser.name}`);
      setShowPasswordReset(false);
      setResetPasswordUser(null);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.detail || "Error al resetear contraseña");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${userName}? Esta acción no se puede deshacer y eliminará toda su información.`)) {
      return;
    }

    try {
      await axios.delete(
        `${API}/admin/users/${userId}`,
        { withCredentials: true }
      );
      toast.success(`Usuario ${userName} eliminado exitosamente`);
      loadData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.detail || "Error al eliminar usuario");
    }
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (dateString) => {
    if (!dateString) return null;
    const end = new Date(dateString);
    const now = new Date();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Panel de Administrador</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-to-dashboard-btn"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              ← Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl">
              <div className="text-sm text-gray-600">Total Usuarios</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_users}</div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-green-100 rounded-xl">
              <div className="text-sm text-gray-600">Activos</div>
              <div className="text-3xl font-bold text-green-600">{stats.active_users}</div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-blue-100 rounded-xl">
              <div className="text-sm text-gray-600">En Prueba</div>
              <div className="text-3xl font-bold text-blue-600">{stats.trial_users}</div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-purple-100 rounded-xl">
              <div className="text-sm text-gray-600">Pagados</div>
              <div className="text-3xl font-bold text-purple-600">{stats.paid_users}</div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-red-100 rounded-xl">
              <div className="text-sm text-gray-600">Expirados</div>
              <div className="text-3xl font-bold text-red-600">{stats.expired_users}</div>
            </Card>
            <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-yellow-100 rounded-xl">
              <div className="text-sm text-gray-600">Por Vencer</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.expiring_soon}</div>
            </Card>
          </div>
        )}

        {/* Search */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-xl mb-6">
          <Input
            data-testid="search-users-input"
            placeholder="Buscar usuarios por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </Card>

        {/* Users Table */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6">Usuarios Registrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-semibold">Usuario</th>
                  <th className="text-left p-3 font-semibold">Plan</th>
                  <th className="text-left p-3 font-semibold">Vencimiento</th>
                  <th className="text-left p-3 font-semibold">Días Rest.</th>
                  <th className="text-left p-3 font-semibold">Licencia</th>
                  <th className="text-left p-3 font-semibold">Estado</th>
                  <th className="text-center p-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const expirationDate = user.plan === "trial" ? user.trial_ends_at : user.subscription_ends_at;
                  const daysRemaining = getDaysRemaining(expirationDate);
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeColor(user.plan)}`}>
                          {user.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{formatDate(expirationDate)}</td>
                      <td className="p-3">
                        {daysRemaining !== null && (
                          <span className={`font-semibold ${daysRemaining < 7 ? 'text-red-600' : daysRemaining < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} días` : "Expirado"}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.license_key?.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? "Activo" : "Deshabilitado"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <Button
                            data-testid={`toggle-user-btn-${user.id}`}
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("toggle");
                            }}
                            variant={user.is_active ? "destructive" : "default"}
                            size="sm"
                          >
                            {user.is_active ? "Deshabilitar" : "Habilitar"}
                          </Button>
                          <Button
                            data-testid={`extend-sub-btn-${user.id}`}
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType("extend");
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100"
                          >
                            + 1 Año
                          </Button>
                          <Button
                            data-testid={`reset-password-btn-${user.id}`}
                            onClick={() => {
                              setResetPasswordUser(user);
                              setShowPasswordReset(true);
                              setNewPassword("");
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 hover:bg-blue-100"
                          >
                            🔑 Reset
                          </Button>
                          <Button
                            data-testid={`delete-user-btn-${user.id}`}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            🗑️ Borrar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={selectedUser !== null} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "toggle" 
                ? `¿${selectedUser?.is_active ? 'Deshabilitar' : 'Habilitar'} usuario?`
                : "¿Extender suscripción?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "toggle" && (
                <>
                  {selectedUser?.is_active 
                    ? `El usuario ${selectedUser?.name} no podrá acceder a su cuenta.`
                    : `El usuario ${selectedUser?.name} recuperará el acceso a su cuenta.`}
                </>
              )}
              {actionType === "extend" && (
                <>
                  Se extenderá la suscripción de {selectedUser?.name} por 1 año adicional.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-action-btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-action-btn"
              onClick={() => {
                if (actionType === "toggle") {
                  handleToggleActive(selectedUser.id);
                } else if (actionType === "extend") {
                  handleExtendSubscription(selectedUser.id);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <AlertDialog open={showPasswordReset} onOpenChange={() => {
        setShowPasswordReset(false);
        setResetPasswordUser(null);
        setNewPassword("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetear Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa una nueva contraseña para <strong>{resetPasswordUser?.name}</strong>. El usuario deberá usar esta contraseña para iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              data-testid="new-password-input"
              type="password"
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleResetPassword();
                }
              }}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-password-reset-btn">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              data-testid="confirm-password-reset-btn"
              onClick={handleResetPassword}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Resetear Contraseña
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
