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
            <h2 className="text-2xl font-bold mb-4">Abriendo WhatsApp...</h2>
            <p className="text-gray-600 mb-6 text-center">
              Si no se abre automáticamente, haz clic en el botón de abajo
            </p>
            <a
              href={content}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              Abrir WhatsApp
            </a>
          </div>
        );

      case "email":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold mb-4">Abriendo Email...</h2>
            <p className="text-gray-600 mb-6 text-center">
              Si no se abre automáticamente, haz clic en el botón de abajo
            </p>
            <a
              href={content}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Enviar Email
            </a>
          </div>
        );

      case "phone":
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-8">
            <div className="text-6xl mb-4">📞</div>
            <h2 className="text-2xl font-bold mb-4">Realizar llamada</h2>
            <p className="text-gray-600 mb-4 text-center">
              Número: <span className="font-bold">{title}</span>
            </p>
            <a
              href={content}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Llamar Ahora
            </a>
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
