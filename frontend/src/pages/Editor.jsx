import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tarjeta, setTarjeta] = useState(null);
  const [enlaces, setEnlaces] = useState([]);

  // Form states
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [colorTema, setColorTema] = useState("#6366f1");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [archivoNegocio, setArchivoNegocio] = useState("");
  const [archivoNegocioTipo, setArchivoNegocioTipo] = useState("");
  const [archivoNegocioNombre, setArchivoNegocioNombre] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [tarjetaRes, enlacesRes] = await Promise.all([
        axios.get(`${API}/tarjetas/${id}`, { withCredentials: true }),
        axios.get(`${API}/enlaces/${id}`, { withCredentials: true }),
      ]);

      const t = tarjetaRes.data;
      setTarjeta(t);
      setNombre(t.nombre);
      setDescripcion(t.descripcion || "");
      setColorTema(t.color_tema || "#6366f1");
      setTelefono(t.telefono || "");
      setWhatsapp(t.whatsapp || "");
      setEmail(t.email || "");
      setFotoUrl(t.foto_url || "");
      setFotoPreview(t.foto_url || "");
      setArchivoNegocio(t.archivo_negocio || "");
      setArchivoNegocioTipo(t.archivo_negocio_tipo || "");
      setArchivoNegocioNombre(t.archivo_negocio_nombre || "");
      setEnlaces(enlacesRes.data);
    } catch (error) {
      console.error("Error loading data:", error);
      if (error.response?.status === 401) {
        navigate("/registro");
      } else if (error.response?.status === 404) {
        toast.error("Tarjeta no encontrada");
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFotoUrl(base64String);
        setFotoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleArchivoNegocioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Solo se permiten archivos JPG o PDF");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo no debe superar 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setArchivoNegocio(base64String);
        setArchivoNegocioTipo(file.type.includes('pdf') ? 'pdf' : 'jpg');
        setArchivoNegocioNombre(file.name);
        toast.success(`Archivo ${file.name} cargado`);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeArchivoNegocio = () => {
    setArchivoNegocio("");
    setArchivoNegocioTipo("");
    setArchivoNegocioNombre("");
    toast.success("Archivo eliminado");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update tarjeta
      await axios.put(
        `${API}/tarjetas/${id}`,
        {
          nombre,
          descripcion,
          color_tema: colorTema,
          telefono,
          whatsapp,
          email,
          foto_url: fotoUrl,
          archivo_negocio: archivoNegocio,
          archivo_negocio_tipo: archivoNegocioTipo,
          archivo_negocio_nombre: archivoNegocioNombre,
        },
        { withCredentials: true }
      );

      // Update enlaces
      for (const enlace of enlaces) {
        if (enlace.id) {
          await axios.put(
            `${API}/enlaces/${enlace.id}`,
            {
              titulo: enlace.titulo,
              url: enlace.url,
              orden: enlace.orden,
            },
            { withCredentials: true }
          );
        } else {
          await axios.post(
            `${API}/enlaces/${id}`,
            {
              titulo: enlace.titulo,
              url: enlace.url,
              orden: enlace.orden,
            },
            { withCredentials: true }
          );
        }
      }

      // Generate QR
      await axios.post(
        `${API}/tarjetas/${id}/generate-qr`,
        {},
        { withCredentials: true }
      );

      toast.success("✅ Cambios guardados");
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const addEnlace = () => {
    setEnlaces([
      ...enlaces,
      { titulo: "", url: "", orden: enlaces.length, temp_id: Date.now() },
    ]);
  };

  const removeEnlace = async (index, enlaceId) => {
    if (enlaceId) {
      try {
        await axios.delete(`${API}/enlaces/${enlaceId}`, {
          withCredentials: true,
        });
        toast.success("Enlace eliminado");
      } catch (error) {
        console.error("Error deleting enlace:", error);
        toast.error("Error al eliminar enlace");
      }
    }
    setEnlaces(enlaces.filter((_, i) => i !== index));
  };

  const updateEnlace = (index, field, value) => {
    const updated = [...enlaces];
    updated[index][field] = value;
    setEnlaces(updated);
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
          <Button
            data-testid="back-to-dashboard-btn"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            ← Volver
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="view-tarjeta-btn"
              variant="outline"
              onClick={() => window.open(`/t/${tarjeta?.slug}`, "_blank")}
            >
              Ver tarjeta
            </Button>
            <Button
              data-testid="save-changes-btn"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Form */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Datos básicos</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="foto">Foto de perfil</Label>
                  <Input
                    id="foto"
                    data-testid="foto-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                  {fotoPreview && (
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="mt-4 w-24 h-24 rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    data-testid="nombre-input"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    data-testid="descripcion-input"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Desarrollador Full Stack | Amante del café ☕"
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color del tema</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="color"
                      data-testid="color-input"
                      type="color"
                      value={colorTema}
                      onChange={(e) => setColorTema(e.target.value)}
                      className="w-20 h-12"
                    />
                    <Input
                      value={colorTema}
                      onChange={(e) => setColorTema(e.target.value)}
                      placeholder="#6366f1"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Contacto</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    data-testid="telefono-input"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+52 1234567890"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios podrán llamarte directamente desde su móvil
                  </p>
                </div>
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
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    data-testid="whatsapp-input"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+52 1234567890"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Información adicional</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="archivo">Documento de negocio (JPG o PDF)</Label>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Sube un catálogo, menú, brochure u otro documento (máx. 5MB)
                  </p>
                  <Input
                    id="archivo"
                    data-testid="archivo-input"
                    type="file"
                    accept=".jpg,.jpeg,.pdf"
                    onChange={handleArchivoNegocioUpload}
                    className="mt-2"
                  />
                  {archivoNegocioNombre && (
                    <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {archivoNegocioTipo === 'pdf' ? '📄' : '🖼️'}
                        </span>
                        <span className="text-sm font-medium">{archivoNegocioNombre}</span>
                      </div>
                      <Button
                        data-testid="remove-archivo-btn"
                        onClick={removeArchivoNegocio}
                        variant="destructive"
                        size="sm"
                      >
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">Código QR</h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Descarga el código QR de tu tarjeta para compartirlo en redes sociales,
                  imprimirlo o agregarlo a materiales de marketing.
                </p>
                {tarjeta?.qr_url ? (
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={tarjeta.qr_url}
                      alt="QR Code"
                      className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                    />
                    <Button
                      data-testid="download-qr-btn"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = tarjeta.qr_url;
                        link.download = `qr-${tarjeta.slug}.png`;
                        link.click();
                        toast.success("QR descargado");
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      📥 Descargar QR
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Guarda los cambios para generar el código QR
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Enlaces</h2>
                <Button
                  data-testid="add-enlace-btn"
                  onClick={addEnlace}
                  variant="outline"
                  size="sm"
                >
                  ➕ Agregar
                </Button>
              </div>
              <div className="space-y-4">
                {enlaces.map((enlace, index) => (
                  <div
                    key={enlace.id || enlace.temp_id}
                    data-testid={`enlace-item-${index}`}
                    className="flex gap-2"
                  >
                    <div className="flex-1 space-y-2">
                      <Input
                        data-testid={`enlace-titulo-${index}`}
                        value={enlace.titulo}
                        onChange={(e) =>
                          updateEnlace(index, "titulo", e.target.value)
                        }
                        placeholder="Título (ej: LinkedIn)"
                      />
                      <Input
                        data-testid={`enlace-url-${index}`}
                        value={enlace.url}
                        onChange={(e) =>
                          updateEnlace(index, "url", e.target.value)
                        }
                        placeholder="URL (ej: https://linkedin.com/in/...)"
                      />
                    </div>
                    <Button
                      data-testid={`remove-enlace-btn-${index}`}
                      onClick={() => removeEnlace(index, enlace.id)}
                      variant="destructive"
                      size="icon"
                    >
                      🗑️
                    </Button>
                  </div>
                ))}
                {enlaces.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Aún no hay enlaces. ¡Agrega el primero!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl">
              <h2 className="text-xl font-bold mb-6 text-center">Vista previa</h2>
              <div
                className="rounded-2xl p-8 space-y-6"
                style={{ backgroundColor: colorTema + "15" }}
              >
                {/* Profile */}
                <div className="text-center space-y-4">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt={nombre}
                      className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg"
                      style={{ backgroundColor: colorTema }}
                    >
                      {nombre.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold">
                      {nombre || "Tu nombre"}
                    </h3>
                    {descripcion && (
                      <p className="text-gray-600 mt-2">{descripcion}</p>
                    )}
                  </div>
                </div>

                {/* Contact Buttons */}
                <div className="space-y-3">
                  {telefono && (
                    <div
                      className="p-4 rounded-xl text-center font-semibold"
                      style={{ backgroundColor: colorTema, color: "white" }}
                    >
                      📞 Llamar
                    </div>
                  )}
                  {email && (
                    <div
                      className="p-4 rounded-xl text-center font-semibold"
                      style={{ backgroundColor: colorTema, color: "white" }}
                    >
                      📧 Email
                    </div>
                  )}
                  {whatsapp && (
                    <div
                      className="p-4 rounded-xl text-center font-semibold"
                      style={{ backgroundColor: colorTema, color: "white" }}
                    >
                      📱 WhatsApp
                    </div>
                  )}
                </div>

                {/* Enlaces */}
                {enlaces.length > 0 && (
                  <div className="space-y-3">
                    {enlaces.map((enlace, index) => (
                      <div
                        key={enlace.id || enlace.temp_id}
                        className="p-4 bg-white rounded-xl text-center font-semibold shadow-sm"
                        style={{ borderLeft: `4px solid ${colorTema}` }}
                      >
                        {enlace.titulo || "Enlace sin título"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
