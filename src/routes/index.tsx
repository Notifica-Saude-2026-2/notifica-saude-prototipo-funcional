import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Notificacao from "../pages/Notificacao/Notificacao";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/notificacao" element={<Notificacao />} />
    </Routes>
  );
}