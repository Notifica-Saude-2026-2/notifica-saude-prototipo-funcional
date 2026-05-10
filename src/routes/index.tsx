import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../components/common/layout/PublicLayout/PublicLayout";
import { PrivateRoute } from "./PrivateRoute";
import Home from "../pages/Home/Home";
import Notificacao from "../pages/Notificacao/Notificacao";
import Login from "../pages/Login";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminComingSoon from "../pages/Admin/AdminComingSoon";
import AdminNovos from "../pages/Admin/AdminNovos";
import NotificacaoDetalhe from "../pages/Admin/NotificacaoDetalhe/NotificacaoDetalhe";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/notificacao" element={<Notificacao />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/novos" element={<AdminNovos />} />
        <Route path="/admin/encaminhados" element={<AdminComingSoon />} />
        <Route path="/admin/resolvidos" element={<AdminComingSoon />} />
        <Route path="/incident/:id" element={<NotificacaoDetalhe />} />
      </Route>
    </Routes>
  );
}
