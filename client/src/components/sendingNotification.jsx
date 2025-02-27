import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = io('http://localhost:3000');

const SendingNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [message, setMessage] = useState('');

    const sendNotification = () => {
        fetch('http://localhost:3000/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        setMessage('');
    };
    useEffect(() => {
        if (Notification.permission === 'default' || Notification.permission === 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Permission granted!');
                }
                else {
                    console.log('Permission denied!');
                }
            })
            
        }
        socket.on('pushNotification', (data) => {
            console.log("Received Notification", data)

            if(Notification.permission === 'granted') {
                new Notification('Notification', {
                    body: data.message,
                    icon: 'https://via.placeholder.com/50'
                });
            }

            setNotifications((prev) => [...prev, data]);
        });

        return () => {
            socket.off('pushNotification');
        };
    }, []);
    
    return (
        <div>
            <h1>To Doctor</h1>
            <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type your message here" 
            />
            <button onClick={sendNotification}>Send Notification</button>
            <ul>
                {notifications.map((noty, index) => (
                    <li key={index}>{noty.message}</li>
                ))}
            </ul>
        </div>
    );
}

export default SendingNotification;