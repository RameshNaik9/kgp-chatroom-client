import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';  // Use Routes instead of Switch
import Login from './components/Login';
import Signup from './components/Signup';
import Chatroom from './pages/Chatroom';
import Home from './pages/Home';
function RoutesConfig() {  // Rename to avoid confusion with the Routes component
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/chatroom" element={<Chatroom />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default RoutesConfig;
