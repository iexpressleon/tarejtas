// Template 3: Moderna - Diseño con gradientes y cards
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template3({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen py-12 px-4" style={{
      background: `linear-gradient(135deg, ${tarjeta.color_tema}15 0%, ${tarjeta.color_tema}05 100%)`
    }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Card con foto */}
        <Card className="p-8 bg-white shadow-xl rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-2" style={{
            background: `linear-gradient(to right, ${tarjeta.color_tema}, ${tarjeta.color_tema}99)`
          }}/>
          
          <div className="flex flex-col items-center text-center">
            {tarjeta.foto_url && (
              <img
                src={tarjeta.foto_url}
                alt={tarjeta.nombre}
                className={`w-32 h-32 object-cover shadow-xl mb-6 ${
                  tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'
                }`}
                style={{ border: `4px solid ${tarjeta.color_tema}33` }}
              />
            )}
            
            <h1 className="text-3xl font-bold mb-2" style={{
              background: `linear-gradient(135deg, ${tarjeta.color_tema}, ${tarjeta.color_tema}cc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {tarjeta.nombre}
            </h1>
            
            {tarjeta.descripcion && (
              <p className="text-gray-600 text-lg">{tarjeta.descripcion}</p>
            )}
          </div>
        </Card>

        {/* Contacto Card */}
        <Card className="p-6 bg-white shadow-xl rounded-3xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto</h2>
          <div className="grid grid-cols-1 gap-3">
            {tarjeta.whatsapp && (
              <Button
                onClick={() => handleWhatsAppClick(tarjeta.whatsapp)}
                className="w-full py-6 rounded-2xl text-base"
                style={{ 
                  background: `linear-gradient(135deg, ${tarjeta.color_tema}, ${tarjeta.color_tema}dd)`
                }}
              >
                💬 WhatsApp
              </Button>
            )}
            
            {tarjeta.telefono && (
              <Button onClick={() => handlePhoneClick(tarjeta.telefono)} variant="outline" className="py-5 rounded-2xl">
                📞 {tarjeta.telefono}
              </Button>
            )}
            
            {tarjeta.email && (
              <Button onClick={() => handleEmailClick(tarjeta.email)} variant="outline" className="py-5 rounded-2xl">
                📧 {tarjeta.email}
              </Button>
            )}
          </div>
        </Card>

        {/* Enlaces Card */}
        {enlaces && enlaces.length > 0 && (
          <Card className="p-6 bg-white shadow-xl rounded-3xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Enlaces</h2>
            <div className="space-y-3">
              {enlaces.map((enlace) => (
                <Button
                  key={enlace.id}
                  onClick={() => handleEnlaceClick(enlace.url)}
                  variant="outline"
                  className="w-full py-5 rounded-2xl"
                >
                  {enlace.titulo}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Redes Sociales Card */}
        {(tarjeta.instagram_visible || tarjeta.facebook_visible || tarjeta.tiktok_visible || tarjeta.google_maps_visible) && (
          <Card className="p-6 bg-white shadow-xl rounded-3xl">
            <div className="flex justify-center gap-4 flex-wrap">
              {tarjeta.instagram_url && tarjeta.instagram_visible && (
                <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="p-4 rounded-2xl hover:bg-gray-100">
                  <span className="text-3xl">📷</span>
                </button>
              )}
              {tarjeta.facebook_url && tarjeta.facebook_visible && (
                <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="p-4 rounded-2xl hover:bg-gray-100">
                  <span className="text-3xl">👥</span>
                </button>
              )}
              {tarjeta.tiktok_url && tarjeta.tiktok_visible && (
                <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="p-4 rounded-2xl hover:bg-gray-100">
                  <span className="text-3xl">🎵</span>
                </button>
              )}
              {tarjeta.google_maps && tarjeta.google_maps_visible && (
                <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="p-4 rounded-2xl hover:bg-gray-100">
                  <span className="text-3xl">📍</span>
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Guardar Contacto */}
        <Button onClick={handleSaveContact} variant="outline" className="w-full py-6 rounded-2xl border-2" style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}>
          💾 Guardar Contacto
        </Button>

        <div className="text-center text-sm text-gray-500 py-4">
          Creada con <span className="font-semibold">TarjetaQR.app</span>
        </div>
      </div>
    </div>
  );
}
