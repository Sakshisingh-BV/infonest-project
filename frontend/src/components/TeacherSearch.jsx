import { useState } from 'react';
import { scheduleAPI } from '../services/api';

const TeacherSearch = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await scheduleAPI.findTeacher(query);
            setResult(response.data);
        } catch (err) {
            setResult(null);
            setError("No active class found for this teacher right now.");
        }
    };

    return (
        <div className="search-container card">
            <h3>🔍 Find Teacher Real-Time</h3>
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    placeholder="Enter Teacher's Name..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                />
                <button type="submit" className="btn btn-primary">Locate</button>
            </form>

            {result && (
                <div className="location-result success">
                    <p>✅ <strong>{result.teacherName}</strong> is currently in <strong>{result.roomNo}</strong></p>
                    <p>Subject: {result.subject} | Until: {result.endTime}</p>
                </div>
            )}
            {error && <p className="error-text">{error}</p>}
        </div>
    );
};
export default TeacherSearch;