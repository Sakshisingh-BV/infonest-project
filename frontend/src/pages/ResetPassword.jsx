import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // URL se token nikal raha hai
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            // Data ko ek object ke roop mein bhejien
            await axios.post(`http://localhost:8081/api/auth/reset-password`, {
                token: token, // URL parameters se liya gaya token
                newPassword: newPassword // Input field se liya gaya password
            });
            alert("Password updated successfully!");
        } catch (error) {
            console.error("Error details:", error.response.data);
            alert("Reset failed: " + (error.response?.data || "Server error"));
        }
    };

    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h2>Create New Password</h2>
            <form onSubmit={handleReset}>
                <input 
                    type="password" 
                    placeholder="Enter new password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required 
                />
                <button type="submit">Update Password</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;