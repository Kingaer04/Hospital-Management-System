import React, { useEffect, useState } from 'react';

const Notification = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Allow time for slide-out animation before calling onClose
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow time for slide-out animation before calling onClose
    };

    return (
        <div 
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '16px 24px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 50,
                transition: 'transform 0.5s ease, opacity 0.5s ease',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
                backgroundColor: type === 'success' ? '#4CAF50' : '#F44336', // Green or Red background
            }}
        >
            {message}
            <button 
                onClick={handleClose} 
                style={{
                    marginLeft: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                &times; {/* Close icon */}
            </button>
        </div>
    );
};

export default Notification;