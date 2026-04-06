import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Register from './pages/Register';
import Footer from './components/Footer';
import './App_new.css';

// Dashboards and admin pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminQuizzes from './pages/Admin/MyQuizzes';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherMyQuizzes from './pages/Teacher/MyQuizzes';
import TeacherQuestionBank from './pages/Teacher/QuestionBank';
import TeacherAttempts from './pages/Teacher/Attempts';
import StudentDashboard from './pages/Student/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            {/* Định nghĩa đường dẫn cho từng trang */}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Test Routes for Dashboards */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/quizzes" element={< AdminQuizzes />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/quizzes" element={<TeacherMyQuizzes />} />
            <Route path="/teacher/questions" element={<TeacherQuestionBank />} />
            <Route path="/teacher/attempts" element={<TeacherAttempts />} />
            <Route path="/student" element={<StudentDashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;