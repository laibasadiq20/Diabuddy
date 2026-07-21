import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';

import { useAuth } from './context/AuthContext';

import LandingPage from './pages/LandingPage/LandingPage';
import AuthFlipCard from './pages/login/AuthFlipCard';
import VerifyOtp from './pages/login/VerifyOtp';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';

import WarningSignsPage from './pages/LandingPage/sections/Learn/WarningSignsPage';
import DiabetesTypesPage from './pages/LandingPage/sections/Learn/DiabetesTypesPage';
import BlogPage from './pages/LandingPage/sections/Learn/BlogPage';
import RiskAssessment from './pages/LandingPage/sections/Learn/RiskAssessment';

import Dashboard from './pages/Dashboard/Dashboard';
import CommunityFeed from './pages/Community/CommunityFeed';
import PostDetails from './pages/Community/PostDetails';
import NewPost from './pages/Community/NewPost';
import UserProfile from './pages/Community/UserProfile';
import Messages from './pages/Messages/Messages';
import Account from './pages/Account/Account';
import AdminReports from './pages/Admin/AdminReports';
import Toolbox from './pages/Toolbox/Toolbox';
import Logs from './pages/Logs/Logs';
import Fitbit from './pages/Fitbit/Fitbit';
import Reminders from './pages/Reminders/Reminders';

// ProtectedRoute wrapper to guard private paths
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F3EC' }}>
        <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: '#6B6660' }}>Loading profile...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

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

        {/* Private Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
        <Route path="/community/new-post" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
        <Route path="/community/posts/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/toolbox" element={<ProtectedRoute><Toolbox /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/fitbit" element={<ProtectedRoute><Fitbit /></ProtectedRoute>} />
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        
        {/* Admin Moderation Queue */}
        <Route path="/admin/reports" element={<ProtectedRoute adminOnly={true}><AdminReports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


export default App;