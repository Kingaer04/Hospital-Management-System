import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom'; // to keep component private and the are components

export default function PrivateRoute() {
    const { currentUser } = useSelector(state => state.user);
    const { currentAdmin } = useSelector(state => state.admin);

    // Check if either currentUser or currentAdmin is present
    return currentUser || currentAdmin ? <Outlet /> : <Navigate to='/Sign-In' />;
}