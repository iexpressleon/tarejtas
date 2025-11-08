import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Registro from "@/pages/Registro";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import TarjetaPublica from "@/pages/TarjetaPublica";
import Premium from "@/pages/Premium";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/t/:slug" element={<TarjetaPublica />} />
          <Route path="/premium" element={<Premium />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
