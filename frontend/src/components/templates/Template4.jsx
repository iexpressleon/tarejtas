// Template 4: Elegante - Diseño sofisticado con animaciones
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template4({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl rounded-3xl overflow-hidden border border-slate-700">
          <div className="p-8">
            <div className="text-center mb-8">
              {tarjeta.foto_url && (
                <div className="inline-block relative mb-6">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: tarjeta.color_tema }}/>
                  <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-32 h-32 object-cover relative z-10 ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'}`} style={{ border: `3px solid ${tarjeta.color_tema}` }}/>
                </div>
              )}
              <h1 className="text-4xl font-light mb-3" style={{ color: tarjeta.color_tema }}>{tarjeta.nombre}</h1>
              {tarjeta.descripcion && <p className="text-slate-300 text-lg">{tarjeta.descripcion}</p>}
            </div>

            <div className="space-y-3 mb-8">
              {tarjeta.whatsapp && (
                <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all">💬 WhatsApp</Button>
              )}
              {tarjeta.telefono && (
                <Button onClick={() => handlePhoneClick(tarjeta.telefono)} className="w-full py-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">📞 Llamar</Button>
              )}
              {tarjeta.email && (
                <Button onClick={() => handleEmailClick(tarjeta.email)} className="w-full py-6 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">📧 Email</Button>
              )}
            </div>

            {enlaces && enlaces.length > 0 && (
              <div className="space-y-3 mb-8">
                {enlaces.map((enlace) => (
                  <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} className="w-full py-5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20">{enlace.titulo}</Button>
                ))}
              </div>
            )}

            <div className="flex justify-center gap-4 mb-8">
              {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20">📷</button>}
              {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20">👥</button>}
              {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20">🎵</button>}
              {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="p-3 rounded-xl bg-white/10 hover:bg-white/20">📍</button>}
            </div>

            <Button onClick={handleSaveContact} className="w-full py-6 rounded-xl" style={{ backgroundColor: tarjeta.color_tema }}>💾 Guardar Contacto</Button>
            <div className="text-center text-sm text-slate-400 mt-6">Creada con <span className="font-semibold">TarjetaQR.app</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}
