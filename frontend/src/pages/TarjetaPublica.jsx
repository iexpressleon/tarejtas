import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ContentModal from "@/components/ContentModal";
import Template1 from "@/components/templates/Template1";
import Template2 from "@/components/templates/Template2";
import Template3 from "@/components/templates/Template3";
import Template4 from "@/components/templates/Template4";
import Template5 from "@/components/templates/Template5";
import Template6 from "@/components/templates/Template6";
import Template7 from "@/components/templates/Template7";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TarjetaPublica() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tarjeta, setTarjeta] = useState(null);
  const [enlaces, setEnlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    loadTarjeta();
  }, [slug]);

  const loadTarjeta = async () => {
    try {
      const [tarjetaRes, enlacesRes] = await Promise.all([
        axios.get(`${API}/tarjetas/slug/${slug}`),
        axios.get(`${API}/enlaces/${slug}`).catch(() => ({ data: [] })),
      ]);

      // If slug doesn't exist in tarjetas, try to find by tarjeta_id
      if (tarjetaRes.data) {
        setTarjeta(tarjetaRes.data);
        
        // Get enlaces by tarjeta_id
        const enlacesById = await axios.get(`${API}/enlaces/${tarjetaRes.data.id}`);
        setEnlaces(enlacesById.data);
        
        // Increment visit count (fire and forget)
        axios.post(`${API}/tarjetas/slug/${slug}/visit`).catch(() => {
          // Ignore errors for visit tracking
        });
      }
    } catch (error) {
      console.error("Error loading tarjeta:", error);
      if (error.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhone = () => {
    if (tarjeta?.telefono) {
      const cleanNumber = tarjeta.telefono.replace(/[^0-9+]/g, "");
      const telUrl = `tel:${cleanNumber}`;
      window.location.href = telUrl;
    }
  };

  const handleWhatsApp = () => {
    if (tarjeta?.whatsapp) {
      const cleanNumber = tarjeta.whatsapp.replace(/[^0-9]/g, "");
      if (cleanNumber.length < 10) {
        return;
      }
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmail = () => {
    if (tarjeta?.email) {
      const mailtoUrl = `mailto:${tarjeta.email}`;
      window.location.href = mailtoUrl;
    }
  };

  // handleEnlaceClick moved below

  const handleSaveContact = () => {
    if (!tarjeta) return;

    // Create vCard format
    const cardUrl = `${window.location.origin}/t/${slug}`;
    
    let vcard = "BEGIN:VCARD\n";
    vcard += "VERSION:3.0\n";
    vcard += `FN:${tarjeta.nombre}\n`;
    vcard += `N:${tarjeta.nombre};;;;\n`;
    
    if (tarjeta.descripcion) {
      vcard += `NOTE:${tarjeta.descripcion}\n`;
    }
    
    if (tarjeta.telefono) {
      vcard += `TEL;TYPE=CELL:${tarjeta.telefono}\n`;
    }
    
    if (tarjeta.email) {
      vcard += `EMAIL:${tarjeta.email}\n`;
    }
    
    if (tarjeta.whatsapp) {
      vcard += `TEL;TYPE=WORK:${tarjeta.whatsapp}\n`;
    }
    
    // Add tarjeta QR URL
    vcard += `URL;TYPE=TarjetaQR:${cardUrl}\n`;
    vcard += `URL:${cardUrl}\n`;
    
    vcard += "END:VCARD";

    // Create blob and download
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tarjeta.nombre.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleWhatsAppClick = (whatsapp) => {
    if (whatsapp) {
      const cleanNumber = whatsapp.replace(/[^0-9]/g, "");
      if (cleanNumber.length < 10) return;
      const whatsappUrl = `https://wa.me/${cleanNumber}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleEmailClick = (email) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    }
  };

  const handlePhoneClick = (telefono) => {
    if (telefono) {
      window.location.href = `tel:${telefono}`;
    }
  };

  const handleEnlaceClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };
  
  const handleArchivoClick = () => {
    if (tarjeta?.archivo_negocio) {
      const tipo = tarjeta.archivo_negocio_tipo === "pdf" ? "pdf" : "image";
      const titulo = tarjeta.archivo_negocio_titulo || 
                     (tipo === "pdf" ? "Documento PDF" : "Imagen");
      
      setModalType(tipo);
      setModalContent(tarjeta.archivo_negocio);
      setModalTitle(titulo);
      setModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-2 border-gray-100 rounded-2xl max-w-md">
          <h1 className="text-2xl font-bold mb-4">Tarjeta no encontrada</h1>
          <p className="text-gray-600 mb-6">
            Esta tarjeta no existe o ha sido eliminada.
          </p>
          <Button
            data-testid="go-home-btn"
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Ir al inicio
          </Button>
        </Card>
      </div>
    );
  }

  const colorTema = tarjeta?.color_tema || "#6366f1";

  // Template props
  const templateProps = {
    tarjeta,
    enlaces,
    handleWhatsAppClick,
    handleEmailClick,
    handlePhoneClick,
    handleEnlaceClick,
    handleSaveContact
  };

  // Render the appropriate template based on plantilla_id
  const renderTemplate = () => {
    const templateId = tarjeta?.plantilla_id || 1;
    
    switch(templateId) {
      case 1:
        return <Template1 {...templateProps} />;
      case 2:
        return <Template2 {...templateProps} />;
      case 3:
        return <Template3 {...templateProps} />;
      case 4:
        return <Template4 {...templateProps} />;
      case 5:
        return <Template5 {...templateProps} />;
      case 6:
        return <Template6 {...templateProps} />;
      case 7:
        return <Template7 {...templateProps} />;
      default:
        return <Template1 {...templateProps} />;
    }
  };

  return (
    <>
      {renderTemplate()}
      
      <ContentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        content={modalContent}
        title={modalTitle}
      />
    </>
  );
}
