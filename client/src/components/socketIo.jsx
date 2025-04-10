import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';

const useSocketConnection = () => {
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser?._id) return;

    // Create socket connection
    const socket = io('http://localhost:8000', {
      withCredentials: true,
    });

    // Register user with socket
    socket.emit('register_user', {
      _id: currentUser._id,
      hospital_ID: currentUser.hospital_ID,
    });

    // Make socket available globally for components that need it
    window.socket = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      window.socket = null;
    };
  }, [currentUser]);

  return null; // This hook doesn't render anything
};

export default useSocketConnection;
