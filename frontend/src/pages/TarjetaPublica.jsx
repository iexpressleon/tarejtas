import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";
import ContentModal from "@/components/ContentModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TarjetaPublica() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tarjeta, setTarjeta] = useState(null);
  const [enlaces, setEnlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    loadTarjeta();
  }, [slug]);

  const loadTarjeta = async () => {
    try {
      const [tarjetaRes, enlacesRes] = await Promise.all([
        axios.get(`${API}/tarjetas/slug/${slug}`),
        axios.get(`${API}/enlaces/${slug}`).catch(() => ({ data: [] })),
      ]);

      // If slug doesn't exist in tarjetas, try to find by tarjeta_id
      if (tarjetaRes.data) {
        setTarjeta(tarjetaRes.data);
        
        // Get enlaces by tarjeta_id
        const enlacesById = await axios.get(`${API}/enlaces/${tarjetaRes.data.id}`);
        setEnlaces(enlacesById.data);
      }
    } catch (error) {
      console.error("Error loading tarjeta:", error);
      if (error.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhone = () => {
    if (tarjeta?.telefono) {
      const cleanNumber = tarjeta.telefono.replace(/[^0-9+]/g, "");
      const telUrl = `tel:${cleanNumber}`;
      window.location.href = telUrl;
    }
  };

  const handleWhatsApp = () => {
    if (tarjeta?.whatsapp) {
      const cleanNumber = tarjeta.whatsapp.replace(/[^0-9]/g, "");
      if (cleanNumber.length < 10) {
        return;
      }
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmail = () => {
    if (tarjeta?.email) {
      const mailtoUrl = `mailto:${tarjeta.email}`;
      window.location.href = mailtoUrl;
    }
  };

  const handleEnlaceClick = (url) => {
    if (url) {
      let finalUrl = url.trim();
      
      // Add protocol if missing
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
      
      // Open directly in new tab (no modal to avoid iframe blocking)
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSaveContact = () => {
    if (!tarjeta) return;

    // Create vCard format
    const cardUrl = `${window.location.origin}/t/${slug}`;
    
    let vcard = "BEGIN:VCARD\n";
    vcard += "VERSION:3.0\n";
    vcard += `FN:${tarjeta.nombre}\n`;
    vcard += `N:${tarjeta.nombre};;;;\n`;
    
    if (tarjeta.descripcion) {
      vcard += `NOTE:${tarjeta.descripcion}\n`;
    }
    
    if (tarjeta.telefono) {
      vcard += `TEL;TYPE=CELL:${tarjeta.telefono}\n`;
    }
    
    if (tarjeta.email) {
      vcard += `EMAIL:${tarjeta.email}\n`;
    }
    
    if (tarjeta.whatsapp) {
      vcard += `TEL;TYPE=WORK:${tarjeta.whatsapp}\n`;
    }
    
    // Add tarjeta QR URL
    vcard += `URL;TYPE=TarjetaQR:${cardUrl}\n`;
    vcard += `URL:${cardUrl}\n`;
    
    vcard += "END:VCARD";

    // Create blob and download
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tarjeta.nombre.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  const handleArchivoClick = () => {
    if (tarjeta?.archivo_negocio) {
      const tipo = tarjeta.archivo_negocio_tipo === "pdf" ? "pdf" : "image";
      const titulo = tarjeta.archivo_negocio_titulo || 
                     (tipo === "pdf" ? "Documento PDF" : "Imagen");
      
      setModalType(tipo);
      setModalContent(tarjeta.archivo_negocio);
      setModalTitle(titulo);
      setModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold mb-4">Tarjeta no encontrada</h1>
          <p className="text-gray-600 mb-6">
            Esta tarjeta no existe o ha sido eliminada.
          </p>
          <Button
            data-testid="go-home-btn"
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Ir al inicio
          </Button>
        </Card>
      </div>
    );
  }

  const colorTema = tarjeta?.color_tema || "#6366f1";
  const isFree = true; // Assuming all are free for now

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${colorTema}15 0%, ${colorTema}05 50%, ${colorTema}15 100%)`,
      }}
    >
      <div className="w-full max-w-md">
        <Card
          data-testid="tarjeta-publica"
          className="p-8 bg-white/90 backdrop-blur-md border-2 border-gray-100 rounded-3xl shadow-2xl"
        >
          <div className="space-y-6">
            {/* Profile */}
            <div className="text-center space-y-4">
              {tarjeta?.foto_url ? (
                <img
                  src={tarjeta.foto_url}
                  alt={tarjeta.nombre}
                  data-testid="profile-image"
                  className={`w-28 h-28 mx-auto object-cover border-4 border-white shadow-xl ${
                    tarjeta?.foto_forma === "rectangular" ? "rounded-lg" : "rounded-full"
                  }`}
                  style={{ borderColor: colorTema }}
                />
              ) : (
                <div
                  data-testid="profile-avatar"
                  className={`w-28 h-28 mx-auto flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl ${
                    tarjeta?.foto_forma === "rectangular" ? "rounded-lg" : "rounded-full"
                  }`}
                  style={{ backgroundColor: colorTema }}
                >
                  {tarjeta?.nombre?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <h1
                  data-testid="tarjeta-nombre"
                  className="text-3xl font-bold text-gray-900"
                >
                  {tarjeta?.nombre}
                </h1>
                {tarjeta?.descripcion && (
                  <p
                    data-testid="tarjeta-descripcion"
                    className="text-gray-600 mt-2"
                  >
                    {tarjeta.descripcion}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              {tarjeta?.telefono && (
                <button
                  data-testid="phone-btn"
                  onClick={handlePhone}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  📞 Llamar
                </button>
              )}
              {tarjeta?.email && (
                <button
                  data-testid="email-btn"
                  onClick={handleEmail}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  📧 Enviar email
                </button>
              )}
              {tarjeta?.whatsapp && (
                <button
                  data-testid="whatsapp-btn"
                  onClick={handleWhatsApp}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  📱 WhatsApp
                </button>
              )}
              {tarjeta?.archivo_negocio && (
                <button
                  data-testid="archivo-negocio-btn"
                  onClick={handleArchivoClick}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  {tarjeta.archivo_negocio_tipo === 'pdf' ? '📄' : '🖼️'} {tarjeta.archivo_negocio_titulo || (tarjeta.archivo_negocio_tipo === 'pdf' ? 'Ver Catálogo' : 'Ver Imagen')}
                </button>
              )}
            </div>

            {/* Enlaces */}
            {enlaces.length > 0 && (
              <div className="space-y-3 pt-2">
                {enlaces.map((enlace) => (
                  <button
                    key={enlace.id}
                    data-testid={`enlace-btn-${enlace.id}`}
                    onClick={() => handleEnlaceClick(enlace.url)}
                    className="w-full p-4 bg-white rounded-xl text-center font-semibold text-gray-900 hover:scale-105 transition-transform shadow-sm border-2 border-gray-100 hover:shadow-md"
                    style={{ borderLeftColor: colorTema, borderLeftWidth: "4px" }}
                  >
                    {enlace.titulo}
                  </button>
                ))}
              </div>
            )}

            {/* QR Code */}
            {tarjeta?.qr_url && (
              <div className="pt-4 text-center">
                <img
                  src={tarjeta.qr_url}
                  alt="QR Code"
                  data-testid="qr-code"
                  className="mx-auto w-32 h-32 rounded-xl shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Escanea para compartir
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        {isFree && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Hecho con ❤️ por{" "}
              <button
                onClick={() => navigate("/")}
                className="font-semibold hover:underline"
                style={{ color: colorTema }}
              >
                TarjetaQR.app
              </button>
            </p>
          </div>
        )}
        
        {/* Footer with branding */}
        <div className="mt-8 pt-6 border-t border-white/30 text-center">
          <p className="text-white/70 text-sm">
            creada con{" "}
            <a 
              href="https://tarjetaqr.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-white hover:underline"
            >
              TarjetaQR.app
            </a>
          </p>
        </div>
      </div>

      {/* Content Modal */}
      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        content={modalContent}
        title={modalTitle}
      />
    </div>
  );
}
