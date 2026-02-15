import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Backend API call
            const response = await axios.post(`http://localhost:8081/api/auth/forgot-password?email=${email}`);
            setMessage("Reset link sent! Check your email.");
        } catch (error) {
            setMessage("Error: User not found or server issue.");
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <button type="submit">Send Reset Link</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword;