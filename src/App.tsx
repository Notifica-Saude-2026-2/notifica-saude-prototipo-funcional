import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { Header } from "./components/common/layout/Header";
import { Footer } from "./components/common/layout/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AccessibilityWidget } from "./components/common/ui/AccessibilityWidget/AccessibilityWidget";
import "./App.css";

function App() {
  return (
    <AccessibilityProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="layout">
            <Header />

            <main className="main">
              <AppRoutes />
            </main>

            <Footer />
            <AccessibilityWidget />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

export default App;