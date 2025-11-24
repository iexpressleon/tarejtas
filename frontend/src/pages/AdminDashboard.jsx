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
  
  // Expiration date state
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [expirationUser, setExpirationUser] = useState(null);
  const [newExpirationDate, setNewExpirationDate] = useState("");
  
  // Messages state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageTargetUser, setMessageTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // App Settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, usersRes, statsRes, messagesRes, settingsRes] = await Promise.all([
        axios.get(`${API}/auth/me`, { withCredentials: true }),
        axios.get(`${API}/admin/users`, { withCredentials: true }),
        axios.get(`${API}/admin/stats`, { withCredentials: true }),
        axios.get(`${API}/admin/messages`, { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get(`${API}/settings`, { withCredentials: true }).catch(() => ({ 
          data: { payment_message: "💳 Por favor envía tu comprobante de pago", whatsapp_number: "4774776685727" } 
        })),
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
      setPaymentMessage(settingsRes.data.payment_message);
      setWhatsappNumber(settingsRes.data.whatsapp_number);
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
      
      // Store password to display it
      setResetPasswordDisplay(newPassword);
      setShowPasswordSuccess(true);
      setShowPasswordReset(false);
      
      toast.success(`Contraseña actualizada para ${resetPasswordUser.name}`);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(error.response?.data?.detail || "Error al resetear contraseña");
    }
  };

  const handleCreateMessage = async () => {
    if (!messageText.trim()) {
      toast.error("El mensaje no puede estar vacío");
      return;
    }

    try {
      await axios.post(
        `${API}/admin/messages`,
        {
          text: messageText,
          target_user_id: messageTargetUser?.id || null, // null = mensaje global
        },
        { withCredentials: true }
      );
      
      toast.success(messageTargetUser ? `Mensaje enviado a ${messageTargetUser.name}` : "Mensaje global creado");
      setShowMessageModal(false);
      setMessageText("");
      setMessageTargetUser(null);
      loadData();
    } catch (error) {
      console.error("Error creating message:", error);
      toast.error(error.response?.data?.detail || "Error al crear mensaje");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("¿Eliminar este mensaje?")) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/messages/${messageId}`, { withCredentials: true });
      toast.success("Mensaje eliminado");
      loadData();
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Error al eliminar mensaje");
    }
  };

  const handleUpdateExpiration = async () => {
    if (!newExpirationDate) {
      toast.error("Por favor selecciona una fecha");
      return;
    }

    try {
      await axios.put(
        `${API}/admin/users/${expirationUser.id}/update-expiration`,
        { expiration_date: newExpirationDate },
        { withCredentials: true }
      );
      toast.success(`Fecha de vencimiento actualizada para ${expirationUser.name}`);
      setShowExpirationModal(false);
      setExpirationUser(null);
      setNewExpirationDate("");
      loadData();
    } catch (error) {
      console.error("Error updating expiration:", error);
      toast.error(error.response?.data?.detail || "Error al actualizar fecha");
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

  const handleUpdateSettings = async () => {
    if (!paymentMessage.trim() || !whatsappNumber.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      await axios.put(
        `${API}/admin/settings`,
        { 
          payment_message: paymentMessage,
          whatsapp_number: whatsappNumber 
        },
        { withCredentials: true }
      );
      toast.success("Configuración actualizada exitosamente");
      setShowSettingsModal(false);
      loadData();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(error.response?.data?.detail || "Error al actualizar configuración");
    }
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
              data-testid="settings-btn"
              variant="outline"
              onClick={() => setShowSettingsModal(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 hover:from-purple-600 hover:to-indigo-700"
            >
              ⚙️ Configuración
            </Button>
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

        {/* Messages Section */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-blue-100 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Mensajes a Usuarios</h2>
            <Button
              onClick={() => {
                setMessageTargetUser(null);
                setMessageText("");
                setShowMessageModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              ✉️ Crear Mensaje Global
            </Button>
          </div>
          
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex justify-between items-start p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex-1">
                    <p className="text-gray-800">{msg.text}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {msg.target_user_name ? `Para: ${msg.target_user_name}` : "📢 Global (todos los usuarios)"}
                      {" • "}
                      {formatDate(msg.created_at)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteMessage(msg.id)}
                    variant="destructive"
                    size="sm"
                    className="ml-4"
                  >
                    🗑️
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay mensajes activos</p>
          )}
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
                            onClick={() => {
                              setExpirationUser(user);
                              // Set current expiration or default to 1 year from now
                              const currentExp = user.plan === "trial" 
                                ? user.trial_ends_at 
                                : user.subscription_ends_at;
                              const date = currentExp 
                                ? new Date(currentExp).toISOString().slice(0, 16)
                                : new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 16);
                              setNewExpirationDate(date);
                              setShowExpirationModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-amber-50 hover:bg-amber-100"
                          >
                            📅 Fecha
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
                          <Button
                            onClick={() => {
                              setMessageTargetUser(user);
                              setMessageText("");
                              setShowMessageModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-purple-50 hover:bg-purple-100"
                          >
                            💬 Mensaje
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
              type="text"
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

      {/* Password Success Dialog */}
      <AlertDialog open={showPasswordSuccess} onOpenChange={() => {
        setShowPasswordSuccess(false);
        setResetPasswordDisplay("");
        setResetPasswordUser(null);
        setNewPassword("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>✅ Contraseña Actualizada</AlertDialogTitle>
            <AlertDialogDescription>
              La contraseña de <strong>{resetPasswordUser?.name}</strong> ha sido reseteada exitosamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-3">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Nueva contraseña temporal:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white px-4 py-3 rounded text-lg font-bold text-green-700 border border-green-300">
                  {resetPasswordDisplay}
                </code>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(resetPasswordDisplay);
                    toast.success("Contraseña copiada al portapapeles");
                  }}
                  variant="outline"
                  size="sm"
                >
                  📋 Copiar
                </Button>
              </div>
            </div>
            <p className="text-sm text-amber-600">
              ⚠️ Guarda esta contraseña ahora y compártela con el usuario de forma segura. No podrás verla después.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowPasswordSuccess(false);
                setResetPasswordDisplay("");
                setResetPasswordUser(null);
                setNewPassword("");
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expiration Date Update Dialog */}
      <AlertDialog open={showExpirationModal} onOpenChange={() => {
        setShowExpirationModal(false);
        setExpirationUser(null);
        setNewExpirationDate("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modificar Fecha de Vencimiento</AlertDialogTitle>
            <AlertDialogDescription>
              Actualiza la fecha de vencimiento de la suscripción de <strong>{expirationUser?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">Nueva Fecha de Vencimiento:</label>
            <input
              type="datetime-local"
              value={newExpirationDate}
              onChange={(e) => setNewExpirationDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Actual: {expirationUser?.plan === "trial" 
                ? new Date(expirationUser?.trial_ends_at).toLocaleString("es-MX")
                : new Date(expirationUser?.subscription_ends_at).toLocaleString("es-MX")
              }
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateExpiration}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Actualizar Fecha
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Message Creation Dialog */}
      <AlertDialog open={showMessageModal} onOpenChange={() => {
        setShowMessageModal(false);
        setMessageText("");
        setMessageTargetUser(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {messageTargetUser ? `Mensaje para ${messageTargetUser.name}` : "Crear Mensaje Global"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {messageTargetUser 
                ? `Este mensaje solo será visible para ${messageTargetUser.name} en su dashboard`
                : "Este mensaje será visible para todos los usuarios en su dashboard"
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              placeholder="Escribe tu mensaje aquí..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateMessage}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Enviar Mensaje
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
