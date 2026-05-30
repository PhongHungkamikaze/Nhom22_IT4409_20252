import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import './App_new.css';

import AppRouter from './routes/AppRouter';

import { Toaster } from 'react-hot-toast';

function AdminThemeWrapper({ children }) {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const role = user && user.role ? String(user.role).toLowerCase() : '';
    if (isAuthenticated && (role === 'admin' || role === 'teacher')) {
      document.body.classList.add('admin-theme');
    } else {
      document.body.classList.remove('admin-theme');
    }
    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, [isAuthenticated, user]);

  return children;
}

function App() {
  return (
    <AuthProvider>
      <AdminThemeWrapper>
        <Toaster position="top-right" reverseOrder={false} />
        <NotificationProvider>
          <Router>
            <div className="App">
              <Header />
              <AppRouter />
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </AdminThemeWrapper>
    </AuthProvider>
  );
}

export default App;