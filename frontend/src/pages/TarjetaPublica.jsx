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
      try {
        const cleanNumber = tarjeta.telefono.replace(/[^0-9+]/g, "");
        const telUrl = `tel:${cleanNumber}`;
        console.log("Opening phone:", telUrl);
        
        // Try to open in new window, fallback to location.href
        const newWindow = window.open(telUrl, "_blank", "width=400,height=300");
        if (!newWindow) {
          window.location.href = telUrl;
        }
      } catch (error) {
        console.error("Error al abrir teléfono:", error);
        window.location.href = `tel:${tarjeta.telefono}`;
      }
    }
  };

  const handleWhatsApp = () => {
    if (tarjeta?.whatsapp) {
      try {
        const cleanNumber = tarjeta.whatsapp.replace(/[^0-9]/g, "");
        if (cleanNumber.length < 10) {
          console.error("Número de WhatsApp inválido");
          return;
        }
        const whatsappUrl = `https://wa.me/${cleanNumber}`;
        console.log("Opening WhatsApp:", whatsappUrl);
        window.open(whatsappUrl, "_blank", "noopener,noreferrer,width=800,height=600");
      } catch (error) {
        console.error("Error al abrir WhatsApp:", error);
      }
    }
  };

  const handleEmail = () => {
    if (tarjeta?.email) {
      try {
        const mailtoUrl = `mailto:${tarjeta.email}`;
        console.log("Opening email:", mailtoUrl);
        
        // Try to open in new window, fallback to location.href
        const newWindow = window.open(mailtoUrl, "_blank", "width=600,height=400");
        if (!newWindow) {
          window.location.href = mailtoUrl;
        }
      } catch (error) {
        console.error("Error al abrir email:", error);
        window.location.href = `mailto:${tarjeta.email}`;
      }
    }
  };

  const handleEnlaceClick = (url) => {
    if (url) {
      try {
        let finalUrl = url.trim();
        
        // Check if it's already a complete URL
        if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
          // Add https:// prefix
          finalUrl = "https://" + finalUrl;
        }
        
        console.log("Opening link:", finalUrl);
        window.open(finalUrl, "_blank", "noopener,noreferrer");
      } catch (error) {
        console.error("Error al abrir enlace:", error);
      }
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
                  className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white shadow-xl"
                  style={{ borderColor: colorTema }}
                />
              ) : (
                <div
                  data-testid="profile-avatar"
                  className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl"
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
                  onClick={() => {
                    // Open in new window instead of downloading
                    const newWindow = window.open();
                    if (newWindow) {
                      if (tarjeta.archivo_negocio_tipo === 'pdf') {
                        // For PDF, create an iframe viewer
                        newWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>${tarjeta.archivo_negocio_nombre || 'Documento'}</title>
                              <style>
                                body { margin: 0; padding: 0; overflow: hidden; }
                                iframe { border: none; width: 100vw; height: 100vh; }
                              </style>
                            </head>
                            <body>
                              <iframe src="${tarjeta.archivo_negocio}"></iframe>
                            </body>
                          </html>
                        `);
                      } else {
                        // For images, display centered
                        newWindow.document.write(`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>${tarjeta.archivo_negocio_nombre || 'Imagen'}</title>
                              <style>
                                body { 
                                  margin: 0; 
                                  padding: 20px;
                                  background: #000;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  min-height: 100vh;
                                }
                                img { 
                                  max-width: 100%;
                                  max-height: 100vh;
                                  object-fit: contain;
                                  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                                }
                              </style>
                            </head>
                            <body>
                              <img src="${tarjeta.archivo_negocio}" alt="${tarjeta.archivo_negocio_nombre || 'Imagen'}" />
                            </body>
                          </html>
                        `);
                      }
                      newWindow.document.close();
                    }
                  }}
                  className="w-full p-4 rounded-xl text-center font-semibold text-white hover:scale-105 transition-transform shadow-md"
                  style={{ backgroundColor: colorTema }}
                >
                  {tarjeta.archivo_negocio_tipo === 'pdf' ? '📄' : '🖼️'} Ver {tarjeta.archivo_negocio_tipo === 'pdf' ? 'Catálogo' : 'Imagen'}
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
                TarjetaDigital
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
