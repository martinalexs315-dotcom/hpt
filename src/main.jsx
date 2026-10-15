import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './store.jsx';
import PublicLayout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import { Activities, ActivityDetail } from './pages/Activities.jsx';
import { Cagnottes, CagnotteDetail } from './pages/Cagnottes.jsx';
import Contact from './pages/Contact.jsx';
import Unsubscribe from './pages/Unsubscribe.jsx';
import Admin, { AdminLogin } from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="association" element={<About />} />
            <Route path="activites" element={<Activities />} />
            <Route path="activites/:id" element={<ActivityDetail />} />
            <Route path="cagnottes" element={<Cagnottes />} />
            <Route path="cagnottes/:id" element={<CagnotteDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="desabonnement" element={<Unsubscribe />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Accès secret sécurisé pour l'équipe */}
          <Route path="gestion-interne-hpt-2026/login" element={<AdminLogin />} />
          <Route path="gestion-interne-hpt-2026/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
