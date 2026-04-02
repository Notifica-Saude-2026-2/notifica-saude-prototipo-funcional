import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TestPage } from "../pages/TestPage/TestPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}