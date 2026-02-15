import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import './ClubForm.css';

const ClubForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [eventInfo, setEventInfo] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        college: '',
        branch: '',
        year: '',
        phone: '',
        resumeLink: '',
        message: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Check for pending registration
        const pending = sessionStorage.getItem('pendingRegistration');
        if (!pending) {
            setMessage({ type: 'error', text: 'No event selected. Please select an event first.' });
            setTimeout(() => navigate('/events'), 2000);
            return;
        }

        const pendingData = JSON.parse(pending);
        setEventInfo(pendingData);

        // Pre-fill name if available
        if (user?.firstName) {
            setFormData(prev => ({ ...prev, name: user.firstName + (user.lastName ? ' ' + user.lastName : '') }));
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Step 1: Create registration first
            const registration = {
                userId: user.userId,
                eventId: eventInfo.eventId
            };
            const regResponse = await studentAPI.registerForEvent(registration);
            const regId = regResponse.data.regId;

            // Step 2: Update with form data
            const formDataJson = JSON.stringify(formData);
            await studentAPI.updateFormData(regId, formDataJson);

            // Clear pending registration
            sessionStorage.removeItem('pendingRegistration');

            setMessage({ type: 'success', text: 'Registration successful!' });

            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                if (user?.role === 'ADMIN') navigate('/admin');
                else if (user?.role === 'FACULTY') navigate('/faculty');
                else navigate('/dashboard');
            }, 1500);

        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data || 'Registration failed. Please try again.';
            setMessage({ type: 'error', text: typeof errorMsg === 'string' ? errorMsg : 'Registration failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        sessionStorage.removeItem('pendingRegistration');
        navigate('/events');
    };

    return (
        <div className="club-form-page">
            <BackButton />
            <div className="club-form-container">
                <div className="club-form-card">
                    <h1>📝 Event Registration</h1>
                    {eventInfo && (
                        <p className="event-name">Registering for: <strong>{eventInfo.eventName}</strong></p>
                    )}
                    <p className="form-subtitle">Fill in your details to complete registration</p>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="college">College/Department *</label>
                                <input
                                    type="text"
                                    id="college"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    placeholder="e.g., CSE"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="branch">Branch/Major *</label>
                                <input
                                    type="text"
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Science"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="year">Year of Study *</label>
                                <select
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Your contact number"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="resumeLink">Resume/Portfolio Link (Optional)</label>
                            <input
                                type="url"
                                id="resumeLink"
                                name="resumeLink"
                                value={formData.resumeLink}
                                onChange={handleChange}
                                placeholder="https://your-portfolio.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Why do you want to participate? (Optional)</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Tell us about your interest..."
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Registration'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClubForm;
