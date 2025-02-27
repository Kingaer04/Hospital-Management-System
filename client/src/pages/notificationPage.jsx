import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

export default function NotificationPage() {
    const [messages, setMessages] = useState([]);
    const navigate = useNavigate();

    // Sample data for notifications
    useEffect(() => {
        // Fetch or simulate fetching notifications
        const fetchedMessages = [
            {
                id: 1,
                title: "New Patient Incoming",
                body: "A new patient has arrived for your attention. Please check their information.",
                receptionistImage: "https://th.bing.com/th/id/OIP.kJcXCsX-f8VI5hhuIl9ljgHaHa?w=166&h=180&c=7&r=0&o=5&pid=1.7",
                patientImage: "https://th.bing.com/th?q=Draw+Person&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-WW&cc=NG&setlang=en&adlt=moderate&t=1&mw=247",
                timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            },
            {
                id: 2,
                title: "Appointment Reminder",
                body: "Don't forget your appointment with Dr. Smith tomorrow at 10 AM.",
                receptionistImage: "https://th.bing.com/th/id/OIP.QAY8zJIk3VkCfwdfxr4ilAHaJb?w=184&h=235&c=7&r=0&o=5&pid=1.7",
                patientImage: "https://th.bing.com/th/id/OIP.T9JAjD62Bdbaqn5nyyPjwAHaHa?w=184&h=184&c=7&r=0&o=5&pid=1.7",
                timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
            },
            // Add more notifications as needed
        ];
        setMessages(fetchedMessages);
    }, []);

    const handleNotificationClick = (id) => {
        // Navigate to the detailed notification page
        navigate(`/notification-body`);
    };

    const timeAgo = (timestamp) => {
        const now = new Date();
        const seconds = Math.floor((now - timestamp) / 1000);
        let interval = Math.floor(seconds / 31536000);

        if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
        return 'Less than a minute ago';
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-5">Notifications</h1>
            <div className="space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className="flex items-center p-4 border rounded-lg shadow hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleNotificationClick(message.id)}
                    >
                        <img
                            src={message.receptionistImage}
                            alt="Receptionist"
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <div className="flex-1">
                            <h2 className="font-semibold">{message.title}</h2>
                            <p className="text-gray-600">
                                {message.body.length > 30
                                    ? `${message.body.substring(0, 30)}...`
                                    : message.body}
                            </p>
                            <p className="text-gray-500 text-sm">{timeAgo(message.timestamp)}</p>
                        </div>
                        <img
                            src={message.patientImage}
                            alt="Patient"
                            className="w-12 h-12 rounded-full ml-4"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}