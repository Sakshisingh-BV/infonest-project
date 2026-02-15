import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import './Dashboard.css';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            // Redirect based on role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'FACULTY') {
                navigate('/faculty');
            } else if (user.role === 'OFFICE') {
                navigate('/office');
            }
            // Students stay on this page
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    // For students, show student dashboard
    if (user?.role === 'STUDENT') {
        return <StudentDashboard />;
    }

    // Fallback for other roles while redirecting
    return (
        <div className="dashboard">
            <div className="loading-container">
                <div className="loader"></div>
                <p>Redirecting to your dashboard...</p>
            </div>
        </div>
    );
};

export default Dashboard;
