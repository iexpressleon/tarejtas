import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ContentModal({ isOpen, onClose, type, content, title }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleOpenExternal = () => {
    window.open(content, "_blank", "noopener,noreferrer");
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case "pdf":
        return (
          <div className="w-full h-full overflow-auto bg-gray-100">
            <iframe
              src={`${content}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full min-h-full border-0"
              style={{ minHeight: '200vh' }}
              title={title || "Documento PDF"}
            />
          </div>
        );

      case "image":
        return (
          <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <img
              src={content}
              alt={title || "Imagen"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );

      case "iframe":
      case "website":
        // On mobile, show a button to open externally instead of iframe
        if (isMobile) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-6xl">🌐</div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title || "Enlace Externo"}</h3>
                <p className="text-gray-600 mb-6">Se abrirá en una nueva pestaña</p>
              </div>
              <Button
                onClick={handleOpenExternal}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl"
              >
                Abrir Enlace 🔗
              </Button>
            </div>
          );
        }
        // On desktop, use iframe
        return (
          <iframe
            src={content}
            className="w-full h-full border-0"
            title={title || "Contenido"}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        );

      case "whatsapp":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-8">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold mb-4 text-center">WhatsApp</h2>
            <p className="text-gray-600 mb-6 text-center">{title}</p>
            <Button
              onClick={() => {
                window.location.href = content;
                setTimeout(onClose, 500);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              Abrir WhatsApp 💬
            </Button>
          </div>
        );

      case "email":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold mb-4 text-center">Email</h2>
            <p className="text-gray-600 mb-6 text-center">{title}</p>
            <Button
              onClick={() => {
                window.location.href = content;
                setTimeout(onClose, 500);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              Enviar Email ✉️
            </Button>
          </div>
        );

      case "phone":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-8">
            <div className="text-6xl mb-4">📞</div>
            <h2 className="text-2xl font-bold mb-4 text-center">Llamar</h2>
            <p className="text-gray-600 mb-6 text-center font-bold">{title}</p>
            <Button
              onClick={() => {
                window.location.href = content;
                setTimeout(onClose, 500);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl"
            >
              Llamar Ahora 📞
            </Button>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-600">Cargando contenido...</p>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title || "Contenido"}
          </h3>
          <Button
            data-testid="close-modal-btn"
            onClick={onClose}
            variant="outline"
            size="sm"
            className="hover:bg-gray-100"
          >
            ✕ Cerrar
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            data-testid="close-modal-footer-btn"
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Cerrar y volver
          </Button>
        </div>
      </div>
    </div>
  );
}
