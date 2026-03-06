
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, venueAPI } from '../services/api';
import BackButton from '../components/BackButton';
import MyBookingsCalendar from '../components/MyBookingsCalendar';
import ExpandableCardList from '../components/ExpandableCard';
import EventFlipCard from '../components/EventFlipCard';
import './AdminDashboard.css';
import '../components/EventFlipCard.css';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [clubs, setClubs] = useState([]);
    const [events, setEvents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('clubs');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    const [clubForm, setClubForm] = useState({ clubId: '', clubName: '', description: '' });
    const [eventForm, setEventForm] = useState({
        clubId: '', eventName: '', description: '', venueId: '',
        eventDate: '', eventTime: '', deadline: '', registrationFormLink: ''
    });
    const [assignForm, setAssignForm] = useState({ email: '', clubId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clubsRes, eventsRes, facultyRes, bookingsRes] = await Promise.all([
                adminAPI.getAllClubs(),
                adminAPI.getAllEvents(),
                adminAPI.getAllFaculty(),
                venueAPI.getMyBookings()
            ]);
            setClubs(clubsRes.data);
            setEvents(eventsRes.data);
            setFaculty(facultyRes.data);
            setMyBookings(bookingsRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Club CRUD
    const handleClubSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await adminAPI.updateClub(editingItem.clubId, clubForm);
                setMessage({ type: 'success', text: 'Club updated!' });
            } else {
                await adminAPI.addClub(clubForm);
                setMessage({ type: 'success', text: 'Club added!' });
            }
            closeModal(); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    const handleDeleteClub = async (clubId) => {
        if (!confirm('Delete this club?')) return;
        try {
            await adminAPI.deleteClub(clubId);
            setMessage({ type: 'success', text: 'Club deleted!' }); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    // Event CRUD
    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await adminAPI.updateEvent(editingItem.eventId, eventForm);
                setMessage({ type: 'success', text: 'Event updated!' });
            } else {
                await adminAPI.addEvent(eventForm);
                setMessage({ type: 'success', text: 'Event added!' });
            }
            closeModal(); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('Delete this event?')) return;
        try {
            await adminAPI.deleteEvent(eventId);
            setMessage({ type: 'success', text: 'Event deleted!' }); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    const handleToggleVisibility = async (eventId) => {
        try {
            await adminAPI.toggleEventVisibility(eventId);
            setMessage({ type: 'success', text: 'Visibility toggled!' }); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    // Faculty Assignment
    const handleAssignFaculty = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.assignFacultyToClub(assignForm.email, assignForm.clubId);
            setMessage({ type: 'success', text: 'Faculty assigned!' }); closeModal(); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
    };

    const handleRemoveFaculty = async (email) => {
        if (!confirm('Remove faculty from club?')) return;
        try {
            await adminAPI.removeFacultyFromClub(email);
            setMessage({ type: 'success', text: 'Faculty removed!' }); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed' });
        }
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

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        if (type === 'club') {
            setClubForm(item ? { ...item } : { clubId: '', clubName: '', description: '' });
        } else if (type === 'event') {
            setEventForm(item ? { ...item, eventDate: item.eventDate || '', deadline: item.deadline || '' } :
                { clubId: '', eventName: '', description: '', venueId: '', eventDate: '', eventTime: '', deadline: '', registrationFormLink: '' });
        } else if (type === 'assign') {
            setAssignForm({ email: '', clubId: '' });
        }
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingItem(null); };

    if (loading) {
        return <div className="admin-dashboard"><div className="loading-container"><div className="loader"></div></div></div>;
    }

    return (
        <div className="admin-dashboard">
            <BackButton />
            <header className="dashboard-header card">
                <h1>🛡️ Admin Dashboard</h1>
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

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card"><span className="stat-num">{clubs.length}</span><span className="stat-label">Clubs</span></div>
                <div className="stat-card"><span className="stat-num">{events.length}</span><span className="stat-label">Events</span></div>
                <div className="stat-card"><span className="stat-num">{faculty.length}</span><span className="stat-label">Faculty</span></div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}>🏢 Clubs</button>
                <button className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>📅 Events</button>
                <button className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>👥 Faculty</button>
                <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>📋 My Bookings</button>
            </div>

            {/* Clubs Tab */}
            {activeTab === 'clubs' && (
                <div className="card">
                    <h2>🏢 Manage Clubs</h2>
                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => openModal('club')}>➕ Add Club</button>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    
                    {/* Animated Clubs List */}
                    <ExpandableCardList 
                        title={null}
                        cards={clubs.map(club => ({
                            clubId: club.clubId,
                            clubName: club.clubName,
                            description: club.description || 'No description available',
                            icon: '🏢',
                            content: () => (
                                <div>
                                    <p><strong>Club ID:</strong> {club.clubId}</p>
                                    <p><strong>Description:</strong> {club.description || 'No description'}</p>
                                    <p><strong>Status:</strong> Active</p>
                                </div>
                            ),
                            ctaText: 'Manage',
                            ctaLink: '#'
                        }))}
                    />
                </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <div className="card">
                    <h2>📅 Manage Events</h2>
                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => openModal('event')}>➕ Add Event</button>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    
                    {/* Animated Event Cards with Flip Animation */}
                    <div className="event-cards-grid">
                        {events.map((event, index) => (
                            <EventFlipCard 
                                key={event.eventId} 
                                event={event} 
                                index={index}
                                onAction={(evt) => {
                                    // Handle action - could open modal or navigate
                                    console.log('View event:', evt);
                                }}
                            />
                        ))}
                    </div>
                    
                    {events.length === 0 && (
                        <p className="text-center text-muted" style={{ padding: '2rem', color: 'var(--muted)' }}>
                            No events found. Add one to get started!
                        </p>
                    )}
                </div>
            )}

            {/* Faculty Tab */}
            {activeTab === 'faculty' && (
                <div className="card">
                    <h2>👥 Manage Faculty Assignments</h2>
                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => openModal('assign')}>➕ Assign Faculty</button>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    
                    {/* Animated Faculty List */}
                    <ExpandableCardList 
                        title={null}
                        cards={faculty.map(f => ({
                            id: f.userId,
                            clubName: `${f.firstName || ''} ${f.lastName || ''}`.trim() || f.email,
                            description: f.clubId ? `Assigned to: ${f.clubId}` : 'Not assigned to any club',
                            icon: '👨‍🏫',
                            content: () => (
                                <div>
                                    <p><strong>Email:</strong> {f.email}</p>
                                    <p><strong>Assigned Club:</strong> {f.clubId || 'None'}</p>
                                    <p><strong>User ID:</strong> {f.userId}</p>
                                </div>
                            ),
                            ctaText: f.clubId ? 'Remove' : 'Assign',
                            ctaLink: '#'
                        }))}
                    />
                </div>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="card">
                    <h2>📅 My Venue Bookings</h2>
                    <div className="action-bar">
                        <Link to="/booking" className="btn btn-primary">➕ New Booking</Link>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    
                    {/* Calendar View */}
                    <MyBookingsCalendar />
                    
                    {/* Bookings Table */}
                    <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>All Bookings</h3>
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

            {/* Modals */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeModal}>×</button>

                        {modalType === 'club' && (
                            <>
                                <h3>{editingItem ? '✏️ Edit Club' : '➕ Add Club'}</h3>
                                <form onSubmit={handleClubSubmit}>
                                    <div className="form-group">
                                        <label>Club ID *</label>
                                        <input value={clubForm.clubId} onChange={e => setClubForm({ ...clubForm, clubId: e.target.value })} disabled={!!editingItem} required placeholder="e.g., IEEE" />
                                    </div>
                                    <div className="form-group">
                                        <label>Club Name *</label>
                                        <input value={clubForm.clubName} onChange={e => setClubForm({ ...clubForm, clubName: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={clubForm.description} onChange={e => setClubForm({ ...clubForm, description: e.target.value })} rows={3} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{editingItem ? 'Update' : 'Add'} Club</button>
                                </form>
                            </>
                        )}

                        {modalType === 'event' && (
                            <>
                                <h3>{editingItem ? '✏️ Edit Event' : '➕ Add Event'}</h3>
                                <form onSubmit={handleEventSubmit}>
                                    <div className="form-group">
                                        <label>Club ID *</label>
                                        <select value={eventForm.clubId} onChange={e => setEventForm({ ...eventForm, clubId: e.target.value })} required>
                                            <option value="">Select Club</option>
                                            {clubs.map(c => <option key={c.clubId} value={c.clubId}>{c.clubName}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Event Name *</label>
                                        <input value={eventForm.eventName} onChange={e => setEventForm({ ...eventForm, eventName: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} rows={2} />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Date *</label>
                                            <input type="date" value={eventForm.eventDate} onChange={e => setEventForm({ ...eventForm, eventDate: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Time</label>
                                            <input type="time" value={eventForm.eventTime} onChange={e => setEventForm({ ...eventForm, eventTime: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Venue</label>
                                            <input value={eventForm.venueId} onChange={e => setEventForm({ ...eventForm, venueId: e.target.value })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Deadline</label>
                                            <input type="date" value={eventForm.deadline} onChange={e => setEventForm({ ...eventForm, deadline: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Registration Link</label>
                                        <input value={eventForm.registrationFormLink} onChange={e => setEventForm({ ...eventForm, registrationFormLink: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{editingItem ? 'Update' : 'Add'} Event</button>
                                </form>
                            </>
                        )}

                        {modalType === 'assign' && (
                            <>
                                <h3>➕ Assign Faculty to Club</h3>
                                <form onSubmit={handleAssignFaculty}>
                                    <div className="form-group">
                                        <label>Faculty *</label>
                                        <select value={assignForm.email} onChange={e => setAssignForm({ ...assignForm, email: e.target.value })} required>
                                            <option value="">Select Faculty</option>
                                            {faculty.filter(f => !f.clubId).map(f => (
                                                <option key={f.userId} value={f.email}>{f.firstName} {f.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Club *</label>
                                        <select value={assignForm.clubId} onChange={e => setAssignForm({ ...assignForm, clubId: e.target.value })} required>
                                            <option value="">Select Club</option>
                                            {clubs.map(c => <option key={c.clubId} value={c.clubId}>{c.clubName}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Assign Faculty</button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
