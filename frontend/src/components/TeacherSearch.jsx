import { useState } from 'react';
import { scheduleAPI } from '../services/api';

const TeacherSearch = () => {
    const [name, setName] = useState('');
    const [mode, setMode] = useState('realtime'); // realtime, cabin, advanced
    const [result, setResult] = useState(null);
    const [advanced, setAdvanced] = useState({ day: 'Monday', time: '10:00:00' });

    const handleSearch = async () => {
        try {
            let data;
            if (mode === 'realtime') {
                data = await scheduleAPI.searchTeacher(name);
            } else if (mode === 'cabin') {
                data = await scheduleAPI.getCabin(name);
            } else {
                data = await scheduleAPI.searchAdvanced(name, advanced.day, advanced.time);
            }
            setResult(data.data);
        } catch (err) {
            setResult({ error: "No info found for this search." });
        }
    };

    return (
        <div className="teacher-search-container">
            <div className="mode-selector">
                <button className={mode === 'realtime' ? 'active' : ''} onClick={() => setMode('realtime')}>Where is she now?</button>
                <button className={mode === 'cabin' ? 'active' : ''} onClick={() => setMode('cabin')}>Find Sitting Cabin</button>
                <button className={mode === 'advanced' ? 'active' : ''} onClick={() => setMode('advanced')}>Search by Day/Time</button>
            </div>

            <input 
                type="text" 
                placeholder="Teacher Name (e.g. Pandey)" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
            />

            {mode === 'advanced' && (
                <div className="advanced-inputs">
                    <select onChange={(e) => setAdvanced({...advanced, day: e.target.value})}>
                        <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
                        <option>Thursday</option><option>Friday</option>
                    </select>
                    <input type="time" onChange={(e) => setAdvanced({...advanced, time: e.target.value + ":00"})} />
                </div>
            )}

            <button className="btn-locate" onClick={handleSearch}>Locate</button>

            {result && (
                <div className="search-result card">
                    {result.error ? <p>{result.error}</p> : (
                        mode === 'cabin' ? <p>📍 Sitting Cabin: <strong>{result}</strong></p> :
                        <p>📍 {result.teacherName} is in <strong>{result.roomNo}</strong> for {result.subject}</p>
                    )}
                </div>
            )}
        </div>
    );
};
export default TeacherSearch;