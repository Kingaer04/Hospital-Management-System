import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
    const { currentUser } = useSelector(state => state.user);
    const { currentAdmin } = useSelector(state => state.admin);

    // Check if either currentUser or currentAdmin is present
    const isAuthenticated = currentUser || currentAdmin;

    return isAuthenticated ? (
        <Outlet /> // Allow access to the protected route
    ) : (
        <Navigate to='/Staff-SignIn' /> // Redirect to Sign-In if not authenticated
    );
}
