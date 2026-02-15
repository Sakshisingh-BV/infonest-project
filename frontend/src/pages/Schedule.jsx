import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import './Schedule.css';

// Mock schedule data
const mockScheduleData = {
    teacher: {
        id: 'Dr. Sarah Johnson',
        scheduledLocation: 'Room 301, CS Building',
        currentLocation: 'Room 301, CS Building',
        lastUpdated: '2 minutes ago',
        details: 'Data Structures Lab - 10:00 AM to 12:00 PM'
    },
    classroom: {
        id: 'CMS-202',
        details: 'Operating Systems by Prof. Kumar',
        currentLocation: 'CMS-202, Main Block',
        scheduledLocation: 'CMS-202'
    },
    batch: {
        id: 'B.Tech CS 3rd Year',
        details: 'Database Management Systems',
        scheduledLocation: 'Room 405, CS Building',
        currentLocation: 'Room 405, CS Building',
        lastUpdated: '5 minutes ago'
    }
};

const Schedule = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [searchType, setSearchType] = useState('teacher');
    const [searchQuery, setSearchQuery] = useState('');
    const [department, setDepartment] = useState('');
    const [showSchedule, setShowSchedule] = useState(false);
    const [scheduleData, setScheduleData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSearch = () => {
        if (!searchQuery) {
            setMessage({ type: 'error', text: 'Please enter a search query' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        // Simulate API call
        setTimeout(() => {
            setScheduleData(mockScheduleData[searchType]);
            setShowSchedule(true);
            setLoading(false);
        }, 500);
    };

    const canUpdateSchedule = user && user.role === 'OFFICE';

    return (
        <div className="schedule-page">
            <BackButton />

            <div className="schedule-container">
                <header className="schedule-header">
                    <h1>📅 View Schedules</h1>
                    <p>Search and view schedules by teacher, classroom, or batch</p>
                    {canUpdateSchedule && (
                        <button className="btn btn-primary update-btn">
                            ✏️ Update Schedule
                        </button>
                    )}
                </header>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                    </div>
                )}

                {/* Tabs */}
                <div className="schedule-tabs">
                    <button
                        className={`schedule-tab ${searchType === 'teacher' ? 'active' : ''}`}
                        onClick={() => { setSearchType('teacher'); setShowSchedule(false); setSearchQuery(''); }}
                    >
                        👨‍🏫 Teacher
                    </button>
                    <button
                        className={`schedule-tab ${searchType === 'classroom' ? 'active' : ''}`}
                        onClick={() => { setSearchType('classroom'); setShowSchedule(false); setSearchQuery(''); }}
                    >
                        🏫 Classroom
                    </button>
                    <button
                        className={`schedule-tab ${searchType === 'batch' ? 'active' : ''}`}
                        onClick={() => { setSearchType('batch'); setShowSchedule(false); setSearchQuery(''); }}
                    >
                        📚 Batch
                    </button>
                </div>

                {/* Teacher Schedule */}
                {searchType === 'teacher' && (
                    <div className="schedule-content">
                        <div className="search-form card">
                            <h3>Search Teacher Schedule</h3>
                            <p className="form-subtitle">View teacher's timetable and real-time location</p>

                            <div className="form-group">
                                <label>Teacher's Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter teacher name (e.g., Dr. Sarah Johnson)"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : '🔍 Search Schedule'}
                            </button>

                            {showSchedule && scheduleData && (
                                <div className="schedule-result">
                                    <div className="schedule-pdf">
                                        <h4>Schedule PDF</h4>
                                        <div className="pdf-preview">
                                            <div className="pdf-icon">📄</div>
                                            <p>Teacher Schedule - {scheduleData.id}</p>
                                            <button className="btn btn-secondary">View Full Schedule</button>
                                        </div>
                                    </div>

                                    <div className="location-card teacher-location">
                                        <div className="location-icon">📍</div>
                                        <div className="location-info">
                                            <h4>Real-time Location</h4>
                                            <div className="location-badges">
                                                <span className="label">Scheduled:</span>
                                                <span className="badge badge-outline">{scheduleData.scheduledLocation}</span>
                                                <span className="separator">|</span>
                                                <span className="label">Currently in:</span>
                                                <span className="badge badge-success">{scheduleData.currentLocation}</span>
                                            </div>
                                            <p className="last-updated">Last updated: {scheduleData.lastUpdated}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Classroom Schedule */}
                {searchType === 'classroom' && (
                    <div className="schedule-content">
                        <div className="search-form card">
                            <h3>Search Classroom Schedule</h3>
                            <p className="form-subtitle">View classroom timetable by department and class</p>

                            <div className="form-group">
                                <label>Department</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)}>
                                    <option value="">Select department</option>
                                    <option value="cs">Computer Science</option>
                                    <option value="it">Information Technology</option>
                                    <option value="ece">Electronics & Communication</option>
                                    <option value="ee">Electrical Engineering</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Classroom Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., CMS-202"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : '🔍 Search Schedule'}
                            </button>

                            {showSchedule && scheduleData && (
                                <div className="schedule-result">
                                    <div className="schedule-pdf">
                                        <h4>Classroom Schedule</h4>
                                        <div className="pdf-preview">
                                            <div className="pdf-icon">📄</div>
                                            <p>Weekly Schedule - {scheduleData.id}</p>
                                            <button className="btn btn-secondary">View Full Schedule</button>
                                        </div>
                                    </div>

                                    <div className="location-card classroom-location">
                                        <div className="location-icon">📍</div>
                                        <div className="location-info">
                                            <h4>Current Class</h4>
                                            <p className="class-details">{scheduleData.details}</p>
                                            <div className="location-badges">
                                                <span className="label">Location:</span>
                                                <span className="badge badge-secondary">{scheduleData.currentLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Batch Schedule */}
                {searchType === 'batch' && (
                    <div className="schedule-content">
                        <div className="search-form card">
                            <h3>Search Batch Schedule</h3>
                            <p className="form-subtitle">View timetable for a specific batch</p>

                            <div className="form-group">
                                <label>Department</label>
                                <select value={department} onChange={e => setDepartment(e.target.value)}>
                                    <option value="">Select department</option>
                                    <option value="cs">Computer Science</option>
                                    <option value="it">Information Technology</option>
                                    <option value="ece">Electronics & Communication</option>
                                    <option value="ee">Electrical Engineering</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Batch Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., B.Tech CS 3rd Year"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-full"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Searching...' : '🔍 Search Schedule'}
                            </button>

                            {showSchedule && scheduleData && (
                                <div className="schedule-result">
                                    <div className="schedule-pdf">
                                        <h4>Batch Timetable</h4>
                                        <div className="pdf-preview">
                                            <div className="pdf-icon">📄</div>
                                            <p>Timetable - {scheduleData.id}</p>
                                            <button className="btn btn-secondary">View Full Timetable</button>
                                        </div>
                                    </div>

                                    <div className="location-card batch-location">
                                        <div className="location-icon">📍</div>
                                        <div className="location-info">
                                            <h4>Current Location</h4>
                                            <p className="class-details">{scheduleData.details}</p>
                                            <div className="location-badges">
                                                <span className="label">Scheduled:</span>
                                                <span className="badge badge-outline">{scheduleData.scheduledLocation}</span>
                                                <span className="separator">|</span>
                                                <span className="label">Currently:</span>
                                                <span className="badge badge-success">{scheduleData.currentLocation}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
