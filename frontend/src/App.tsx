import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';

import ArtisanHome from './pages/artisan/ArtisanHome';
import ProfileSetup from './pages/artisan/ProfileSetup';
import ProductCreate from './pages/artisan/ProductCreate';
import ProductList from './pages/artisan/ProductList';
import ProductEdit from './pages/artisan/ProductEdit';
import PublicProductPage from './pages/PublicProductPage';
import ProfilePage from './pages/artisan/ProfilePage';
import EnquiryList from './pages/artisan/EnquiryList';
import EnquiryDetail from './pages/artisan/EnquiryDetail';

import BuyerHome from './pages/buyer/BuyerHome';
import CataloguePage from './pages/buyer/CataloguePage';
import BuyerEnquiryDetail from './pages/buyer/BuyerEnquiryDetail';
import FacilitatorHome from './pages/facilitator/FacilitatorHome';
import GuideHandOverlay from './components/guide-hand/GuideHandOverlay';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from './components/layout/AuthLayout';
import { ArtisanLayout } from './components/layout/ArtisanLayout';
import { BuyerLayout } from './components/layout/BuyerLayout';
import { FacilitatorLayout } from './components/layout/FacilitatorLayout';
import { PublicLayout } from './components/layout/PublicLayout';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { t } = useTranslation();

  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg">{t('common.loading')}</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role || 'login'}`} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <GuideHandOverlay />
      <Routes>
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Artisan Routes */}
        <Route path="/artisan" element={<ProtectedRoute allowedRole="artisan"><ArtisanLayout /></ProtectedRoute>}>
          <Route index element={<ArtisanHome />} />
          <Route path="setup" element={<ProfileSetup />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/create" element={<ProductCreate />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="enquiries" element={<EnquiryList />} />
          <Route path="enquiry/:id" element={<EnquiryDetail />} />
        </Route>
        
        {/* Buyer Routes */}
        <Route path="/buyer" element={<ProtectedRoute allowedRole="buyer"><BuyerLayout /></ProtectedRoute>}>
          <Route index element={<BuyerHome />} />
          <Route path="catalogue" element={<CataloguePage />} />
          <Route path="enquiry/:id" element={<BuyerEnquiryDetail />} />
        </Route>

        {/* Facilitator Routes */}
        <Route path="/facilitator" element={<ProtectedRoute allowedRole="facilitator"><FacilitatorLayout /></ProtectedRoute>}>
          <Route index element={<FacilitatorHome />} />
        </Route>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/product/:productId" element={<PublicProductPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
