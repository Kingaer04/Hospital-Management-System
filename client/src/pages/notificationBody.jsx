import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

export default function NotificationDetail() {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);

    // Sample data for notifications (in a real app, fetch this from an API)
    const notificationsData = [
        {
            title: "New Patient Incoming",
            body: "A new patient has arrived for your attention. Please check their information.",
            receptionist: {
                name: "Alice Johnson",
                role: "Head Receptionist",
                image: "https://th.bing.com/th/id/OIP.kJcXCsX-f8VI5hhuIl9ljgHaHa?w=166&h=180&c=7&r=0&o=5&pid=1.7",
            },
            patient: {
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "+1234567890",
                image: "https://th.bing.com/th/id/OIP.T9JAjD62Bdbaqn5nyyPjwAHaHa?w=184&h=184&c=7&r=0&o=5&pid=1.7",
            },
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        },
        // Add more notifications as needed
    ];

    useEffect(() => {
        // Assuming we are just displaying the first notification for now
        const foundNotification = notificationsData[0]; // Get the first notification
        setNotification(foundNotification);
    }, []);

    const handlePatientClick = () => {
        // Navigate to the patient's medical record page
        navigate("/patients"); // Navigating to a placeholder route for now
    };

    if (!notification) {
        return <div>Loading...</div>; // Show a loading state while fetching data
    }

    return (
        <div className="p-10">
            <div className="flex items-start mb-5">
                <img
                    src={notification.receptionist.image}
                    alt="Receptionist"
                    className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                    <h2 className="font-bold">{notification.receptionist.name}</h2>
                    <p className="text-gray-500">{notification.receptionist.role}</p>
                    <p className="text-gray-400 text-sm">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">{notification.title}</h1>
            <p className="mb-4">{notification.body}</p>
            <div
                className="flex items-center p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                onClick={handlePatientClick}
            >
                <img
                    src={notification.patient.image}
                    alt="Patient"
                    className="w-16 h-16 rounded-full mr-4"
                />
                <div className="flex-1">
                    <h2 className="font-semibold">{notification.patient.name}</h2>
                    <p className="text-gray-600">{notification.patient.email}</p>
                    <p className="text-gray-600">{notification.patient.phone}</p>
                </div>
            </div>
        </div>
    );
}