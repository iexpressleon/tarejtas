import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Template preview images/mockups
const TEMPLATE_PREVIEWS = {
  1: "https://via.placeholder.com/300x400/6366f1/ffffff?text=Clásica",
  2: "https://via.placeholder.com/300x400/8b5cf6/ffffff?text=Profesional",
  3: "https://via.placeholder.com/300x400/ec4899/ffffff?text=Moderna",
  4: "https://via.placeholder.com/300x400/1f2937/ffffff?text=Elegante",
  5: "https://via.placeholder.com/300x400/f59e0b/ffffff?text=Creativa",
  6: "https://via.placeholder.com/300x400/ffffff/000000?text=Minimalista",
  7: "https://via.placeholder.com/300x400/ef4444/ffffff?text=Vibrante"
};

export default function TemplateGallery({ isOpen, onClose, currentTemplateId, onSelectTemplate, userPlan }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplateId);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setSelectedTemplate(currentTemplateId);
    }
  }, [isOpen, currentTemplateId]);

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`, { withCredentials: true });
      setTemplates(response.data);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    // Check if template is premium and user is not paid
    if (template.is_premium && userPlan !== "paid") {
      setShowUpgradeModal(true);
      return;
    }

    setSelectedTemplate(template.id);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate !== currentTemplateId) {
      onSelectTemplate(selectedTemplate);
    }
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Selecciona una Plantilla</DialogTitle>
            <DialogDescription>
              Elige el diseño que mejor represente tu estilo profesional
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  const isPremium = template.is_premium;
                  const isLocked = isPremium && userPlan !== "paid";

                  return (
                    <Card
                      key={template.id}
                      className={`relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                        isSelected 
                          ? 'ring-4 ring-indigo-500 shadow-xl' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => handleTemplateClick(template)}
                    >
                      {/* Premium Badge */}
                      {isPremium && (
                        <div className="absolute top-2 right-2 z-10">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            ⭐ PREMIUM
                          </span>
                        </div>
                      )}

                      {/* Lock Overlay for Premium Templates */}
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🔒</div>
                            <p className="font-semibold">Actualiza a Premium</p>
                          </div>
                        </div>
                      )}

                      {/* Template Preview Image */}
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img
                          src={TEMPLATE_PREVIEWS[template.id]}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-3 shadow-xl">
                              <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        {/* Features */}
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  disabled={selectedTemplate === currentTemplateId}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {selectedTemplate === currentTemplateId ? "Seleccionado" : "Aplicar Plantilla"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">🌟 Actualiza a Premium</DialogTitle>
            <DialogDescription>
              Esta plantilla está disponible solo para usuarios Premium
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl mb-4">
              <p className="text-4xl font-bold text-center mb-2">$300 <span className="text-lg">MXN</span></p>
              <p className="text-center text-gray-600">por año</p>
            </div>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Acceso a todas las plantillas premium</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Sin marca TarjetaQR.app</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm">Soporte prioritario</span>
              </li>
            </ul>

            <Button
              onClick={() => window.location.href = '/premium'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg"
            >
              Actualizar Ahora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
