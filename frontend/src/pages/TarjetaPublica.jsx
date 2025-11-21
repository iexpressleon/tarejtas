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
              {/* Botón Guardar Contacto - PRIMERO */}
              <button
                data-testid="save-contact-btn"
                onClick={handleSaveContact}
                className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                style={{ backgroundColor: colorTema }}
              >
                💾 Guardar Contacto
              </button>

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
              
              {/* Email al FINAL */}
              {tarjeta?.email && tarjeta?.email_visible !== false && (
                <button
                  data-testid="email-btn"
                  onClick={handleEmail}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  📧 Enviar email
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

            {/* Social Media Icons */}
            {(tarjeta?.instagram || tarjeta?.facebook || tarjeta?.tiktok || tarjeta?.whatsapp || tarjeta?.google_maps) && (
              <div className="mt-6 pt-6 border-t border-white/30">
                <div className="flex justify-center gap-4 flex-wrap">
                  {tarjeta?.whatsapp && (
                    <button
                      onClick={handleWhatsApp}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#25D366">
                        <path d="M12.031 2C6.505 2 2 6.5 2 12.031c0 1.771.464 3.48 1.344 5.014L2.33 22l5.159-1.344A9.974 9.974 0 0 0 12.031 22C17.556 22 22 17.5 22 11.969 22 6.438 17.556 2 12.031 2zm0 18.086c-1.62 0-3.17-.475-4.548-1.367l-3.283.856.875-3.192a8.035 8.035 0 0 1-1.149-4.318c0-4.422 3.577-8.031 7.994-8.031 4.417 0 8.031 3.609 8.031 8.031 0 4.422-3.614 8.021-8.031 8.021zM16.474 14.4c-.244-.122-1.442-.711-1.665-.792-.223-.082-.386-.122-.548.122-.163.244-.63.792-.772.955-.142.163-.285.183-.528.061-.244-.122-1.03-.38-1.962-1.21-.728-.65-1.262-1.073-1.409-1.212-.146-.081-.244-.142-.366-.325-.224-.548-.224-1.442.122-1.91.366-.467 2.032-3.766 2.275-3.868.244-.101.548-.142.832-.082 1.38.285 2.335 1.544 2.66 2.459.325.915.325 1.686.224 1.869-.102.183-.366.264-.61.386z"/>
                      </svg>
                    </button>
                  )}
                  {tarjeta?.instagram && tarjeta?.instagram_visible !== false && (
                    <button
                      onClick={() => window.open(tarjeta.instagram.startsWith('http') ? tarjeta.instagram : `https://${tarjeta.instagram}`, '_blank')}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Instagram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </button>
                  )}
                  {tarjeta?.facebook && tarjeta?.facebook_visible !== false && (
                    <button
                      onClick={() => window.open(tarjeta.facebook.startsWith('http') ? tarjeta.facebook : `https://${tarjeta.facebook}`, '_blank')}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Facebook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                  )}
                  {tarjeta?.tiktok && tarjeta?.tiktok_visible !== false && (
                    <button
                      onClick={() => window.open(tarjeta.tiktok.startsWith('http') ? tarjeta.tiktok : `https://${tarjeta.tiktok}`, '_blank')}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="TikTok"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#000000">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </button>
                  )}
                  {tarjeta?.google_maps && tarjeta?.google_maps_visible !== false && (
                    <button
                      onClick={() => window.open(tarjeta.google_maps.startsWith('http') ? tarjeta.google_maps : `https://${tarjeta.google_maps}`, '_blank')}
                      className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      title="Google Maps"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#EA4335">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                      </svg>
                    </button>
                  )}
                </div>
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
