import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Use Routes instead of Switch
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chatroom from './pages/Chatroom';

function RoutesConfig() {  // Rename to avoid confusion with the Routes component
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/chatroom" element={<Chatroom />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default RoutesConfig;
