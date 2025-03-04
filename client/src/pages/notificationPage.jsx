import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { useNotification } from '../components/notificationSound'; // Import the context

const socket = io("http://localhost:3000");

export default function NotificationPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const { playNotificationSound } = useNotification(); // Use the context

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:3000/notification/doctor-notifications/${currentUser._id}`);
                const data = await response.json();
                if (data.success) {
                    const formattedNotifications = data.notifications.map(notification => ({
                        id: notification._id,
                        title: "New Patient Appointment",
                        body: notification.message,
                        timestamp: new Date(notification.createdAt || Date.now()),
                        Read: notification.Read,
                        patientId: notification.patient_ID,
                        receptionistId: notification.receptionist_ID,
                        receptionistImage: notification.receptionistImage,
                        patientImage: notification.patientImage,
                        patientName: notification.patientName
                    }));
                    
                    setNotifications(formattedNotifications);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser && currentUser._id) {
            fetchNotifications();
            socket.emit("doctor_login", currentUser._id);
            
            socket.on("newNotification", (notification) => {
                if (notification.doctor_ID === currentUser._id) {
                    const formattedNotification = {
                        id: notification._id,
                        title: "New Patient Appointment",
                        body: notification.message,
                        timestamp: new Date(notification.createdAt || Date.now()),
                        Read: notification.Read || false,
                        patientId: notification.patient_ID,
                        receptionistId: notification.receptionist_ID,
                        receptionistImage: notification.receptionistImage,
                        patientImage: notification.patientImage,
                        patientName: notification.patientName
                    };
                    
                    setNotifications(prev => [formattedNotification, ...prev]);

                    // Only play sound if not on NotificationPage
                    if (window.location.pathname !== '/notifications') {
                        playNotificationSound();
                    }
                }
            });
        }
        
        return () => {
            socket.off("newNotification");
        };
    }, [currentUser, playNotificationSound]);

    const handleNotificationClick = async (notification) => {
        if (!notification.Read) {
            try {
                await fetch(`http://localhost:3000/notification/mark-as-read/${notification.id}`, {
                    method: "POST"
                });
                
                setNotifications(notifications.map(notif => 
                    notif.id === notification.id ? { ...notif, Read: true } : notif
                ));
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }
        
        navigate(`/notification-body/${notification.id}`);
    };

    const timeAgo = (timestamp) => {
        const now = new Date();
        const seconds = Math.floor((now - timestamp) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval >= 1) return `${interval} year${interval === 1 ? "" : "s"} ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval === 1 ? "" : "s"} ago`;
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval === 1 ? "" : "s"} ago`;
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval === 1 ? "" : "s"} ago`;
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval === 1 ? "" : "s"} ago`;
        return "Less than a minute ago";
    };

    if (loading) {
        return (
            <div className="p-10 flex justify-center items-center h-64">
                <div className="loader animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-5">Notifications</h1>
            {notifications.length === 0 ? (
                <div className="text-center p-10 text-gray-500">
                    <p>No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`flex items-center p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer ${
                                !notification.Read ? "bg-green-50 border-green-200" : ""
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <img
                                src={notification.receptionistImage}
                                alt="Receptionist"
                                className="w-12 h-12 rounded-full mr-4 object-cover border border-gray-200"
                            />
                            <div className="flex-1">
                                <h2 className={`font-semibold ${!notification.Read ? "text-green-700" : ""}`}>
                                    {notification.title}
                                    {!notification.Read && (
                                        <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                    )}
                                </h2>
                                <p className="text-gray-600">
                                    {notification.body.length > 60
                                        ? `${notification.body.substring(0, 60)}...`
                                        : notification.body}
                                </p>
                                <p className="text-gray-500 text-sm">{timeAgo(notification.timestamp)}</p>
                            </div>
                            <img
                                src={notification.patientImage}
                                alt="Patient"
                                className="w-12 h-12 rounded-full ml-4 object-cover border border-gray-200"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}