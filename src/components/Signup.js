import React, { useState } from 'react';
import axios from 'axios';
import '../Styles/Login.css';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [rollNumber, setRollNumber] = useState('');
    const [department, setDepartment] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/register`, {
                rollNumber,
                department,
                fullName,
                email,
                password,
            });
            if(response){
                navigate('/login');
            }else{
                alert('Signup failed');
            }
        } catch (error) {
            console.error('Signup failed:', error.message);
            alert('Signup failed.');
        }
    };

    return (
        <div className="signup-container">
            <form onSubmit={handleSignup} id="form">

            <input
                    type="text"
                    placeholder="Full Name"
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            <input
                    type="email"
                    placeholder=" Institute Email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Roll Number"
                    id="rollNumber"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                />
                
                <input
                    type="text"
                    placeholder="Department"
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className=" my-3" type="submit">Signup</button>
            </form>
        </div>
    );
}

export default Signup;
