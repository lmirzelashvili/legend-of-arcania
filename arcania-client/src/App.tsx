import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useCharacterStore } from './store/useCharacterStore';
import { useWalletStore } from './store/useWalletStore';
import { useVaultStore } from './store/useVaultStore';
import { useNotificationStore } from './store/useNotificationStore';
import { useUIStore } from './store/useUIStore';
import LoadingScreen from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { connectSSE, disconnectSSE } from './services/sse.client';

// Lazy-loaded routes
const Home = React.lazy(() => import('./pages/Home'));
const About = React.lazy(() => import('./pages/About'));
const Lore = React.lazy(() => import('./pages/Lore'));
const Races = React.lazy(() => import('./pages/Races'));
const Classes = React.lazy(() => import('./pages/Classes'));
const Token = React.lazy(() => import('./pages/Token'));
const Whitepaper = React.lazy(() => import('./pages/Whitepaper'));

const LoginScreen = React.lazy(() =>
  import('./components/Auth/LoginScreen').then(m => ({ default: m.LoginScreen }))
);
const Dashboard = React.lazy(() => import('./components/Dashboard/Dashboard'));
const CharacterManagement = React.lazy(() => import('./components/Character/CharacterManagement'));
const EquipmentPanel = React.lazy(() => import('./components/Equipment/EquipmentPanel'));
const TestEquipment = React.lazy(() => import('./pages/TestEquipment'));

// Route Change Handler — resets non-auth stores when returning to auth/selection screens
const RouteChangeHandler: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (location.pathname === '/login') {
      disconnectSSE();
      useCharacterStore.getState().reset();
      useWalletStore.getState().reset();
      useVaultStore.getState().reset();
      useNotificationStore.getState().reset();
      useUIStore.getState().reset();
    } else if (location.pathname === '/character-select') {
      useCharacterStore.getState().reset();
      useWalletStore.getState().reset();
      useVaultStore.getState().reset();
      useNotificationStore.getState().reset();
      useUIStore.getState().reset();
    } else if (isAuthenticated) {
      connectSSE();
    }
  }, [location.pathname, isAuthenticated]);

  return null;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Character Management Wrapper
const CharacterManagementWrapper: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const navigate = useNavigate();

  if (!currentCharacter) {
    return <Navigate to="/character-select" replace />;
  }

  return (
    <CharacterManagement
      character={currentCharacter}
      onBack={() => navigate('/character-select')}
    />
  );
};

function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <RouteChangeHandler />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Website Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/lore" element={<Lore />} />
          <Route path="/races" element={<Races />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/token" element={<Token />} />
          <Route path="/whitepaper" element={<Whitepaper />} />

          {/* Auth */}
          <Route path="/login" element={<LoginScreen />} />

          {/* Protected Routes */}
          <Route
            path="/character-select"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/character-management"
            element={
              <ProtectedRoute>
                <CharacterManagementWrapper />
              </ProtectedRoute>
            }
          />

          {/* Dev-only routes */}
          {import.meta.env.DEV && (
            <>
              <Route path="/equipment" element={<EquipmentPanel />} />
              <Route path="/test-equipment" element={<TestEquipment />} />
              <Route path="/equipment-preview" element={<TestEquipment />} />
            </>
          )}

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
