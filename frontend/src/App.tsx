import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import VerifyOtp from './components/VerifyOtp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './pages/Dashboard';
import { authService } from './services/authService';
import 'antd/dist/antd.css';

type AuthView = 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password' | 'dashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>(() => {
    return authService.isAuthenticated() ? 'dashboard' : 'login';
  });
  const [email, setEmail] = useState<string>('');

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleRegistrationSuccess = (registeredEmail: string) => {
    setEmail(registeredEmail);
    setCurrentView('verify-otp');
  };

  const handleVerificationSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handlePasswordResetSent = (resetEmail: string) => {
    setEmail(resetEmail);
    setCurrentView('reset-password');
  };

  const handleResetSuccess = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentView('login');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
          />
        );
      case 'register':
        return (
          <Register
            onSwitchToLogin={handleBackToLogin}
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      case 'verify-otp':
        return (
          <VerifyOtp
            email={email}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBackToLogin}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPassword
            onBack={handleBackToLogin}
            onSent={handlePasswordResetSent}
          />
        );
      case 'reset-password':
        return (
          <ResetPassword
            email={email}
            onResetSuccess={handleResetSuccess}
            onBack={handleBackToLogin}
          />
        );
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} />;
      default:
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
            onForgotPassword={handleForgotPassword}
          />
        );
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;
