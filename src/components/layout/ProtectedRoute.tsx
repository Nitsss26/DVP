import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { currentUser } = useAuth(); // assuming isLoading handled in context or parent

    if (!currentUser) {
        // Redirect to login if not authenticated
        // toast.error("Please login to access this page."); // Toast might cause double render issues, better UI handler
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect to home if unauthorized
        // toast.error("You are not authorized to access this page."); 
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
