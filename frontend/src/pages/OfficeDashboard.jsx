import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { venueAPI } from '../services/api';
import BackButton from '../components/BackButton';
import './OfficeDashboard.css';

const OfficeDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('bookings');
    const [myBookings, setMyBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    // Add venue form
    const [showAddModal, setShowAddModal] = useState(false);
    const [venueForm, setVenueForm] = useState({
        name: '', type: 'CLASSROOM', capacity: '', location: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, venuesRes] = await Promise.all([
                venueAPI.getMyBookings(),
                venueAPI.getAllVenues()
            ]);
            setMyBookings(bookingsRes.data);
            setVenues(venuesRes.data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVenue = async (e) => {
        e.preventDefault();
        try {
            await venueAPI.addVenue(venueForm);
            setMessage({ type: 'success', text: 'Venue added successfully!' });
            setShowAddModal(false);
            setVenueForm({ name: '', type: 'CLASSROOM', capacity: '', location: '' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to add venue' });
        }
    };

    const handleDeleteVenue = async (venueId) => {
        if (!confirm('Deactivate this venue?')) return;
        try {
            await venueAPI.deleteVenue(venueId);
            setMessage({ type: 'success', text: 'Venue deactivated!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to delete venue' });
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Cancel this booking?')) return;
        try {
            await venueAPI.cancelBooking(bookingId);
            setMessage({ type: 'success', text: 'Booking cancelled!' });
            fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to cancel' });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString();
    };

    if (loading) {
        return <div className="office-dashboard"><div className="loading-container"><div className="loader"></div></div></div>;
    }

    return (
        <div className="office-dashboard">
            <BackButton />
            <header className="dashboard-header card">
                <div className="header-info">
                    <h1>🏢 Office Dashboard</h1>
                    <span className="role-badge">OFFICE</span>
                </div>
                <div className="header-actions">
                    <Link to="/booking" className="btn btn-primary">📍 Book Venue</Link>
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
                <div className="stat-card"><span className="stat-num">{myBookings.length}</span><span className="stat-label">My Bookings</span></div>
                <div className="stat-card"><span className="stat-num">{venues.length}</span><span className="stat-label">Active Venues</span></div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    📋 My Bookings
                </button>
                <button className={`tab-btn ${activeTab === 'venues' ? 'active' : ''}`} onClick={() => setActiveTab('venues')}>
                    🏫 Manage Venues
                </button>
                <button className={`tab-btn ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
                    📅 Teacher Schedules
                </button>
            </div>

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

            {/* Manage Venues Tab */}
            {activeTab === 'venues' && (
                <div className="card">
                    <h2>🏫 All Venues</h2>
                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>➕ Add Venue</button>
                        <button className="btn btn-secondary" onClick={fetchData}>🔄 Refresh</button>
                    </div>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Type</th><th>Capacity</th><th>Location</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {venues.length > 0 ? venues.map(v => (
                                <tr key={v.venueId}>
                                    <td>{v.venueId}</td>
                                    <td>{v.name}</td>
                                    <td>{v.type}</td>
                                    <td>{v.capacity}</td>
                                    <td>{v.location || '-'}</td>
                                    <td>
                                        <button className="btn btn-danger" onClick={() => handleDeleteVenue(v.venueId)}>Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6">No venues found. Add your first venue!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'schedules' && (
                <div className="card">
                    <h2>📅 Bulk Upload Teacher Schedules</h2>
                    <p className="helper-text">Please upload an Excel file (.xlsx) containing the weekly teaching hours.</p>
                    
                    <div className="upload-section">
                        <div className="template-download">
                            <button className="btn btn-secondary" onClick={downloadTemplate}>
                                📥 Download Excel Template
                            </button>
                        </div>

                        <form onSubmit={handleScheduleUpload} className="bulk-upload-form">
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    id="excelFile"
                                    onChange={(e) => setSelectedFile(e.target.files[0])} 
                                    accept=".xlsx, .xls" 
                                    className="file-input"
                                />
                                <label htmlFor="excelFile" className="file-label">
                                    {selectedFile ? selectedFile.name : "Choose Excel File..."}
                                </label>
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={!selectedFile}>
                                🚀 Upload and Process
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Venue Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
                        <h3>➕ Add Venue</h3>
                        <form onSubmit={handleAddVenue}>
                            <div className="form-group">
                                <label>Venue Name *</label>
                                <input value={venueForm.name} onChange={e => setVenueForm({ ...venueForm, name: e.target.value })} required placeholder="e.g., Room 101" />
                            </div>
                            <div className="form-group">
                                <label>Type *</label>
                                <select value={venueForm.type} onChange={e => setVenueForm({ ...venueForm, type: e.target.value })}>
                                    <option value="CLASSROOM">Classroom</option>
                                    <option value="AUDITORIUM">Auditorium</option>
                                    <option value="SEMINAR_HALL">Seminar Hall</option>
                                    <option value="COMPUTER_LAB">Computer Lab</option>
                                    <option value="CONFERENCE_ROOM">Conference Room</option>
                                    <option value="OUTDOOR">Outdoor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Capacity *</label>
                                <input type="number" value={venueForm.capacity} onChange={e => setVenueForm({ ...venueForm, capacity: e.target.value })} required placeholder="e.g., 100" />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input value={venueForm.location} onChange={e => setVenueForm({ ...venueForm, location: e.target.value })} placeholder="e.g., Block A, Floor 2" />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add Venue</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const handleScheduleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        setMessage({ type: 'error', text: 'Please select a file first!' });
        return;
    }

    // Check file extension (Client-side validation)
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        setMessage({ type: 'error', text: 'Only Excel files (.xlsx, .xls) are allowed.' });
        return;
    }

    setLoading(true);
    try {
        await scheduleAPI.uploadExcel(selectedFile);
        setMessage({ type: 'success', text: 'Schedules processed and saved successfully!' });
        setSelectedFile(null); // Clear file after success
    } catch (err) {
        // Handle specific backend errors
        const errMsg = err.response?.data?.message || "Error processing Excel. Check if format is correct.";
        setMessage({ type: 'error', text: errMsg });
    } finally {
        setLoading(false);
    }
};

// Professional touch: Provide a template for the office user
const downloadTemplate = () => {
    const csvContent = "Teacher Name,Subject,Room No,Day,Start Time (HH:mm),End Time (HH:mm)\nDr. Smith,Computer Science,Room 101,Monday,09:00,10:00";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Schedule_Template.csv';
    a.click();
};

export default OfficeDashboard;
