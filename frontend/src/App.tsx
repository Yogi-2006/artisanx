import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ArtisanHome } from './pages/artisan/ArtisanHome';
import { ProfileSetup } from './pages/artisan/ProfileSetup';
import { ProductCreate } from './pages/artisan/ProductCreate';
import { ProductEdit } from './pages/artisan/ProductEdit';
import { ProductList } from './pages/artisan/ProductList';
import { EnquiryList } from './pages/artisan/EnquiryList';
import { EnquiryDetail } from './pages/artisan/EnquiryDetail';
import { BuyerHome } from './pages/buyer/BuyerHome';
import { CataloguePage } from './pages/buyer/CataloguePage';
import { ProductPage } from './pages/buyer/ProductPage';
import { FacilitatorHome } from './pages/facilitator/FacilitatorHome';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route path="artisan" element={<ArtisanHome />} />
          <Route path="artisan/setup" element={<ProfileSetup />} />
          <Route path="artisan/products/create" element={<ProductCreate />} />
          <Route path="artisan/products/edit/:id" element={<ProductEdit />} />
          <Route path="artisan/products" element={<ProductList />} />
          <Route path="artisan/enquiries" element={<EnquiryList />} />
          <Route path="artisan/enquiries/:id" element={<EnquiryDetail />} />
          
          <Route path="buyer" element={<BuyerHome />} />
          <Route path="buyer/catalogue" element={<CataloguePage />} />
          <Route path="buyer/product/:id" element={<ProductPage />} />
          
          <Route path="facilitator" element={<FacilitatorHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
