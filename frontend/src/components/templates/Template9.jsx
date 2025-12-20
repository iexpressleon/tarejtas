// Template 9: Salón de Belleza - Con fondo beauty
import { Button } from "@/components/ui/button";

export default function Template9({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(rgba(255,192,203,0.9), rgba(218,112,214,0.9)), url(https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/98 backdrop-blur-lg rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
            <div className="p-8">
              <div className="text-center mb-8">
                {tarjeta.foto_url && (
                  <div className="inline-block relative mb-6">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full blur-xl opacity-50"/>
                    <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-32 h-32 object-cover relative z-10 border-4 border-white shadow-xl ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'}`}/>
                  </div>
                )}
                <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{tarjeta.nombre}</h1>
                {tarjeta.descripcion && <p className="text-gray-600 text-lg italic">{tarjeta.descripcion}</p>}
              </div>

              <div className="space-y-3 mb-6">
                {tarjeta.whatsapp && <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-6 rounded-2xl text-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>💬 WhatsApp</Button>}
                {tarjeta.telefono && <Button onClick={() => handlePhoneClick(tarjeta.telefono)} className="w-full py-6 rounded-2xl text-lg" style={{ background: 'linear-gradient(135deg, #f472b6, #c084fc)' }}>📞 Llamar</Button>}
                {tarjeta.email && <Button onClick={() => handleEmailClick(tarjeta.email)} variant="outline" className="w-full py-6 rounded-2xl text-lg border-2" style={{ borderColor: '#ec4899' }}>📧 Email</Button>}
              </div>

              {enlaces && enlaces.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-bold text-gray-700">✨ Servicios</h3>
                  {enlaces.map((enlace) => <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} variant="outline" className="w-full py-5 rounded-2xl border-2" style={{ borderColor: '#ec4899' }}>{enlace.titulo}</Button>)}
                </div>
              )}

              <div className="flex justify-center gap-4 mb-6">
                {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="p-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg">📷</button>}
                {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="p-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg">👥</button>}
                {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="p-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg">🎵</button>}
                {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="p-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg">📍</button>}
              </div>

              <Button onClick={handleSaveContact} className="w-full py-6 rounded-2xl text-lg" style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>💾 Guardar Contacto</Button>
              <div className="text-center text-sm text-gray-400 mt-6 font-light">TarjetaQR.app</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
