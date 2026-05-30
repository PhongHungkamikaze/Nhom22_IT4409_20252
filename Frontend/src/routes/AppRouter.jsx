import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages
import Homepage from '../pages/Homepage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';


// Admin 
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminUsers from '../pages/Admin/Users';
import AdminAddUser from '../pages/Admin/AddUser';
import AdminQuizzes from '../pages/Admin/MyQuizzes';
import AdminQuestions from "../pages/Admin/Questions"
import AdminSubjects from '../pages/Admin/Subjects';
import AdminEditUser from '../pages/Admin/EditUser';
import AdminAttempts from '../pages/Admin/Attempts';
import AdminQuizDetail from '../pages/Admin/AdminQuizDetail';
import AdminQuestionDetail from '../pages/Admin/AdminQuestionDetail';
import AdminClassGroups from '../pages/Admin/ClassGroups';
import AdminClassGroupDetail from '../pages/Admin/AdminClassGroupDetail';
import AdminFiles from '../pages/Admin/Files';
import NotificationManagement from '../pages/common/Notifications/NotificationManagement';

// Teacher
import TeacherDashboard from '../pages/Teacher/Dashboard';
import TeacherMyQuizzes from '../pages/Teacher/MyQuizzes';
import TeacherQuestionBank from '../pages/Teacher/QuestionBank';
import TeacherAddQuestion from '../pages/Teacher/AddQuestion';
import TeacherEditQuestion from '../pages/Teacher/EditQuestion';
import TeacherQuestionCreate from '../pages/Teacher/CreateQuiz'
import TeacherAttempts from '../pages/Teacher/Attempts';
import TeacherQuizDetail from '../pages/Teacher/TeacherQuizDetail';
import TeacherQuizEdit from '../pages/Teacher/TeacherQuizEdit';
import TeacherSubjects from '../pages/Teacher/TeacherSubjects';
import TeacherQuestionDetail from '../pages/Teacher/TeacherQuestionDetail';
import ImportAIQuestions from '../pages/Teacher/ImportAIQuestions';
import QuizStats from '../pages/Teacher/QuizStats';
import TeacherClassGroups from '../pages/Teacher/ClassGroups';
import TeacherClassGroupDetail from '../pages/Teacher/ClassGroupDetail';
import TeacherFiles from '../pages/Teacher/Files';

// Student
import StudentDashboard from '../pages/Student/Dashboard';
import StudentQuizList from '../pages/Student/QuizList';
import StudentQuizDetail from '../pages/Student/QuizDetail';
import StudentTakeQuiz from '../pages/Student/TakeQuiz';
import StudentHistory from '../pages/Student/History';
import StudentResult from '../pages/Student/Result';
import StudentPersonalInfo from '../pages/Student/PersonalInfo';
import StudentSettings from '../pages/Student/Settings';
import StudentClassGroups from '../pages/Student/ClassGroups';

// Route guards
import RoleRoute from './RoleRoute';

const routeConfig = [
    { path: '/admin', role: 'admin', element: <AdminDashboard /> },
    { path: '/admin/users', role: 'admin', element: <AdminUsers /> },
    { path: '/admin/users/add', role: 'admin', element: <AdminAddUser /> },
    { path: '/admin/users/edit/:id', role: 'admin', element: <AdminEditUser /> },
    { path: '/admin/quizzes', role: 'admin', element: <AdminQuizzes /> },
    { path: '/admin/quizzes/:id', role: 'admin', element: <AdminQuizDetail /> },
    { path: '/admin/questions', role: 'admin', element: <AdminQuestions /> },
    { path: '/admin/questions/:id', role: 'admin', element: <AdminQuestionDetail /> },
    { path: '/admin/subjects', role: 'admin', element: <AdminSubjects /> },
    { path: '/admin/attempts', role: 'admin', element: <AdminAttempts /> },
    { path: '/admin/notifications', role: 'admin', element: <NotificationManagement role="admin" /> },
    { path: '/admin/class-groups', role: 'admin', element: <AdminClassGroups /> },
    { path: '/admin/class-groups/:id', role: 'admin', element: <AdminClassGroupDetail /> },
    { path: '/admin/files', role: 'admin', element: <AdminFiles /> },
    { path: '/teacher', role: 'teacher', element: <TeacherDashboard /> },
    { path: '/teacher/quizzes', role: 'teacher', element: <TeacherMyQuizzes /> },
    { path: '/teacher/questions', role: 'teacher', element: <TeacherQuestionBank /> },
    { path: '/teacher/questions/add', role: 'teacher', element: <TeacherAddQuestion /> },
    { path: '/teacher/questions/import', role: 'teacher', element: <ImportAIQuestions /> },
    { path: '/teacher/questions/edit/:id', role: 'teacher', element: <TeacherEditQuestion /> },
    { path: '/teacher/questions/:id', role: 'teacher', element: <TeacherQuestionDetail /> },
    { path: '/teacher/quizzes/create', role: 'teacher', element: <TeacherQuestionCreate /> },
    { path: '/teacher/quizzes/:id', role: 'teacher', element: <TeacherQuizDetail /> },
    { path: '/teacher/quizzes/:id/stats', role: 'teacher', element: <QuizStats /> },
    { path: '/teacher/quizzes/edit/:id', role: 'teacher', element: <TeacherQuizEdit /> },
    { path: '/teacher/subjects', role: 'teacher', element: <TeacherSubjects /> },
    { path: '/teacher/attempts', role: 'teacher', element: <TeacherAttempts /> },
    { path: '/teacher/notifications', role: 'teacher', element: <NotificationManagement role="teacher" /> },
    { path: '/teacher/class-groups', role: 'teacher', element: <TeacherClassGroups /> },
    { path: '/teacher/class-groups/:id', role: 'teacher', element: <TeacherClassGroupDetail /> },
    { path: '/teacher/files', role: 'teacher', element: <TeacherFiles /> },
    { path: '/student', role: 'student', element: <StudentDashboard /> },
    { path: '/student/quizzes', role: 'student', element: <StudentQuizList /> },
    { path: '/student/quizzes/:id', role: 'student', element: <StudentQuizDetail /> },
    { path: '/student/quizzes/:id/take', role: 'student', element: <StudentTakeQuiz /> },
    { path: '/student/take-quiz/:attemptId', role: 'student', element: <StudentTakeQuiz /> },
    { path: '/student/history', role: 'student', element: <StudentHistory /> },
    { path: '/student/result/:attemptId', role: 'student', element: <StudentResult /> },
    { path: '/student/profile', role: 'student', element: <StudentPersonalInfo /> },
    { path: '/student/settings', role: 'student', element: <StudentSettings /> },
    { path: '/student/notifications', role: 'student', element: <NotificationManagement role="student" /> },
    { path: '/student/class-groups', role: 'student', element: <StudentClassGroups /> },
];

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {routeConfig.map(({ path, role, element }) => (
                <Route
                    key={path}
                    path={path}
                    element={<RoleRoute allowedRole={role}>{element}</RoleRoute>}
                />
            ))}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;
