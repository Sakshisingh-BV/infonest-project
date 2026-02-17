import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scheduleAPI } from '../services/api';
import BackButton from '../components/BackButton';
import './Schedule.css';

const Schedule = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 1. State Management
    const [searchQuery, setSearchQuery] = useState('');
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Advanced Search States
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedData, setAdvancedData] = useState({ day: 'Monday', time: '09:00:00' });

    // 2. Search Logic - Option 1: Real-Time Location (Handles Tuesday/9-5 Rules)
    const handleSearch = async () => {
        if (!searchQuery) {
            setMessage({ type: 'error', text: 'Please enter a teacher name' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await scheduleAPI.searchRealTime(searchQuery);
            setScheduleData({
                id: searchQuery,
                currentLocation: response.data, 
                scheduledLocation: "Live Check",
                lastUpdated: "Just now"
            });
            setShowSchedule(true);
        } catch (err) {
            setMessage({ type: 'error', text: 'Search failed. Teacher info not found.' });
        } finally {
            setLoading(false);
        }
    };

    // 3. Search Logic - Option 2: Sitting Cabin (Column G in Excel)
    const handleCabinSearch = async () => {
        if (!searchQuery) {
            setMessage({ type: 'error', text: 'Please enter a name first' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await scheduleAPI.getCabin(searchQuery);
            setScheduleData({
                id: searchQuery,
                currentLocation: response.data, 
                scheduledLocation: "Staff Cabin Area",
                lastUpdated: "Just now"
            });
            setShowSchedule(true);
        } catch (err) {
            setMessage({ type: 'error', text: 'Cabin info not found.' });
        } finally {
            setLoading(false);
        }
    };

    // 4. Search Logic - Option 3: Advanced/Custom Search
    const handleAdvancedSearch = async () => {
        if (!searchQuery) {
            setMessage({ type: 'error', text: 'Enter teacher name first' });
            return;
        }
        setLoading(true);
        try {
            const response = await scheduleAPI.searchAdvanced(
                searchQuery, 
                advancedData.day, 
                advancedData.time
            );
            setScheduleData({
                id: searchQuery,
                currentLocation: `Room: ${response.data.roomNo} (${response.data.subject})`,
                scheduledLocation: `${advancedData.day} at ${advancedData.time}`,
                lastUpdated: "Custom Query"
            });
            setShowAdvanced(false);
            setShowSchedule(true);
        } catch (err) {
            setMessage({ type: 'error', text: 'No record found for this specific slot.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="schedule-page">
            <BackButton />

            <div className="schedule-container">
                <header className="schedule-header">
                    <h1>📅 View Teacher Schedules</h1>
                    <p>Search teacher's timetable and real-time location</p>
                </header>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button className="close-alert" onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                <div className="schedule-content">
                    <div className="search-form card">
                        <h3>Teacher Locator</h3>
                        <p className="form-subtitle">Find where a teacher is right now or check their cabin</p>

                        <div className="form-group">
                            <label>Teacher's Name</label>
                            <input
                                type="text"
                                placeholder="Enter teacher name (e.g., Pandey)"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {/* Search Mode Buttons */}
                        <div className="search-sub-modes" style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={handleCabinSearch}>🏠 Sitting Cabin</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowAdvanced(true)}>📅 Custom Search</button>
                        </div>

                        <button
                            className="btn btn-primary btn-full"
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : '🔍 Locate Teacher Now'}
                        </button>

                        {/* Result Section */}
                        {showSchedule && scheduleData && (
                            <div className="schedule-result" style={{ marginTop: '20px' }}>
                                <div className="location-card teacher-location">
                                    <div className="location-icon">📍</div>
                                    <div className="location-info">
                                        <h4>Search Result</h4>
                                        <div className="location-badges">
                                            <span className="badge badge-success" style={{ fontSize: '1.1rem', padding: '12px' }}>
                                                {scheduleData.currentLocation}
                                            </span>
                                        </div>
                                        <p className="last-updated">Status: {scheduleData.scheduledLocation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Advanced Search Modal Pop-up */}
                {showAdvanced && (
                    <div className="modal-overlay">
                        <div className="modal card">
                            <h3>📅 Custom Schedule Search</h3>
                            <div className="form-group">
                                <label>Select Day</label>
                                <select 
                                    className="modal-input"
                                    onChange={(e) => setAdvancedData({...advancedData, day: e.target.value})}
                                >
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Time</label>
                                <input 
                                    type="time" 
                                    className="modal-input"
                                    onChange={(e) => setAdvancedData({...advancedData, time: e.target.value + ":00"})} 
                                />
                            </div>
                            <div className="modal-actions">
                                <button className="btn btn-primary" onClick={handleAdvancedSearch} disabled={loading}>
                                    {loading ? 'Searching...' : 'Search Slot'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowAdvanced(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;