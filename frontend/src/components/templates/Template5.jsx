// Template 5: Creativa - Layout asimétrico y colorido
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template5({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: `linear-gradient(45deg, ${tarjeta.color_tema}22, white, ${tarjeta.color_tema}11)` }}>
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8 bg-white shadow-xl rounded-3xl transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-6">
                {tarjeta.foto_url && (
                  <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-24 h-24 object-cover ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-xl'}`} style={{ border: `3px solid ${tarjeta.color_tema}` }}/>
                )}
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: tarjeta.color_tema }}>{tarjeta.nombre}</h1>
                  {tarjeta.descripcion && <p className="text-gray-600">{tarjeta.descripcion}</p>}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white shadow-xl rounded-3xl">
              <div className="space-y-3">
                {tarjeta.whatsapp && <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-5 rounded-2xl" style={{ backgroundColor: tarjeta.color_tema }}>💬 WhatsApp</Button>}
                {tarjeta.telefono && <Button onClick={() => handlePhoneClick(tarjeta.telefono)} variant="outline" className="w-full py-5 rounded-2xl">📞 {tarjeta.telefono}</Button>}
                {tarjeta.email && <Button onClick={() => handleEmailClick(tarjeta.email)} variant="outline" className="w-full py-5 rounded-2xl">📧 Email</Button>}
              </div>
            </Card>

            {enlaces && enlaces.length > 0 && (
              <Card className="p-6 bg-white shadow-xl rounded-3xl">
                <h3 className="text-lg font-bold mb-4" style={{ color: tarjeta.color_tema }}>Enlaces</h3>
                <div className="grid grid-cols-2 gap-3">
                  {enlaces.map((enlace) => (
                    <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} variant="outline" className="py-4 rounded-xl text-sm">{enlace.titulo}</Button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-white shadow-xl rounded-3xl" style={{ background: `linear-gradient(135deg, ${tarjeta.color_tema}11, white)` }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: tarjeta.color_tema }}>Redes</h3>
              <div className="space-y-3">
                {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="w-full p-3 rounded-xl bg-white hover:bg-gray-50 text-left font-medium">📷 Instagram</button>}
                {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="w-full p-3 rounded-xl bg-white hover:bg-gray-50 text-left font-medium">👥 Facebook</button>}
                {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="w-full p-3 rounded-xl bg-white hover:bg-gray-50 text-left font-medium">🎵 TikTok</button>}
                {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="w-full p-3 rounded-xl bg-white hover:bg-gray-50 text-left font-medium">📍 Ubicación</button>}
              </div>
            </Card>

            <Button onClick={handleSaveContact} variant="outline" className="w-full py-5 rounded-2xl border-2" style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}>💾 Guardar</Button>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-6">Creada con <span className="font-semibold">TarjetaQR.app</span></div>
      </div>
    </div>
  );
}
