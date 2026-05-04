import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { AccessibilityWidget } from '../../ui/AccessibilityWidget/AccessibilityWidget';

export function PublicLayout() {
  return (
    <div className="layout">
      <Header />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
      <AccessibilityWidget />
    </div>
  );
}
