// Template 2: Profesional - Layout corporativo con foto lateral
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template2({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden bg-white shadow-2xl rounded-2xl">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar izquierdo con foto */}
            <div 
              className="md:w-1/3 p-8 text-white"
              style={{ backgroundColor: tarjeta.color_tema }}
            >
              {/* Foto */}
              {tarjeta.foto_url && (
                <div className="flex justify-center mb-6">
                  <img
                    src={tarjeta.foto_url}
                    alt={tarjeta.nombre}
                    className={`w-40 h-40 object-cover border-4 border-white shadow-xl ${
                      tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  />
                </div>
              )}
              
              {/* Nombre */}
              <h1 className="text-2xl font-bold text-center mb-4">
                {tarjeta.nombre}
              </h1>
              
              {tarjeta.descripcion && (
                <p className="text-sm text-center opacity-90 mb-6">
                  {tarjeta.descripcion}
                </p>
              )}

              {/* Redes sociales verticales */}
              <div className="space-y-3">
                {tarjeta.instagram_url && tarjeta.instagram_visible && (
                  <button
                    onClick={() => window.open(tarjeta.instagram_url, '_blank')}
                    className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <span>📷</span> Instagram
                  </button>
                )}
                
                {tarjeta.facebook_url && tarjeta.facebook_visible && (
                  <button
                    onClick={() => window.open(tarjeta.facebook_url, '_blank')}
                    className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <span>👥</span> Facebook
                  </button>
                )}
                
                {tarjeta.tiktok_url && tarjeta.tiktok_visible && (
                  <button
                    onClick={() => window.open(tarjeta.tiktok_url, '_blank')}
                    className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <span>🎵</span> TikTok
                  </button>
                )}
                
                {tarjeta.google_maps && tarjeta.google_maps_visible && (
                  <button
                    onClick={() => window.open(tarjeta.google_maps, '_blank')}
                    className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <span>📍</span> Ubicación
                  </button>
                )}
              </div>
            </div>

            {/* Contenido principal derecho */}
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Información de Contacto
              </h2>

              {/* Botones de contacto */}
              <div className="space-y-3 mb-8">
                {tarjeta.whatsapp && (
                  <Button
                    onClick={() => handleWhatsAppClick(tarjeta.whatsapp)}
                    className="w-full py-5 text-base rounded-lg justify-start"
                    style={{ backgroundColor: tarjeta.color_tema }}
                  >
                    <span className="mr-3">💬</span>
                    <div className="text-left">
                      <div className="font-semibold">WhatsApp</div>
                      <div className="text-sm opacity-90">{tarjeta.whatsapp}</div>
                    </div>
                  </Button>
                )}
                
                {tarjeta.telefono && (
                  <Button
                    onClick={() => handlePhoneClick(tarjeta.telefono)}
                    variant="outline"
                    className="w-full py-5 text-base rounded-lg justify-start"
                  >
                    <span className="mr-3">📞</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Teléfono</div>
                      <div className="text-sm text-gray-600">{tarjeta.telefono}</div>
                    </div>
                  </Button>
                )}
                
                {tarjeta.email && (
                  <Button
                    onClick={() => handleEmailClick(tarjeta.email)}
                    variant="outline"
                    className="w-full py-5 text-base rounded-lg justify-start"
                  >
                    <span className="mr-3">📧</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">{tarjeta.email}</div>
                    </div>
                  </Button>
                )}
              </div>

              {/* Enlaces personalizados */}
              {enlaces && enlaces.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Enlaces</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {enlaces.map((enlace) => (
                      <Button
                        key={enlace.id}
                        onClick={() => handleEnlaceClick(enlace.url)}
                        variant="outline"
                        className="py-4 text-base rounded-lg"
                      >
                        🔗 {enlace.titulo}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón guardar contacto */}
              <Button
                onClick={handleSaveContact}
                variant="outline"
                className="w-full py-5 text-base rounded-lg border-2"
                style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}
              >
                💾 Guardar Contacto
              </Button>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 mt-8 pt-6 border-t">
                Creada con <span className="font-semibold">TarjetaQR.app</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
