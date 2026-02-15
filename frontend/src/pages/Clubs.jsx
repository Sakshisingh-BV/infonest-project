import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clubsAPI, eventsAPI, studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import './Clubs.css';

const Clubs = () => {
    const { clubId } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [selectedClub, setSelectedClub] = useState(null);
    const [clubEvents, setClubEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (clubId) {
            fetchClubDetails(clubId);
        } else {
            fetchData();
        }
    }, [clubId, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clubsRes, eventsRes] = await Promise.all([
                clubsAPI.getAllClubs(),
                eventsAPI.getUpcomingEvents()
            ]);
            setClubs(clubsRes.data);
            setEvents(eventsRes.data);

            if (isAuthenticated && user?.userId) {
                const regsRes = await studentAPI.getMyRegistrations(user.userId);
                setRegistrations(regsRes.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClubDetails = async (id) => {
        setLoading(true);
        try {
            const [detailsRes, eventsRes] = await Promise.all([
                clubsAPI.getClubDetails(id),
                eventsAPI.getEventsByClubId(id)
            ]);
            setSelectedClub(detailsRes.data.club || detailsRes.data);
            setClubEvents(eventsRes.data);

            if (isAuthenticated && user?.userId) {
                const regsRes = await studentAPI.getMyRegistrations(user.userId);
                setRegistrations(regsRes.data);
            }
        } catch (err) {
            console.error('Error fetching club details:', err);
        } finally {
            setLoading(false);
        }
    };

    const isRegistered = (eventId) => {
        return registrations.some(reg => reg.eventId === eventId);
    };

    const handleRegister = async (event) => {
        // If not authenticated, save intent and redirect to login
        if (!isAuthenticated) {
            sessionStorage.setItem('pendingRegistration', JSON.stringify({
                eventId: event.eventId,
                eventName: event.eventName,
                registrationFormLink: event.registrationFormLink || 'club_form_link'
            }));
            navigate('/login');
            return;
        }

        // FLOW A: Internal Form (club_form_link or no link)
        if (!event.registrationFormLink || event.registrationFormLink === 'club_form_link') {
            sessionStorage.setItem('pendingRegistration', JSON.stringify({
                eventId: event.eventId,
                eventName: event.eventName,
                registrationFormLink: 'club_form_link'
            }));
            navigate('/club-form');
            return;
        }

        // FLOW B: External Link - Register first, then redirect
        try {
            const registration = { userId: user.userId, eventId: event.eventId };
            await studentAPI.registerForEvent(registration);

            setMessage({ type: 'success', text: `Registered! Opening external form...` });
            window.open(event.registrationFormLink, '_blank');

            // Refresh registrations
            const regsRes = await studentAPI.getMyRegistrations(user.userId);
            setRegistrations(regsRes.data);
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Registration failed';
            setMessage({ type: 'error', text: errorMsg });
        }
    };

    if (loading) {
        return (
            <div className="clubs-page">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Individual Club Detail View
    if (clubId && selectedClub) {
        return (
            <div className="clubs-page">
                <Link to="/clubs" className="back-link">← Back to Clubs</Link>

                <div className="club-detail card">
                    <h1>{selectedClub.clubName}</h1>
                    <p className="club-id">Club ID: {selectedClub.clubId}</p>
                    {selectedClub.description && (
                        <p className="club-description">{selectedClub.description}</p>
                    )}
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                <h2 className="section-title">📅 Club Events</h2>
                <div className="events-grid">
                    {clubEvents.length > 0 ? (
                        clubEvents.map(event => (
                            <div key={event.eventId} className="event-card">
                                <div className="event-header">
                                    <h3>{event.eventName}</h3>
                                </div>
                                <div className="event-body">
                                    <p>{event.description || 'No description available.'}</p>
                                    <div className="event-meta">
                                        <span>📅 {event.eventDate || 'TBD'}</span>
                                        <span>⏰ {event.eventTime || 'TBD'}</span>
                                        <span>📍 {event.venueId || 'TBD'}</span>
                                    </div>
                                    {event.deadline && (
                                        <div className="event-meta">
                                            <span>⏳ Deadline: {event.deadline}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="event-footer">
                                    {isRegistered(event.eventId) ? (
                                        <span className="status-badge status-applied">✓ Registered</span>
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleRegister(event)}
                                        >
                                            Register Now →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="event-card">
                            <div className="event-body"><p>No events for this club yet.</p></div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Main Clubs Page with Tabs
    return (
        <div className="clubs-page">
            <BackButton />
            <header className="page-header card">
                <h1>🏢 Clubs & Events</h1>
            </header>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
                    onClick={() => setActiveTab('events')}
                >
                    📅 Upcoming Events
                </button>
                <button
                    className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clubs')}
                >
                    🏢 All Clubs
                </button>
            </div>

            {/* Upcoming Events Tab */}
            {activeTab === 'events' && (
                <div className="tab-content">
                    <div className="events-grid">
                        {events.length > 0 ? (
                            events.map(event => (
                                <div key={event.eventId} className="event-card">
                                    <div className="event-header">
                                        <h3>{event.eventName}</h3>
                                        <Link to={`/clubs/${event.clubId}`} className="club-link">
                                            {event.clubId}
                                        </Link>
                                    </div>
                                    <div className="event-body">
                                        <p>{event.description || 'No description available.'}</p>
                                        <div className="event-meta">
                                            <span>📅 {event.eventDate || 'TBD'}</span>
                                            <span>⏰ {event.eventTime || 'TBD'}</span>
                                            <span>📍 {event.venueId || 'TBD'}</span>
                                        </div>
                                        {event.deadline && (
                                            <div className="event-meta">
                                                <span>⏳ Deadline: {event.deadline}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="event-footer">
                                        {isRegistered(event.eventId) ? (
                                            <span className="status-badge status-applied">✓ Registered</span>
                                        ) : (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleRegister(event)}
                                            >
                                                Register Now →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="event-card">
                                <div className="event-body"><p>No upcoming events.</p></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* All Clubs Tab - No descriptions, just names */}
            {activeTab === 'clubs' && (
                <div className="tab-content">
                    <div className="clubs-grid">
                        {clubs.length > 0 ? (
                            clubs.map(club => (
                                <Link
                                    key={club.clubId}
                                    to={`/clubs/${club.clubId}`}
                                    className="club-card"
                                >
                                    <h3>{club.clubName}</h3>
                                </Link>
                            ))
                        ) : (
                            <div className="club-card">
                                <p>No clubs found.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clubs;
