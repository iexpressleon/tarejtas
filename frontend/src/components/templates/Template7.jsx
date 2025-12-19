// Template 7: Vibrante - Colores llamativos para creativos
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Template7({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: `radial-gradient(circle at 20% 50%, ${tarjeta.color_tema}33, white, ${tarjeta.color_tema}22)` }}>
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 bg-white shadow-2xl rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-3 flex">
            {colors.map((color, i) => <div key={i} className="flex-1" style={{ backgroundColor: color }}/>)}
          </div>

          <div className="text-center mb-8 mt-4">
            {tarjeta.foto_url && (
              <div className="inline-block relative mb-6">
                <div className="absolute -inset-2 rounded-full" style={{ background: `linear-gradient(45deg, ${colors[0]}, ${colors[2]}, ${colors[4]})`, filter: 'blur(10px)', opacity: 0.5 }}/>
                <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-32 h-32 object-cover relative z-10 ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-2xl'}`} style={{ border: `4px solid white`, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}/>
              </div>
            )}
            <h1 className="text-4xl font-black mb-2" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[2]}, ${colors[4]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{tarjeta.nombre}</h1>
            {tarjeta.descripcion && <p className="text-gray-600 text-lg font-medium">{tarjeta.descripcion}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {tarjeta.whatsapp && (
              <Button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="py-6 rounded-2xl font-bold" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>💬 WhatsApp</Button>
            )}
            {tarjeta.telefono && (
              <Button onClick={() => handlePhoneClick(tarjeta.telefono)} className="py-6 rounded-2xl font-bold" style={{ background: `linear-gradient(135deg, ${colors[2]}, ${colors[3]})` }}>📞 Llamar</Button>
            )}
            {tarjeta.email && (
              <Button onClick={() => handleEmailClick(tarjeta.email)} className="col-span-2 py-6 rounded-2xl font-bold" style={{ background: `linear-gradient(135deg, ${colors[4]}, ${colors[5]})` }}>📧 Email</Button>
            )}
          </div>

          {enlaces && enlaces.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-black mb-4" style={{ color: tarjeta.color_tema }}>🔗 Enlaces</h3>
              <div className="space-y-2">
                {enlaces.map((enlace, i) => (
                  <Button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} className="w-full py-5 rounded-2xl font-bold" style={{ background: colors[i % colors.length] + '22', color: colors[i % colors.length], border: `2px solid ${colors[i % colors.length]}` }}>{enlace.titulo}</Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 mb-6">
            {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>📷</button>}
            {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[2]}, ${colors[3]})` }}>👥</button>}
            {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[4]}, ${colors[5]})` }}>🎵</button>}
            {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${colors[1]}, ${colors[4]})` }}>📍</button>}
          </div>

          <Button onClick={handleSaveContact} className="w-full py-6 rounded-2xl font-black" style={{ background: `linear-gradient(135deg, ${tarjeta.color_tema}, ${tarjeta.color_tema}cc)` }}>💾 GUARDAR CONTACTO</Button>
          
          <div className="text-center text-sm font-bold mt-6" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[4]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TarjetaQR.app</div>
        </Card>
      </div>
    </div>
  );
}
