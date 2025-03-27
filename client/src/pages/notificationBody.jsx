import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock, User, Mail, Phone } from "lucide-react";
import { useSelector } from "react-redux"

export default function NotificationDetail() {
    const { currentUser } = useSelector((state) => state.user)
    const navigate = useNavigate();
    const {id} = useParams();
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        const fetchNotificationData = async () => {
            try {
                const res = await fetch(`http://localhost:3000/notification/notificationData/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await res.json();
                console.log(data);
                setNotification(data);
            } catch (error) {
                console.error("Error fetching notification:", error);
            }
        }
        // console.log(notification.patient.id)
        fetchNotificationData();
    }, []);

    const handlePatientClick = async () => {
        try {
            // Update availability status to false
            const response = await fetch('/recep-patient/update-availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    doctorId: currentUser._id,
                    availability_Status: false 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update availability status');
            }

            // Navigate to patient's medical record
            navigate(`/medical-record/${notification.patient.id}`);
        } catch (error) {
            console.error("Error updating availability status:", error);
            // Optionally show an error notification to the user
            alert('Could not update status. Please try again.');
        }
    };

    if (!notification) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-pulse text-xl text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
                {/* Receptionist Header */}
                <div className="bg-gradient-to-r from-[#00A272] to-[#02583f] p-6 flex items-center space-x-4">
                    <img
                        src={notification.receptionist.image || '/Icons/default-image.jpeg'}
                        alt="Receptionist"
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                    <div>
                        <h2 className="text-xl font-bold text-white">{notification.receptionist.name}</h2>
                        <p className="text-white text-opacity-80">{notification.receptionist.role}</p>
                        <div className="flex items-center text-white text-opacity-70 mt-1">
                            <Clock size={16} className="mr-2" />
                            <span className="text-sm">
                                {new Date(notification.timestamp).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notification Content */}
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{notification.title}</h1>
                    <p className="text-gray-600 mb-6 leading-relaxed italic">A new patient has arrived for your attention. Please check their information.</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{notification.body}</p>

                    {/* Patient Details */}
                    <div 
                        className="bg-gray-100 rounded-xl p-5 cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        onClick={handlePatientClick}
                    >
                        <div className="flex items-center space-x-4">
                            <img
                                src={notification.patient.image}
                                alt="Patient"
                                className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                            />
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <User size={20} className="mr-2 text-blue-500" />
                                    {notification.patient.name}
                                </h2>
                                <p className="text-gray-600 flex items-center mt-1">
                                    <Mail size={16} className="mr-2 text-green-500" />
                                    {notification.patient.email}
                                </p>
                                <p className="text-gray-600 flex items-center mt-1">
                                    <Phone size={16} className="mr-2 text-purple-500" />
                                    {notification.patient.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}