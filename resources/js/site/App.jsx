import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PackagesPage from './pages/PackagesPage';
import ComparePage from './pages/ComparePage';
import ModulesPage from './pages/ModulesPage';
import CheckoutPage from './pages/CheckoutPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import SiteModals from './components/SiteModals';

/**
 * The marketing shell.
 *
 * Sign-in and registration open as overlays over whatever page asked for them,
 * so they live inside the shell rather than beside it — a visitor who starts a
 * registration from the pricing page should still be standing on the pricing
 * page when they close it.
 */
function SiteLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-[72px] md:pt-[116px] overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <SiteModals />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/checkout/:edition" element={<CheckoutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/* Kept so the addresses that were advertised still open their overlay. */}
          <Route path="/register" element={null} />
          <Route path="/login" element={null} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
