import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/screens/Home';
import { ReportIssue } from './components/screens/ReportIssue';
import { TrackComplaints } from './components/screens/TrackComplaints';
import { CityServices } from './components/screens/CityServices';
import { AIAssistant } from './components/screens/AIAssistant';
import { Profile } from './components/screens/Profile';
import { AdminDashboard } from './components/screens/AdminDashboard';

type Screen = 'home' | 'report' | 'track' | 'services' | 'ai-help' | 'profile' | 'admin';
type AuthScreen = 'login' | 'signup' | 'forgot-password';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 animate-pulse">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthScreen('login')} />;
    }
    if (authScreen === 'forgot-password') {
      return <ForgotPassword onBack={() => setAuthScreen('login')} />;
    }
    return (
      <Login
        onSwitchToSignup={() => setAuthScreen('signup')}
        onSwitchToForgotPassword={() => setAuthScreen('forgot-password')}
      />
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <Home onNavigate={(screen) => setActiveScreen(screen as Screen)} />;
      case 'report':
        return <ReportIssue onBack={() => setActiveScreen('home')} />;
      case 'track':
        return <TrackComplaints />;
      case 'services':
        return <CityServices />;
      case 'ai-help':
        return <AIAssistant />;
      case 'profile':
        return <Profile onNavigate={(screen) => setActiveScreen(screen as Screen)} />;
      case 'admin':
        return <AdminDashboard onBack={() => setActiveScreen('profile')} />;
      default:
        return <Home onNavigate={(screen) => setActiveScreen(screen as Screen)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderScreen()}
      {activeScreen !== 'admin' && (
        <BottomNav
          active={activeScreen}
          onChange={(screen) => setActiveScreen(screen as Screen)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
