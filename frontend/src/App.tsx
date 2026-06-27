import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { WalletPage } from './pages/WalletPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Layout>
                <WalletPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Layout>
                <CampaignsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/wallet" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
