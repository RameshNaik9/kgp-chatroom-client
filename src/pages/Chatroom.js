import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function Chatroom() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('messages')) || []);
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [isConnected, setIsConnected] = useState(true); // Connection state
    const [theme, setTheme] = useState('light'); // State for theme
    const socket = io('http://localhost:8080', {
        withCredentials: true,
        transports: ['websocket'],  // Force WebSocket transport
        extraHeaders: {
            "Access-Control-Allow-Origin": "http://localhost:3000"
        }
    });

    useEffect(() => {
        // Fetch chat history
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/chat/history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setMessages(response.data);
                localStorage.setItem('messages', JSON.stringify(response.data)); // Cache messages
                setIsLoading(false); // Successfully loaded messages
            } catch (error) {
                console.error('Error fetching messages:', error.message);
                setIsConnected(false); // Set connection state to false if error occurs
            }
        };

        if (isConnected) {
            fetchMessages();
        }

        // Listen for new messages
        socket.on('chatMessage', (msg) => {
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map(m => m.localId === msg.localId ? { ...m, status: 'delivered' } : m);
                localStorage.setItem('messages', JSON.stringify(updatedMessages)); // Cache updated messages
                return updatedMessages;
            });
        });

        socket.on('connect', () => {
            setIsConnected(true);
            setIsLoading(false);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
        };
    }, [isConnected]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
        const userId = decodedToken.id;

        const localId = `${new Date().getTime()}-${Math.random()}`;

        // Optimistically update UI with a single tick
        const newMessage = {
            user: {
                _id: userId,
                fullName: decodedToken.fullName, // Ensure full name is in the token or manually add it
            },
            message: message,
            localId: localId, // Temporary local ID
            status: 'sending' // Initial status is 'sending'
        };

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            localStorage.setItem('messages', JSON.stringify(updatedMessages)); // Cache updated messages
            return updatedMessages;
        });

        // Send message to the server and handle potential errors
        socket.emit('chatMessage', { userId, message, localId }, (response) => {
            if (response.status === 'ok') {
                // Message delivered successfully, update status
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((m) =>
                        m.localId === localId ? { ...m, status: 'delivered' } : m
                    );
                    localStorage.setItem('messages', JSON.stringify(updatedMessages)); // Cache updated messages
                    return updatedMessages;
                });
            } else {
                // Server responded with an error, mark as failed
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((m) =>
                        m.localId === localId ? { ...m, status: 'failed' } : m
                    );
                    localStorage.setItem('messages', JSON.stringify(updatedMessages)); // Cache updated messages
                    return updatedMessages;
                });
            }
        });

        setMessage('');
    };

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`chatroom-container bg-${theme}`}>
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h2 className="m-0">Chatroom</h2>
                <button className="btn btn-outline-primary" onClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
                </button>
            </div>
            <div className={`overlay ${isConnected ? 'd-none' : 'd-flex'}`}>
                <div className="overlay-content">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Connecting to server...</p>
                </div>
            </div>
            <div className={`messages p-3 ${isLoading ? 'blur' : ''}`} style={{ height: '70vh', overflowY: 'scroll' }}>
                {messages.map((msg, index) => {
                    const token = localStorage.getItem('token');
                    const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode the JWT token
                    const isCurrentUser = msg.user._id === decodedToken.id;
                    return (
                        <div
                            key={index}
                            className={`d-flex flex-column mb-3 ${isCurrentUser ? 'align-items-end' : 'align-items-start'}`}
                        >
                            <div className="small text-muted mb-1">
                                {msg.user.fullName}
                            </div>
                            <div className="d-flex align-items-center">
                                <div className={`p-2 rounded text-white ${isCurrentUser ? 'bg-primary' : 'bg-success'}`}>
                                    {msg.message}
                                </div>
                                {isCurrentUser && (
                                    <span className="message-status ms-2">
                                        {msg.status === 'sending' && '✓'}
                                        {msg.status === 'delivered' && '✓✓'}
                                        {msg.status === 'failed' && (
                                            <>
                                                <span className="text-danger">✗</span>
                                                <div className="text-danger small">Unable to send</div>
                                            </>
                                        )}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-top">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Send</button>
                </div>
            </form>
        </div>
    );
}

export default Chatroom;
