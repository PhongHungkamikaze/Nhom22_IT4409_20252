import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Homepage from '../pages/Homepage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminQuizzes from '../pages/Admin/MyQuizzes';
import TeacherDashboard from '../pages/Teacher/Dashboard';
import TeacherMyQuizzes from '../pages/Teacher/MyQuizzes';
import TeacherQuestionBank from '../pages/Teacher/QuestionBank';
import TeacherAttempts from '../pages/Teacher/Attempts';
import StudentDashboard from '../pages/Student/Dashboard';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import TeacherRoute from './TeacherRoute';
import StudentRoute from './StudentRoute';

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin routes (require admin role) */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/quizzes" element={<AdminRoute><AdminQuizzes /></AdminRoute>} />

            {/* Teacher routes */}
            <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
            <Route path="/teacher/quizzes" element={<TeacherRoute><TeacherMyQuizzes /></TeacherRoute>} />
            <Route path="/teacher/questions" element={<TeacherRoute><TeacherQuestionBank /></TeacherRoute>} />
            <Route path="/teacher/attempts" element={<TeacherRoute><TeacherAttempts /></TeacherRoute>} />

            {/* Student routes */}
            <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />

            {/* Example of protecting any route with generic auth check */}
            <Route path="/protected-example" element={<ProtectedRoute><div>Protected content</div></ProtectedRoute>} />
        </Routes>
    );
};

export default AppRouter;
