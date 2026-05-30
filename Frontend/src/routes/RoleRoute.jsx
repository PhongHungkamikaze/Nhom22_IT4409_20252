import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedRole, redirectTo = '/login' }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

    const role = user && user.role ? String(user.role).toLowerCase() : '';
    if (role !== allowedRole) return <Navigate to="/" replace />;

    return children;
};

export default RoleRoute;
