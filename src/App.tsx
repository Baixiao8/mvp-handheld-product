import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './Layout';
import ProductImage from './pages/ProductImage';
import Handheld from './pages/Handheld';
import { initTracking, track } from './tracking';
import { ENV } from './config/env';

export default function App() {
  useEffect(() => {
    initTracking({
      userId: 'demo_user_001',          // @TODO 接千图AI 用户系统
      userType: ENV.userType,
      sessionId: `sess_${Date.now()}`,
    });
    track.entryView();
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/product-image" replace />} />
        <Route path="/product-image" element={<ProductImage />} />
        <Route path="/handheld" element={<Handheld />} />
      </Routes>
    </Layout>
  );
}
