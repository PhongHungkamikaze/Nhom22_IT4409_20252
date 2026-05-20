import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;