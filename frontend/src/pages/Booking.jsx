import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { venueAPI } from '../services/api';
import BackButton from '../components/BackButton';
import MyBookingsCalendar from '../components/MyBookingsCalendar';
import './Booking.css';

/* ── Small icon components (no extra lib needed) ── */
const Icon = ({ d, size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);

const ICONS = {
    search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
    clock:    "M12 2a10 10 0 1 1 0 20A10 10 0 0 1 12 2zM12 6v6l4 2",
    users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    check:    "M20 6L9 17l-5-5",
    map:      "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
    tag:      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
};

const Booking = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=form, 2=venues
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [availableVenues, setAvailableVenues] = useState([]);
    const [activeSection, setActiveSection] = useState('book'); // 'book' | 'calendar'

    const [bookingForm, setBookingForm] = useState({
        name: '', type: '', date: '', capacity: '', time: '', endTime: ''
    });

    const canBook = user && ['FACULTY', 'ADMIN', 'OFFICE'].includes(user.role);

    const set = (field) => (e) => setBookingForm(f => ({ ...f, [field]: e.target.value }));

    const handleSearchVenues = async () => {
        const { name, type, date, capacity, time, endTime } = bookingForm;
        if (!name || !type || !date || !capacity || !time || !endTime) {
            setMessage({ type: 'error', text: 'Please fill in all fields before searching.' });
            return;
        }
        if (endTime <= time) {
            setMessage({ type: 'error', text: 'End time must be after start time.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await venueAPI.searchAvailable(date, time, endTime, parseInt(capacity));
            setAvailableVenues(res.data);
            setStep(2);
            if (res.data.length === 0)
                setMessage({ type: 'error', text: 'No venues available for the selected slot.' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to search venues.' });
        }
        setLoading(false);
    };

    const handleBookVenue = async () => {
        if (!selectedVenue) { setMessage({ type: 'error', text: 'Please select a venue.' }); return; }
        const venue = availableVenues.find(v => v.venueId === selectedVenue);
        setLoading(true);
        try {
            const res = await venueAPI.bookVenue({
                venueId: selectedVenue,
                bookingDate: bookingForm.date,
                startTime: bookingForm.time,
                endTime: bookingForm.endTime,
                purpose: bookingForm.type,
                bookingType: bookingForm.type === 'Classroom' ? 'CLASSROOM' : 'EVENT',
                eventName: bookingForm.name,
            });
            setMessage({ type: 'success', text: res.data.message || `${venue?.name} booked successfully!` });
            setSelectedVenue(null);
            setStep(1);
            setAvailableVenues([]);
            setBookingForm({ name: '', type: '', date: '', capacity: '', time: '', endTime: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to book venue.' });
        }
        setLoading(false);
    };

    /* ── Not logged in ── */
    if (!isAuthenticated) {
        return (
            <div className="bk-page">
                <BackButton />
                <div className="bk-center">
                    <div className="bk-login-card">
                        <div className="bk-login-icon">🔐</div>
                        <h2>Login Required</h2>
                        <p>Please sign in to access venue booking.</p>
                        <button className="bk-btn bk-btn-primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bk-page">
            <BackButton />

            <div className="bk-container">

                {/* ── Page header ── */}
                <header className="bk-header">
                    <div className="bk-header-text">
                        <h1>Venue Booking</h1>
                        <p>Reserve classrooms and event spaces for your activities</p>
                    </div>
                    {/* section toggle */}
                    <div className="bk-toggle">
                        <button
                            className={`bk-toggle-btn${activeSection === 'book' ? ' bk-toggle-active' : ''}`}
                            onClick={() => setActiveSection('book')}
                        >
                            Book a Venue
                        </button>
                        <button
                            className={`bk-toggle-btn${activeSection === 'calendar' ? ' bk-toggle-active' : ''}`}
                            onClick={() => setActiveSection('calendar')}
                        >
                            View Calendar
                        </button>
                    </div>
                </header>

                {/* ── Alert ── */}
                {message.text && (
                    <div className={`bk-alert bk-alert-${message.type}`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                {/* ── Access denied ── */}
                {!canBook && (
                    <div className="bk-card bk-access-denied">
                        <Icon d={ICONS.lock} size={28} />
                        <h3>Access Restricted</h3>
                        <p>Only Faculty, Admin, and Office staff can book venues.</p>
                    </div>
                )}

                {/* ── Calendar section ── */}
                {canBook && activeSection === 'calendar' && (
                    <div className="bk-card">
                        <div className="bk-card-header">
                            <Icon d={ICONS.calendar} />
                            <div>
                                <h3>Booking Calendar</h3>
                                <p>View all existing venue bookings</p>
                            </div>
                        </div>
                        <MyBookingsCalendar />
                    </div>
                )}

                {/* ── Booking section ── */}
                {canBook && activeSection === 'book' && (
                    <>
                        {/* Step indicator */}
                        <div className="bk-steps">
                            <div className={`bk-step${step >= 1 ? ' bk-step-done' : ''}`}>
                                <div className="bk-step-circle">
                                    {step > 1 ? <Icon d={ICONS.check} size={14} /> : '1'}
                                </div>
                                <span>Fill Details</span>
                            </div>
                            <div className="bk-step-line" />
                            <div className={`bk-step${step >= 2 ? ' bk-step-done' : ''}`}>
                                <div className="bk-step-circle">2</div>
                                <span>Choose Venue</span>
                            </div>
                            <div className="bk-step-line" />
                            <div className="bk-step">
                                <div className="bk-step-circle">3</div>
                                <span>Confirm</span>
                            </div>
                        </div>

                        {/* ── STEP 1: Form ── */}
                        {step === 1 && (
                            <div className="bk-card">
                                <div className="bk-card-header">
                                    <Icon d={ICONS.tag} />
                                    <div>
                                        <h3>Booking Details</h3>
                                        <p>Tell us about your event to find matching venues</p>
                                    </div>
                                </div>

                                <div className="bk-section-label">Event Information</div>
                                <div className="bk-form-grid">
                                    <div className="bk-field">
                                        <label>Event / Purpose Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Hackathon 2026, Extra Class"
                                            value={bookingForm.name}
                                            onChange={set('name')}
                                        />
                                    </div>
                                    <div className="bk-field">
                                        <label>Booking Type</label>
                                        <select value={bookingForm.type} onChange={set('type')}>
                                            <option value="">Select a type…</option>
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

                                <div className="bk-section-label">Schedule</div>
                                <div className="bk-form-grid bk-form-grid-3">
                                    <div className="bk-field">
                                        <label>Date</label>
                                        <input type="date" value={bookingForm.date} onChange={set('date')} />
                                    </div>
                                    <div className="bk-field">
                                        <label>Start Time</label>
                                        <input type="time" value={bookingForm.time} onChange={set('time')} />
                                    </div>
                                    <div className="bk-field">
                                        <label>End Time</label>
                                        <input type="time" value={bookingForm.endTime} onChange={set('endTime')} />
                                    </div>
                                </div>

                                <div className="bk-section-label">Capacity</div>
                                <div className="bk-form-grid bk-form-grid-half">
                                    <div className="bk-field">
                                        <label>Expected Attendees</label>
                                        <input
                                            type="number"
                                            placeholder="e.g., 80"
                                            min="1"
                                            value={bookingForm.capacity}
                                            onChange={set('capacity')}
                                        />
                                    </div>
                                </div>

                                <div className="bk-form-footer">
                                    <button
                                        className="bk-btn bk-btn-primary"
                                        onClick={handleSearchVenues}
                                        disabled={loading}
                                    >
                                        {loading
                                            ? <><span className="bk-spinner" /> Searching…</>
                                            : <><Icon d={ICONS.search} size={16} /> Search Available Venues</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Venue picker ── */}
                        {step === 2 && (
                            <div className="bk-card">
                                {/* booking summary pill */}
                                <div className="bk-summary-bar">
                                    <span className="bk-pill"><Icon d={ICONS.tag} size={13} /> {bookingForm.name}</span>
                                    <span className="bk-pill"><Icon d={ICONS.calendar} size={13} /> {bookingForm.date}</span>
                                    <span className="bk-pill"><Icon d={ICONS.clock} size={13} /> {bookingForm.time} – {bookingForm.endTime}</span>
                                    <span className="bk-pill"><Icon d={ICONS.users} size={13} /> {bookingForm.capacity} pax</span>
                                    <button className="bk-pill bk-pill-edit" onClick={() => setStep(1)}>← Edit</button>
                                </div>

                                <div className="bk-card-header" style={{ marginTop: '1.25rem' }}>
                                    <Icon d={ICONS.map} />
                                    <div>
                                        <h3>Available Venues</h3>
                                        <p>{availableVenues.length} venue{availableVenues.length !== 1 ? 's' : ''} found — select one to continue</p>
                                    </div>
                                </div>

                                <div className="bk-venues-grid">
                                    {availableVenues.map((venue, i) => {
                                        const isSelected = selectedVenue === venue.venueId;
                                        return (
                                            <div
                                                key={venue.venueId}
                                                className={`bk-venue-card${isSelected ? ' bk-venue-card--selected' : ''}`}
                                                style={{ animationDelay: `${i * 55}ms` }}
                                                onClick={() => setSelectedVenue(venue.venueId)}
                                            >
                                                <div className="bk-venue-check">
                                                    {isSelected && <Icon d={ICONS.check} size={13} />}
                                                </div>
                                                <div className="bk-venue-body">
                                                    <h4>{venue.name}</h4>
                                                    <span className="bk-venue-type">{venue.type}</span>
                                                    <div className="bk-venue-meta">
                                                        <span><Icon d={ICONS.users} size={13} /> {venue.capacity}</span>
                                                        {venue.location && <span><Icon d={ICONS.map} size={13} /> {venue.location}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bk-form-footer bk-form-footer-row">
                                    <button className="bk-btn bk-btn-ghost" onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button
                                        className="bk-btn bk-btn-primary"
                                        onClick={handleBookVenue}
                                        disabled={!selectedVenue || loading}
                                    >
                                        {loading
                                            ? <><span className="bk-spinner" /> Booking…</>
                                            : <><Icon d={ICONS.check} size={16} /> Confirm Booking</>
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Booking;