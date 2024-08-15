// src/context/ChatContext.js

import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:8080');
export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        axios.get('http://localhost:8080/api/messages')
            .then((response) => {
                setMessages(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching messages:', error);
            });

        socket.on('newMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        socket.on('deleteMessage', (messageId) => {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== messageId));
        });

        socket.on('editMessage', (updatedMessage) => {
            setMessages((prevMessages) =>
                prevMessages.map((msg) => (msg._id === updatedMessage._id ? updatedMessage : msg))
            );
        });

        return () => {
            socket.off('newMessage');
            socket.off('deleteMessage');
            socket.off('editMessage');
        };
    }, []);

    const sendMessage = (messageContent, replyTo = null) => {
        socket.emit('sendMessage', { message: messageContent, replyTo });
    };

    const editMessage = (messageId, newMessageContent) => {
        socket.emit('editMessage', { messageId, newMessage: newMessageContent });
    };

    const deleteMessage = (messageId) => {
        socket.emit('deleteMessage', { messageId });
    };

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage, editMessage, deleteMessage, theme, isLoading, toggleTheme }}>
            {children}
        </ChatContext.Provider>
    );
};
