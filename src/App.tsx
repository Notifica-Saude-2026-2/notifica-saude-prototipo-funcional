import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Header } from "./components/common/layout/Header";
import { Footer } from "./components/common/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="layout">
          <Header />

          <main className="main">
            <AppRoutes />
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;