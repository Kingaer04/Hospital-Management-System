import React, { createContext, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const playNotificationSound = () => {
        const audio = new Audio("/notification-sound.mp3");
        audio.play().catch(err => console.log("Error playing sound:", err));
    };

    return (
        <NotificationContext.Provider value={{ playNotificationSound }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);