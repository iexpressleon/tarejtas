import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Landing from "@/pages/Landing.jsx";
import Registro from "@/pages/Registro.jsx";
import Dashboard from "@/pages/Dashboard.jsx";
import Editor from "@/pages/Editor.jsx";
import TarjetaPublica from "@/pages/TarjetaPublica.jsx";
import Premium from "@/pages/Premium.jsx";
import AdminDashboard from "@/pages/AdminDashboard.jsx";
import PaymentSuccess from "@/pages/PaymentSuccess.jsx";
import PaymentFailure from "@/pages/PaymentFailure.jsx";
import PaymentPending from "@/pages/PaymentPending.jsx";
import AuthCallback from "@/pages/AuthCallback.jsx";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id synchronously during render
  // This prevents race conditions by processing Google OAuth FIRST
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/editor/:id" element={<Editor />} />
      <Route path="/t/:slug" element={<TarjetaPublica />} />
      <Route path="/premium" element={<Premium />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<PaymentPending />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Toaster position="top-right" />
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
