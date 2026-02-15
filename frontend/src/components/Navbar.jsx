import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const goToDashboard = () => {
        if (user?.role === 'ADMIN') return '/admin';
        if (user?.role === 'FACULTY') return '/faculty';
        return '/dashboard';
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <img src="/logoo.png" alt="InfoNest" className="logo-image" />
                    <span className="logo-text">InfoNest</span>
                </Link>

                <div className="header-actions">
                    {isAuthenticated && (
                        <span className="user-info">Hi, {user?.firstName || 'User'}!</span>
                    )}

                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link to={goToDashboard()} className="btn btn-secondary">
                                My Dashboard
                            </Link>
                            <button onClick={logout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">Sign In</Link>
                            <Link to="/signup" className="btn btn-primary">Create Account</Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
