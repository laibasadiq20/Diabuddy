import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';

import LandingPage from './pages/LandingPage/LandingPage';
import AuthFlipCard from './pages/login/AuthFlipCard';
import VerifyOtp from './pages/login/VerifyOtp';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';

import WarningSignsPage from './pages/LandingPage/sections/Learn/WarningSignsPage';
import DiabetesTypesPage from './pages/LandingPage/sections/Learn/DiabetesTypesPage';
import BlogPage from './pages/LandingPage/sections/Learn/BlogPage';
import RiskAssessment from './pages/LandingPage/sections/Learn/RiskAssessment';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<AuthFlipCard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/learn/warning-signs" element={<WarningSignsPage />} />
        <Route path="/learn/diabetes-types" element={<DiabetesTypesPage />} />
        <Route path="/learn/risk-assessment" element={<RiskAssessment />} />
        <Route path="/learn/blog" element={<BlogPage />} />
        <Route path="/login" element={<AuthFlipCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;