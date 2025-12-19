// Template 1: Clásica - Diseño centrado y minimalista (actual)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template1({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card 
          className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border-4"
          style={{ borderTopColor: tarjeta.color_tema }}
        >
          {/* Header con foto */}
          <div 
            className="h-32 bg-gradient-to-r"
            style={{ 
              backgroundImage: `linear-gradient(to right, ${tarjeta.color_tema}, ${tarjeta.color_tema}dd)`
            }}
          />
          
          <div className="relative px-8 pb-8">
            {/* Foto de perfil */}
            {tarjeta.foto_url && (
              <div className="flex justify-center -mt-16 mb-6">
                <img
                  src={tarjeta.foto_url}
                  alt={tarjeta.nombre}
                  className={`w-32 h-32 object-cover border-4 border-white shadow-xl ${
                    tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'
                  }`}
                />
              </div>
            )}
            
            {/* Información principal */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {tarjeta.nombre}
              </h1>
              {tarjeta.descripcion && (
                <p className="text-lg text-gray-600 mb-6">
                  {tarjeta.descripcion}
                </p>
              )}
            </div>

            {/* Botones de contacto principales */}
            <div className="space-y-3 mb-8">
              {tarjeta.whatsapp && (
                <Button
                  onClick={() => handleWhatsAppClick(tarjeta.whatsapp)}
                  className="w-full py-6 text-lg rounded-xl"
                  style={{ backgroundColor: tarjeta.color_tema }}
                >
                  💬 WhatsApp
                </Button>
              )}
              
              {tarjeta.telefono && (
                <Button
                  onClick={() => handlePhoneClick(tarjeta.telefono)}
                  variant="outline"
                  className="w-full py-6 text-lg rounded-xl"
                >
                  📞 Llamar
                </Button>
              )}
              
              {tarjeta.email && (
                <Button
                  onClick={() => handleEmailClick(tarjeta.email)}
                  variant="outline"
                  className="w-full py-6 text-lg rounded-xl"
                >
                  📧 Email
                </Button>
              )}
              
              <Button
                onClick={handleSaveContact}
                variant="outline"
                className="w-full py-6 text-lg rounded-xl border-2"
                style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}
              >
                💾 Guardar Contacto
              </Button>
            </div>

            {/* Enlaces personalizados */}
            {enlaces && enlaces.length > 0 && (
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Enlaces</h3>
                {enlaces.map((enlace) => (
                  <Button
                    key={enlace.id}
                    onClick={() => handleEnlaceClick(enlace.url)}
                    variant="outline"
                    className="w-full py-5 text-base rounded-xl"
                  >
                    {enlace.titulo}
                  </Button>
                ))}
              </div>
            )}

            {/* Redes sociales (iconos al final) */}
            <div className="flex justify-center gap-4 flex-wrap mb-6">
              {tarjeta.instagram_url && tarjeta.instagram_visible && (
                <button
                  onClick={() => window.open(tarjeta.instagram_url, '_blank')}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="url(#instagram-gradient)"/>
                    <defs>
                      <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f09433"/>
                        <stop offset="25%" stopColor="#e6683c"/>
                        <stop offset="50%" stopColor="#dc2743"/>
                        <stop offset="75%" stopColor="#cc2366"/>
                        <stop offset="100%" stopColor="#bc1888"/>
                      </linearGradient>
                    </defs>
                    <path d="M16 8.5a1 1 0 11-2 0 1 1 0 012 0z" fill="white"/>
                    <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="white"/>
                    <path d="M16 6H8a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V8a2 2 0 00-2-2zm-4 10a4 4 0 110-8 4 4 0 010 8z" fill="white" opacity="0.9"/>
                  </svg>
                </button>
              )}
              
              {tarjeta.facebook_url && tarjeta.facebook_visible && (
                <button
                  onClick={() => window.open(tarjeta.facebook_url, '_blank')}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
              )}
              
              {tarjeta.tiktok_url && tarjeta.tiktok_visible && (
                <button
                  onClick={() => window.open(tarjeta.tiktok_url, '_blank')}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#000000"/>
                  </svg>
                </button>
              )}
              
              {tarjeta.google_maps && tarjeta.google_maps_visible && (
                <button
                  onClick={() => window.open(tarjeta.google_maps, '_blank')}
                  className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pt-6 border-t">
              Creada con <span className="font-semibold">TarjetaQR.app</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
