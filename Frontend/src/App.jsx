import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import './App_new.css';

import AppRouter from './routes/AppRouter';

// Dashboards and admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminQuizzes from './pages/Admin/MyQuizzes';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherMyQuizzes from './pages/Teacher/MyQuizzes';
import TeacherQuestionBank from './pages/Teacher/QuestionBank';
import TeacherAttempts from './pages/Teacher/Attempts';
import StudentDashboard from './pages/Student/Dashboard';

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