import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { venueAPI } from '../services/api';
import BackButton from '../components/BackButton';
import './Booking.css';

const Booking = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [showVenues, setShowVenues] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableVenues, setAvailableVenues] = useState([]);

    // Unified booking form
    const [bookingForm, setBookingForm] = useState({
        name: '',
        type: '',
        date: '',
        capacity: '',
        time: '',
        endTime: ''
    });

    // Role-based access — Student restricted
    const canBook = user && ['FACULTY', 'ADMIN', 'OFFICE'].includes(user.role);



    const handleSearchVenues = async () => {
        const { name, type, date, capacity, time, endTime } = bookingForm;
        if (!name || !type || !date || !capacity || !time || !endTime) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }
        if (endTime <= time) {
            setMessage({ type: 'error', text: 'End time must be after start time' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await venueAPI.searchAvailable(date, time, endTime, parseInt(capacity));
            setAvailableVenues(res.data);
            setShowVenues(true);
            if (res.data.length === 0) {
                setMessage({ type: 'error', text: 'No venues available for the selected time slot' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || 'Failed to search venues' });
        }
        setLoading(false);
    };

    const handleBookVenue = async () => {
        if (!selectedVenue) {
            setMessage({ type: 'error', text: 'Please select a venue' });
            return;
        }

        const venue = availableVenues.find(v => v.venueId === selectedVenue);

        setLoading(true);
        try {
            const bookingData = {
                venueId: selectedVenue,
                bookingDate: bookingForm.date,
                startTime: bookingForm.time,
                endTime: bookingForm.endTime,
                purpose: bookingForm.type,
                bookingType: bookingForm.type === 'Classroom' ? 'CLASSROOM' : 'EVENT',
                eventName: bookingForm.name
            };

            const res = await venueAPI.bookVenue(bookingData);
            setMessage({
                type: 'success',
                text: res.data.message || `✅ ${venue.name} booked successfully!`
            });

            // Reset form
            setSelectedVenue(null);
            setShowVenues(false);
            setAvailableVenues([]);
            setBookingForm({ name: '', type: '', date: '', capacity: '', time: '', endTime: '' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data || 'Failed to book venue'
            });
        }
        setLoading(false);
    };

    // Not logged in
    if (!isAuthenticated) {
        return (
            <div className="booking-page">
                <BackButton />
                <div className="booking-login-required">
                    <div className="login-card">
                        <h2>🔒 Login Required</h2>
                        <p>Please login to book venues</p>
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <BackButton />

            <div className="booking-container">
                <header className="booking-header">
                    <h1>📍 Venue Booking</h1>
                    <p>Book classrooms and event venues for your activities</p>
                </header>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                {/* Booking Form */}
                <div className="booking-content">
                    {!canBook ? (
                        <div className="access-denied card">
                            <h3>🚫 Access Denied</h3>
                            <p>Only Faculty, Admin, and Office can book venues</p>
                        </div>
                    ) : (
                        <>
                            <div className="booking-form card">
                                <h3>Book a Venue</h3>
                                <p className="form-subtitle">Fill in the details to find available venues</p>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Hackathon 2026, Extra Class"
                                            value={bookingForm.name}
                                            onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type</label>
                                        <select
                                            value={bookingForm.type}
                                            onChange={e => setBookingForm({ ...bookingForm, type: e.target.value })}
                                        >
                                            <option value="">Select type</option>
                                            <option value="Classroom">Classroom</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Hackathon">Hackathon</option>
                                            <option value="Competition">Competition</option>
                                            <option value="Seminar">Seminar</option>
                                            <option value="Conference">Conference</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={bookingForm.date}
                                            onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Expected Capacity</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 100"
                                            value={bookingForm.capacity}
                                            onChange={e => setBookingForm({ ...bookingForm, capacity: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            value={bookingForm.time}
                                            onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="time"
                                            value={bookingForm.endTime}
                                            onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-full"
                                    onClick={handleSearchVenues}
                                    disabled={loading}
                                >
                                    {loading ? 'Searching...' : '🔍 Search Available Venues'}
                                </button>
                            </div>

                            {showVenues && (
                                <div className="venues-section card">
                                    <h3>Available Venues</h3>
                                    <p className="form-subtitle">Select a venue to book</p>

                                    <div className="venues-grid">
                                        {availableVenues.map(venue => (
                                            <div
                                                key={venue.venueId}
                                                className={`venue-card ${selectedVenue === venue.venueId ? 'selected' : ''}`}
                                                onClick={() => setSelectedVenue(venue.venueId)}
                                            >
                                                <div className="venue-header">
                                                    <div>
                                                        <h4>{venue.name}</h4>
                                                        <span className="venue-type">{venue.type}</span>
                                                    </div>
                                                    <div className={`venue-checkbox ${selectedVenue === venue.venueId ? 'checked' : ''}`}>
                                                        {selectedVenue === venue.venueId && '✓'}
                                                    </div>
                                                </div>
                                                <p className="venue-capacity">👥 Capacity: {venue.capacity}</p>
                                                {venue.location && <p className="venue-location">📍 {venue.location}</p>}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={handleBookVenue}
                                        disabled={!selectedVenue || loading}
                                    >
                                        {loading ? 'Booking...' : '✓ Confirm Booking'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking;
