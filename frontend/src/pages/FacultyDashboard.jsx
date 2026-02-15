import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { facultyAPI, studentAPI, eventsAPI, venueAPI } from '../services/api';
import BackButton from '../components/BackButton';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
    const { user, logout } = useAuth();
    const [club, setClub] = useState(null);
    const [events, setEvents] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [myRegistrations, setMyRegistrations] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingSubmission, setViewingSubmission] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [searchEventName, setSearchEventName] = useState('');

    const [eventForm, setEventForm] = useState({
        eventName: '', description: '', venueId: '',
        eventDate: '', eventTime: '', deadline: '', registrationFormLink: ''
    });

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clubRes, eventsRes, allEventsRes] = await Promise.all([
                facultyAPI.getMyClub(),
                facultyAPI.getMyEvents(),
                eventsAPI.getAllEvents()
            ]);
            setClub(clubRes.data);
            setEvents(eventsRes.data);
            setAllEvents(allEventsRes.data);

            if (clubRes.data?.clubId) {
                const subsRes = await facultyAPI.getSubmissions(clubRes.data.clubId);
                setSubmissions(subsRes.data);
            }

            if (user?.userId) {
                const regsRes = await studentAPI.getMyRegistrations(user.userId);
                setMyRegistrations(regsRes.data);
            }
        } catch (err) {
            console.error('Error fetching club/events:', err);
        }

        // Fetch venue bookings independently — should always run
        try {
            const bookingsRes = await venueAPI.getMyBookings();
            setMyBookings(bookingsRes.data);
        } catch (e) {
            console.error('Error fetching bookings:', e);
        }

        setLoading(false);
    };

    const resetForm = () => {
        setEventForm({
            eventName: '', description: '', venueId: '',
            eventDate: '', eventTime: '', deadline: '', registrationFormLink: ''
        });
        setEditingEvent(null);
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await facultyAPI.addEvent({ ...eventForm, clubId: club.clubId });
            setMessage({ type: 'success', text: 'Event added successfully!' });
            setShowAddModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to add event' });
        }
    };

    const fetchEventForUpdate = async () => {
        if (!searchEventName.trim()) return;
        try {
            const res = await facultyAPI.getEventDetails(club.clubId, searchEventName);
            setEditingEvent(res.data);
            setEventForm({
                eventName: res.data.eventName || '',
                description: res.data.description || '',
                venueId: res.data.venueId || '',
                eventDate: res.data.eventDate || '',
                eventTime: res.data.eventTime || '',
                deadline: res.data.deadline || '',
                registrationFormLink: res.data.registrationFormLink || ''
            });
            setMessage({ type: '', text: '' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Event not found' });
        }
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        if (!editingEvent) return;
        try {
            await facultyAPI.updateEvent(editingEvent.eventId, eventForm);
            setMessage({ type: 'success', text: 'Event updated!' });
            setShowUpdateModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to update' });
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Delete this event?')) return;
        try {
            await facultyAPI.deleteEvent(eventId);
            setMessage({ type: 'success', text: 'Event deleted!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to delete' });
        }
    };

    const handleStatusUpdate = async (regId, status) => {
        try {
            await facultyAPI.updateRegistrationStatus(regId, status);
            setMessage({ type: 'success', text: `Status updated to ${status}` });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to update' });
        }
    };

    const updateClubDescription = async () => {
        const desc = document.getElementById('clubDescription').value;
        try {
            await facultyAPI.updateClubDescription(desc);
            setMessage({ type: 'success', text: 'Description saved!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to save' });
        }
    };

    const getEventName = (eventId) => {
        const event = allEvents.find(e => e.eventId === eventId);
        return event?.eventName || `Event #${eventId}`;
    };

    // Parse form data JSON safely
    const parseFormData = (formData) => {
        if (!formData) return null;
        try {
            return JSON.parse(formData);
        } catch {
            return null;
        }
    };

    // Open view modal for a submission
    const openViewModal = (submission) => {
        setViewingSubmission(submission);
        setShowViewModal(true);
    };

    // Handle approve/reject from modal
    const handleStatusFromModal = async (status) => {
        if (!viewingSubmission) return;
        await handleStatusUpdate(viewingSubmission.regId, status);
        setShowViewModal(false);
        setViewingSubmission(null);
    };

    const showTab = (tabName) => {
        setActiveTab(tabName);
        if (tabName === 'submissions' || tabName === 'bookings') fetchData();
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Cancel this booking?')) return;
        try {
            await venueAPI.cancelBooking(bookingId);
            setMessage({ type: 'success', text: 'Booking cancelled!' }); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to cancel' });
        }
    };

    if (loading) {
        return <div className="faculty-dashboard"><div className="loading-container"><div className="loader"></div></div></div>;
    }

    return (
        <div className="faculty-dashboard">
            <BackButton />
            <header className="dashboard-header card">
                <div className="header-info">
                    <h1>👨‍🏫 Club Official Dashboard</h1>
                    <span className="club-badge">{club?.clubId || 'No Club'}</span>
                </div>
                <div className="header-actions">
                    <Link to="/events" className="btn btn-secondary">🔍 Browse Events</Link>
                    <button className="btn btn-danger" onClick={logout}>Logout</button>
                </div>
            </header>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => showTab('events')}>
                    📅 My Events
                </button>
                <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => showTab('submissions')}>
                    📋 Submissions
                </button>
                <button className={`tab-btn ${activeTab === 'myregs' ? 'active' : ''}`} onClick={() => showTab('myregs')}>
                    ✅ My Registrations
                </button>
                <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => showTab('settings')}>
                    ⚙️ Club Settings
                </button>
                <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => showTab('bookings')}>
                    📋 My Bookings
                </button>
            </div>

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="card">
                    <h2>📅 Manage Club Events</h2>
                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>➕ Add New Event</button>
                        <button className="btn btn-secondary" onClick={() => { resetForm(); setShowUpdateModal(true); }}>✏️ Update Event</button>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Event Name</th><th>Date</th><th>Deadline</th><th>Reg Link</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {events.length > 0 ? events.map(event => (
                                <tr key={event.eventId}>
                                    <td>{event.eventId}</td>
                                    <td>{event.eventName}</td>
                                    <td>{event.eventDate}</td>
                                    <td>{event.deadline || '-'}</td>
                                    <td>{event.registrationFormLink ? '✓' : 'Internal'}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => handleDeleteEvent(event.eventId)}>Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6">No events. Add one!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
                <div className="card">
                    <h2>📋 Event Submissions</h2>
                    <div className="action-bar">
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh Submissions</button>
                    </div>
                    <table>
                        <thead>
                            <tr><th>User ID</th><th>Event</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {submissions.length > 0 ? submissions.map(sub => (
                                <tr key={sub.regId}>
                                    <td>{sub.userId}</td>
                                    <td>{getEventName(sub.eventId)}</td>
                                    <td>{sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : '-'}</td>
                                    <td><span className={`status-${sub.status?.toLowerCase()}`}>{sub.status}</span></td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => openViewModal(sub)}>👁️ View</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5">No submissions yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* My Registrations Tab */}
            {activeTab === 'myregs' && (
                <div className="card">
                    <h2>✅ My Event Registrations</h2>
                    <table>
                        <thead>
                            <tr><th>Event</th><th>Submitted On</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {myRegistrations.length > 0 ? myRegistrations.map(reg => (
                                <tr key={reg.regId}>
                                    <td>{getEventName(reg.eventId)}</td>
                                    <td>{reg.submissionDate ? new Date(reg.submissionDate).toLocaleDateString() : '-'}</td>
                                    <td><span className={`status-${reg.status?.toLowerCase()}`}>{reg.status}</span></td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3">No registrations.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Club Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card">
                    <h2>⚙️ Club Settings</h2>
                    <div className="form-group">
                        <label>Club Name</label>
                        <input type="text" value={club?.clubName || ''} disabled style={{ opacity: 0.7 }} />
                    </div>
                    <div className="form-group">
                        <label>Club Description</label>
                        <textarea id="clubDescription" rows={6} defaultValue={club?.description || ''} placeholder="Enter your club's description..." />
                    </div>
                    <button className="btn btn-primary" onClick={updateClubDescription}>💾 Save Description</button>
                </div>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="card">
                    <h2>📋 My Venue Bookings</h2>
                    <div className="action-bar">
                        <Link to="/booking" className="btn btn-primary">➕ New Booking</Link>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    <table>
                        <thead>
                            <tr><th>Venue</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {myBookings.length > 0 ? myBookings.map(b => (
                                <tr key={b.bookingId}>
                                    <td>{b.venue?.name || 'N/A'}</td>
                                    <td>{new Date(b.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td>{new Date('1970-01-01T' + b.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date('1970-01-01T' + b.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</td>
                                    <td>{b.purpose}</td>
                                    <td><span className={`status-badge status-${b.status?.toLowerCase()}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'CONFIRMED' && (
                                            <button className="btn btn-danger" onClick={() => handleCancelBooking(b.bookingId)}>Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6">No bookings yet. <Link to="/booking">Book a venue!</Link></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Event Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        <h3>➕ Add New Event</h3>
                        <form onSubmit={handleAddEvent}>
                            <div className="form-group">
                                <label>Event Name *</label>
                                <input value={eventForm.eventName} onChange={e => setEventForm({ ...eventForm, eventName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Event Date</label>
                                    <input type="date" value={eventForm.eventDate} onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Event Time</label>
                                    <input type="time" value={eventForm.eventTime} onChange={e => setEventForm({ ...eventForm, eventTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Venue ID</label>
                                    <input value={eventForm.venueId} onChange={e => setEventForm({ ...eventForm, venueId: e.target.value })} placeholder="e.g., HALL_A" />
                                </div>
                                <div className="form-group">
                                    <label>Registration Deadline</label>
                                    <input type="date" value={eventForm.deadline} onChange={e => setEventForm({ ...eventForm, deadline: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Registration Link</label>
                                <input value={eventForm.registrationFormLink} onChange={e => setEventForm({ ...eventForm, registrationFormLink: e.target.value })} placeholder="URL or leave blank for internal form" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Event</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Event Modal */}
            {showUpdateModal && (
                <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowUpdateModal(false)}>×</button>
                        <h3>✏️ Update Event</h3>
                        <div className="form-group">
                            <label>Search by Event Name</label>
                            <input value={searchEventName} onChange={e => setSearchEventName(e.target.value)} placeholder="Enter exact event name" />
                        </div>
                        <button className="btn btn-secondary" onClick={fetchEventForUpdate}>🔍 Find Event</button>

                        {editingEvent && (
                            <form onSubmit={handleUpdateEvent} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <div className="form-group">
                                    <label>Event Name *</label>
                                    <input value={eventForm.eventName} onChange={e => setEventForm({ ...eventForm, eventName: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} rows={3} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Event Date</label>
                                        <input type="date" value={eventForm.eventDate} onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Event Time</label>
                                        <input type="time" value={eventForm.eventTime} onChange={e => setEventForm({ ...eventForm, eventTime: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Venue ID</label>
                                        <input value={eventForm.venueId} onChange={e => setEventForm({ ...eventForm, venueId: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Registration Deadline</label>
                                        <input type="date" value={eventForm.deadline} onChange={e => setEventForm({ ...eventForm, deadline: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Registration Link</label>
                                    <input value={eventForm.registrationFormLink} onChange={e => setEventForm({ ...eventForm, registrationFormLink: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Update Event</button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* View Submission Modal */}
            {showViewModal && viewingSubmission && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal view-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                        <h3>📋 Submission Details</h3>

                        <div className="submission-info">
                            <div className="info-row">
                                <span className="info-label">Event:</span>
                                <span className="info-value">{getEventName(viewingSubmission.eventId)}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">User ID:</span>
                                <span className="info-value">{viewingSubmission.userId}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Submitted:</span>
                                <span className="info-value">
                                    {viewingSubmission.submissionDate
                                        ? new Date(viewingSubmission.submissionDate).toLocaleString()
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Status:</span>
                                <span className={`status-badge status-${viewingSubmission.status?.toLowerCase()}`}>
                                    {viewingSubmission.status}
                                </span>
                            </div>
                        </div>

                        <div className="form-data-section">
                            <h4>📝 Form Data</h4>
                            {parseFormData(viewingSubmission.formData) ? (
                                <div className="form-data-grid">
                                    {Object.entries(parseFormData(viewingSubmission.formData)).map(([key, value]) => (
                                        <div className="form-data-item" key={key}>
                                            <span className="data-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}:</span>
                                            <span className="data-value">{value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-data">No form data available (external registration)</p>
                            )}
                        </div>

                        {viewingSubmission.status === 'APPLIED' && (
                            <div className="modal-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleStatusFromModal('APPROVED')}
                                >
                                    ✓ Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleStatusFromModal('REJECTED')}
                                >
                                    ✗ Reject
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyDashboard;
