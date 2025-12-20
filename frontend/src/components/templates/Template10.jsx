// Template 10: Gimnasio/Fitness - Con fondo deportivo
import { Button } from "@/components/ui/button";

export default function Template10({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(rgba(0,0,0,0.75), rgba(220,38,38,0.85)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/80 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border-2 border-red-500/50">
            <div className="p-8">
              <div className="text-center mb-8">
                {tarjeta.foto_url && (
                  <div className="inline-block relative mb-6">
                    <div className="absolute -inset-2 bg-red-600 rounded-full blur-lg"/>
                    <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-32 h-32 object-cover relative z-10 border-4 border-red-500 shadow-xl ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-xl'}`}/>
                  </div>
                )}
                <h1 className="text-4xl font-black text-white mb-2" style={{ textShadow: '0 0 20px rgba(220,38,38,0.5)' }}>{tarjeta.nombre}</h1>
                {tarjeta.descripcion && <p className="text-gray-300 text-lg font-semibold">{tarjeta.descripcion}</p>}
              </div>

              <div className="space-y-3 mb-6">
                {tarjeta.whatsapp && <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-6 rounded-xl text-lg font-bold" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>💬 WHATSAPP</Button>}
                {tarjeta.telefono && <Button onClick={() => handlePhoneClick(tarjeta.telefono)} className="w-full py-6 rounded-xl text-lg font-bold border-2 border-red-500 bg-white/10 text-white hover:bg-white/20">📞 LLAMAR</Button>}
                {tarjeta.email && <Button onClick={() => handleEmailClick(tarjeta.email)} className="w-full py-6 rounded-xl text-lg font-bold border-2 border-red-500 bg-white/10 text-white hover:bg-white/20">📧 EMAIL</Button>}
              </div>

              {enlaces && enlaces.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">💪 Entrenamientos</h3>
                  {enlaces.map((enlace) => <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} className="w-full py-5 rounded-xl font-bold border-2 border-red-500/50 bg-white/10 text-white hover:bg-white/20">{enlace.titulo}</Button>)}
                </div>
              )}

              <div className="flex justify-center gap-3 mb-6">
                {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-600 hover:bg-red-700 text-2xl shadow-lg">📷</button>}
                {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-600 hover:bg-red-700 text-2xl shadow-lg">👥</button>}
                {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-600 hover:bg-red-700 text-2xl shadow-lg">🎵</button>}
                {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="w-14 h-14 rounded-xl flex items-center justify-center bg-red-600 hover:bg-red-700 text-2xl shadow-lg">📍</button>}
              </div>

              <Button onClick={handleSaveContact} className="w-full py-6 rounded-xl text-lg font-black" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>💾 GUARDAR CONTACTO</Button>
              <div className="text-center text-sm text-gray-400 mt-6 font-black uppercase tracking-wider">TarjetaQR.app</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
