// /src/pages/Chatroom.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function Chatroom() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const socket = io('http://localhost:8080', {
        withCredentials: true,
        extraHeaders: {
            "Access-Control-Allow-Origin": "http://localhost:3000"
        }
    });

    useEffect(() => {
        // Fetch chat history
        const fetchMessages = async () => {
            const response = await axios.get('http://localhost:8080/api/chat/history', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setMessages(response.data);
        };
        fetchMessages();

        // Listen for new messages
        socket.on('chatMessage', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
        const userId = decodedToken.id;

        // Send message to the server
        socket.emit('chatMessage', { userId, message });
        setMessage('');
    };

    return (
        <div className="chatroom-container">
            <h2>Chatroom</h2>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.user.fullName}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Enter your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chatroom;
