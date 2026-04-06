import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null; // or a spinner component

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
