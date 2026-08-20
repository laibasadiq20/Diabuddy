import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';
import { useAuth } from './context/AuthContext';
import { useI18n } from './i18n/I18nContext';

// Eager: first paint / auth (small, always needed)
import LandingPage from './pages/LandingPage/LandingPage';
import AuthFlipCard from './pages/login/AuthFlipCard';
import VerifyOtp from './pages/login/VerifyOtp';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';

// Lazy: app modules load only when the route is opened
const WarningSignsPage = lazy(() => import('./pages/LandingPage/sections/Learn/WarningSignsPage'));
const DiabetesTypesPage = lazy(() => import('./pages/LandingPage/sections/Learn/DiabetesTypesPage'));
const BlogPage = lazy(() => import('./pages/LandingPage/sections/Learn/BlogPage'));
const RiskAssessment = lazy(() => import('./pages/LandingPage/sections/Learn/RiskAssessment'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const CommunityFeed = lazy(() => import('./pages/Community/CommunityFeed'));
const PostDetails = lazy(() => import('./pages/Community/PostDetails'));
const NewPost = lazy(() => import('./pages/Community/NewPost'));
const UserProfile = lazy(() => import('./pages/Community/UserProfile'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Account = lazy(() => import('./pages/Account/Account'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const AdminReports = lazy(() => import('./pages/Admin/AdminReports'));
const Toolbox = lazy(() => import('./pages/Toolbox/Toolbox'));
const Logs = lazy(() => import('./pages/Logs/Logs'));
const LogTypePage = lazy(() => import('./pages/Logs/LogTypePage'));
const GoogleHealth = lazy(() => import('./pages/GoogleHealth/GoogleHealth'));
const Reminders = lazy(() => import('./pages/Reminders/Reminders'));
const Reports = lazy(() => import('./pages/Reports/Reports'));

function RouteFallback() {
  const { t: tr } = useI18n();
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg, #F7F3EC)',
      }}
    >
      <p style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: 'var(--ink-faint, #6B6660)', margin: 0 }}>
        {tr('common.loading')}
      </p>
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const patientModule =
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/logs') ||
    location.pathname === '/google-health' ||
    location.pathname === '/reminders' ||
    location.pathname === '/toolbox' ||
    location.pathname === '/reports';

  if (user.role === 'admin' && !adminOnly && patientModule) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<AuthFlipCard startFlipped />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/learn" element={<DiabetesTypesPage />} />
          <Route path="/learn/warning-signs" element={<WarningSignsPage />} />
          <Route path="/learn/diabetes-types" element={<DiabetesTypesPage />} />
          <Route path="/learn/risk-assessment" element={<RiskAssessment />} />
          <Route path="/learn/blog" element={<BlogPage />} />
          <Route path="/login" element={<AuthFlipCard />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/community" element={<CommunityFeed />} />
          <Route path="/community/new-post" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
          <Route path="/community/posts/:id" element={<PostDetails />} />
          <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/toolbox" element={<ProtectedRoute><Toolbox /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
          <Route path="/logs/:typeId" element={<ProtectedRoute><LogTypePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/google-health" element={<ProtectedRoute><GoogleHealth /></ProtectedRoute>} />
          <Route path="/fitbit" element={<Navigate to="/google-health" replace />} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
