import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Teste from "../pages/Notificacao/Teste";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teste" element={<Teste />} />
    </Routes>
  );
}