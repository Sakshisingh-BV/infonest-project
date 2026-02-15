import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import axios from 'axios'; // Isse hum OTP request bhejenge
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        clubId: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Nayi states verification ke liye
    const [otp, setOtp] = useState('');
    const [showOtpField, setShowOtpField] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Pehle ye function OTP bhejega
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        setLoading(true);
        try {
            // Backend ko request bhej rahe hain OTP generate karne ke liye
            const res = await axios.post('http://localhost:8081/api/v1/auth/signup', formData);
            if (res.data === "OTP_SENT") {
                setShowOtpField(true);
                setSuccess('OTP sent to your email! Please verify.');
            }
        } catch (err) {
            setError(err.response?.data || 'Error sending verification code');
        }
        setLoading(false);
    };

    // Ye function OTP verify karke aapka purana signup() call karega
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:8081/api/v1/auth/verify-otp', {
                email: formData.email,
                otp: otp
            });

            if (res.data === "ACCOUNT_CREATED_SUCCESSFULLY") {
                setSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.response?.data || 'Invalid OTP. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <BackButton />
            <div className="auth-card">
                <div className="logo">
                    <h1>{showOtpField ? 'Verify Your Email' : 'Create your account to get started'}</h1>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {!showOtpField ? (
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@banasthali.in or @gmail.com"
                                required
                            />
                            <p className="password-hint">Only @banasthali.in or @gmail.com emails allowed</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="STUDENT">Student</option>
                                <option value="FACULTY">Faculty / Club Official</option>
                                <option value="OFFICE">Office</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min 8 chars, 1 uppercase, 1 special"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <p className="password-hint">Min 8 characters, 1 uppercase, 1 special character</p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Re-enter password"
                                required
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Get Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label htmlFor="otp">Enter 6-Digit OTP</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="000000"
                                required
                            />
                            <p className="password-hint">Check your email for the code</p>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Create Account'}
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn-link" 
                            onClick={() => setShowOtpField(false)}
                            style={{marginTop: '15px', width: '100%', background: 'none', border: 'none', color: '#666', cursor: 'pointer'}}
                        >
                            Back to Signup Details
                        </button>
                    </form>
                )}

                <div className="divider">
                    <span>or</span>
                </div>

                <div className="links">
                    <p>Already have an account? <Link to="/login">Sign In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;