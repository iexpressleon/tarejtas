// Template 6: Minimalista - Ultra limpio, estilo japonés
import { Button } from "@/components/ui/button";

export default function Template6({ tarjeta, enlaces, handleWhatsAppClick, handleEmailClick, handlePhoneClick, handleEnlaceClick, handleSaveContact }) {
  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-16">
          {tarjeta.foto_url && (
            <div className="mb-8">
              <img src={tarjeta.foto_url} alt={tarjeta.nombre} className={`w-24 h-24 object-cover mx-auto ${tarjeta.foto_forma === 'circular' ? 'rounded-full' : 'rounded-lg'}`} style={{ border: `1px solid ${tarjeta.color_tema}33` }}/>
            </div>
          )}
          <h1 className="text-4xl font-light mb-4 text-gray-900">{tarjeta.nombre}</h1>
          {tarjeta.descripcion && <p className="text-gray-500 text-lg font-light">{tarjeta.descripcion}</p>}
        </div>

        <div className="space-y-1 mb-12">
          {tarjeta.whatsapp && (
            <button onClick={() => handleWhatsAppClick(tarjeta.whatsapp)} className="w-full py-5 px-6 text-left hover:bg-gray-50 transition-colors border-b text-gray-700">
              <span className="text-sm text-gray-500 block mb-1">WhatsApp</span>
              <span className="font-light">{tarjeta.whatsapp}</span>
            </button>
          )}
          {tarjeta.telefono && (
            <button onClick={() => handlePhoneClick(tarjeta.telefono)} className="w-full py-5 px-6 text-left hover:bg-gray-50 transition-colors border-b text-gray-700">
              <span className="text-sm text-gray-500 block mb-1">Teléfono</span>
              <span className="font-light">{tarjeta.telefono}</span>
            </button>
          )}
          {tarjeta.email && (
            <button onClick={() => handleEmailClick(tarjeta.email)} className="w-full py-5 px-6 text-left hover:bg-gray-50 transition-colors border-b text-gray-700">
              <span className="text-sm text-gray-500 block mb-1">Email</span>
              <span className="font-light">{tarjeta.email}</span>
            </button>
          )}
        </div>

        {enlaces && enlaces.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-4">Enlaces</h3>
            <div className="space-y-1">
              {enlaces.map((enlace) => (
                <button key={enlace.id} onClick={() => handleEnlaceClick(enlace.url)} className="w-full py-4 px-6 text-left hover:bg-gray-50 transition-colors border-b text-gray-700 font-light">{enlace.titulo}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-8 mb-12">
          {tarjeta.instagram_url && tarjeta.instagram_visible && <button onClick={() => window.open(tarjeta.instagram_url, '_blank')} className="text-2xl hover:opacity-60 transition-opacity">📷</button>}
          {tarjeta.facebook_url && tarjeta.facebook_visible && <button onClick={() => window.open(tarjeta.facebook_url, '_blank')} className="text-2xl hover:opacity-60 transition-opacity">👥</button>}
          {tarjeta.tiktok_url && tarjeta.tiktok_visible && <button onClick={() => window.open(tarjeta.tiktok_url, '_blank')} className="text-2xl hover:opacity-60 transition-opacity">🎵</button>}
          {tarjeta.google_maps && tarjeta.google_maps_visible && <button onClick={() => window.open(tarjeta.google_maps, '_blank')} className="text-2xl hover:opacity-60 transition-opacity">📍</button>}
        </div>

        <button onClick={handleSaveContact} className="w-full py-4 border text-gray-700 hover:bg-gray-50 transition-colors font-light" style={{ borderColor: tarjeta.color_tema, color: tarjeta.color_tema }}>Guardar Contacto</button>
        
        <div className="text-center text-xs text-gray-400 mt-12 font-light">TarjetaQR.app</div>
      </div>
    </div>
  );
}
