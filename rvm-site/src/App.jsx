import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/nav/Navbar';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SimulatePage from './pages/SimulatePage';
import { AdminPage, AdminUserDetailPage } from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ClaimPage from './pages/ClaimPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import useAuthStore from './store/useAuthStore';

export default function App() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-pin" element={<ForgotPasswordPage />} />
        <Route path="/simulate" element={<SimulatePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/user/:id" element={<AdminUserDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/claim" element={<ClaimPage />} />
      </Routes>
    </BrowserRouter>
  );
}
