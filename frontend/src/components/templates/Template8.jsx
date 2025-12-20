// Template 8: Restaurante - Con fondo culinario
import { Button } from "@/components/ui/button";

export default function Template8({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="min-h-screen bg-black/40 backdrop-blur-sm py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative h-40" style={{ background: `linear-gradient(135deg, ${tarjeta.color_tema}, ${tarjeta.color_tema}dd)` }}>
              <div className="absolute inset-0 bg-black/20"/>
              {tarjeta.foto_url && (
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-32 h-32 object-cover border-4 border-white shadow-xl ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'}`}/>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="pt-20 px-8 pb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2" style={{ color: tarjeta.color_tema }}>{tarjeta.nombre}</h1>
                {tarjeta.descripcion && <p className="text-gray-600 text-lg">{tarjeta.descripcion}</p>}
              </div>

              <div className="space-y-3 mb-6">
                {tarjeta.whatsapp && <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-6 rounded-xl text-lg" style={{ backgroundColor: tarjeta.color_tema }}>💬 WhatsApp</Button>}
                {tarjeta.telefono && <Button onClick={() => handlePhoneClick(tarjeta.telefono)} variant="outline" className="w-full py-6 rounded-xl text-lg">📞 Llamar</Button>}
                {tarjeta.email && <Button onClick={() => handleEmailClick(tarjeta.email)} variant="outline" className="w-full py-6 rounded-xl text-lg">📧 Email</Button>}
              </div>

              {enlaces && enlaces.length > 0 && (
                <div className="space-y-3 mb-6">
                  {enlaces.map((enlace) => <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} variant="outline" className="w-full py-5 rounded-xl">{enlace.titulo}</Button>)}
                </div>
              )}

              <div className="flex justify-center gap-4 mb-6">
                {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">📷</button>}
                {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">👥</button>}
                {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">🎵</button>}
                {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">📍</button>}
              </div>

              <Button onClick={handleSaveContact} variant="outline" className="w-full py-6 rounded-xl border-2" style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}>💾 Guardar Contacto</Button>
              <div className="text-center text-sm text-gray-500 mt-6">TarjetaQR.app</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
