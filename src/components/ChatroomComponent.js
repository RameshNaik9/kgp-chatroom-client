import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

function ChatroomComponent() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(JSON.parse(localStorage.getItem('messages')) || []);
    const [isConnected, setIsConnected] = useState(true);
    const [theme, setTheme] = useState('light');
    const socketRef = useRef(null);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io(process.env.REACT_APP_SOCKET_URL, {
                withCredentials: true,
                transports: ['websocket'],
                extraHeaders: {
                    "Access-Control-Allow-Origin": process.env.REACT_APP_CLIENT_URL,
                },
            });
        }

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/chat/history`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setMessages(response.data);
                localStorage.setItem('messages', JSON.stringify(response.data));
            } catch (error) {
                console.error('Error fetching messages:', error.message);
                setIsConnected(false);
            }
        };

        if (isConnected) {
            fetchMessages();
        }

        socketRef.current.on('newChatMessage', (msg) => {
            setMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, msg];
                localStorage.setItem('messages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
        });

        socketRef.current.on('messageStatusUpdate', (update) => {
            setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map((m) =>
                    m.localId === update.localId ? { ...m, status: update.status } : m
                );
                localStorage.setItem('messages', JSON.stringify(updatedMessages));
                return updatedMessages;
            });
        });

        socketRef.current.on('connect', () => setIsConnected(true));
        socketRef.current.on('disconnect', () => setIsConnected(false));

        return () => {
            socketRef.current.disconnect();
        };
    }, [isConnected]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;

        const localId = `${new Date().getTime()}-${Math.random()}`;

        const newMessage = {
            user: {
                _id: userId,
                fullName: decodedToken.fullName,
            },
            message,
            localId,
            status: 'sending',
        };

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            localStorage.setItem('messages', JSON.stringify(updatedMessages));
            return updatedMessages;
        });

        socketRef.current.emit('chatMessage', { userId, message, localId }, (response) => {
            if (response.status !== 'ok') {
                setMessages((prevMessages) => {
                    const updatedMessages = prevMessages.map((m) =>
                        m.localId === localId ? { ...m, status: 'failed' } : m
                    );
                    localStorage.setItem('messages', JSON.stringify(updatedMessages));
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
            {!isConnected && (
                <div className="overlay d-flex">
                    <div className="overlay-content">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p>Connecting to server...</p>
                    </div>
                </div>
            )}
            <div className={`messages p-3 ${!isConnected ? 'blur' : ''}`} style={{ height: '70vh', overflowY: 'scroll' }}>
                {messages.map((msg, index) => {
                    const token = localStorage.getItem('token');
                    const decodedToken = JSON.parse(atob(token.split('.')[1]));
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

export default ChatroomComponent;
