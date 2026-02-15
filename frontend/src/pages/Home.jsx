import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { statsAPI } from '../services/api';
import './Home.css';

const Home = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, totalVenues: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await statsAPI.getStats();
            setStats(data);
        };
        fetchStats();
    }, []);

    const handleModuleClick = (path) => {
        navigate(path);
    };

    const goToDashboard = () => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else if (user?.role === 'FACULTY') navigate('/faculty');
        else navigate('/dashboard');
    };

    return (
        <div className="homepage">
            {/* Navigation */}
            <nav className="home-nav">
                <div className="home-nav__container">
                    <Link to="/" className="home-nav__logo">
                        <img src="/logoo.png" alt="InfoNest" className="home-nav__logo-img" />
                        <span><span className="highlight">Info</span>Nest</span>
                    </Link>

                    <button
                        className="home-nav__toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <div className={`home-nav__menu ${mobileMenuOpen ? 'open' : ''}`}>
                        <ul className="home-nav__list">
                            <li><a href="#modules-section" className="home-nav__link">Try It</a></li>
                            <li><a href="#features-section" className="home-nav__link">About Us</a></li>
                            <li><a href="#footer" className="home-nav__link">Contact</a></li>
                        </ul>
                        <div className="home-nav__actions">
                            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </button>
                            {isAuthenticated ? (
                                <div className="home-nav__user">
                                    <span className="home-nav__avatar">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </span>
                                    <span className="home-nav__username">{user?.firstName}</span>
                                    <button className="btn btn-secondary btn-sm" onClick={goToDashboard}>Dashboard</button>
                                    <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                                    <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section id="hero-section" className="hero-section">
                <div className="hero-container">
                    <div className="hero-grid">
                        <div className="hero-content">
                            <h1 className="hero-title">
                                Streamline Your Campus Management with <span className="highlight">Confidence</span>
                            </h1>
                            <p className="hero-description">
                                InfoNest empowers educational institutions with a comprehensive platform for club management,
                                event scheduling, and venue booking. Built for students, faculty, and administrators to
                                collaborate seamlessly.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                            </div>
                        </div>

                        <div className="hero-stats">
                            <div className="stat-card">
                                <div className="stat-icon">👥</div>
                                <h3>Active Users</h3>
                                <p className="stat-number">{stats.totalUsers}</p>
                                <p className="stat-label">Students & Faculty</p>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <h3>Total Events</h3>
                                <p className="stat-number">{stats.totalEvents}</p>
                                <p className="stat-label">Across All Clubs</p>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">📍</div>
                                <h3>Venues Managed</h3>
                                <p className="stat-number">{stats.totalVenues}</p>
                                <p className="stat-label">Real-time Booking</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section id="modules-section" className="modules-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Comprehensive Platform Modules</h2>
                        <p className="section-subtitle">
                            Three integrated systems working together to deliver seamless campus management
                        </p>
                    </div>

                    <div className="modules-grid">
                        <div className="module-card" onClick={() => handleModuleClick('/clubs')}>
                            <img src="/clubs.png" alt="Clubs" className="module-icon-img" />
                            <h3 className="module-title">Club Management</h3>
                            <p className="module-description">
                                Comprehensive club oversight, event creation, and student engagement tools with ML-powered resume screening.
                            </p>
                            <ul className="module-features">
                                <li>✓ Event Management</li>
                                <li>✓ Student Registration</li>
                                <li>✓ Resume Screening</li>
                                <li>✓ Faculty Dashboard</li>
                            </ul>
                            <button className="btn btn-secondary module-btn">Explore →</button>
                        </div>

                        <div className="module-card" onClick={() => handleModuleClick('/schedule')}>
                            <img src="/schedule.png" alt="Schedule" className="module-icon-img" />
                            <h3 className="module-title">Schedule Module</h3>
                            <p className="module-description">
                                Real-time timetable viewing with integrated venue booking and location tracking for seamless coordination.
                            </p>
                            <ul className="module-features">
                                <li>✓ Live Timetables</li>
                                <li>✓ Location Tracking</li>
                                <li>✓ Conflict Detection</li>
                                <li>✓ Auto-sync</li>
                            </ul>
                            <button className="btn btn-secondary module-btn">Explore →</button>
                        </div>

                        <div className="module-card" onClick={() => handleModuleClick('/booking')}>
                            <img src="/venuee.png" alt="Venue" className="module-icon-img" />
                            <h3 className="module-title">Venue Booking</h3>
                            <p className="module-description">
                                Classroom and event venue booking system with role-based access and real-time availability updates.
                            </p>
                            <ul className="module-features">
                                <li>✓ Real-time Availability</li>
                                <li>✓ Role-based Access</li>
                                <li>✓ Auto-confirmation</li>
                                <li>✓ Calendar Sync</li>
                            </ul>
                            <button className="btn btn-secondary module-btn">Explore →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features-section" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose InfoNest?</h2>
                        <p className="section-subtitle">
                            Built with best practices for security, reliability, and user experience
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Lightning Fast</h3>
                            <p>Optimized performance ensures instant response times and smooth navigation.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Compliant</h3>
                            <p>Role-based access control, encrypted data, and compliance for student privacy.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔔</div>
                            <h3>Real-time Updates</h3>
                            <p>Instant notifications for bookings, approvals, and schedule changes.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">👥</div>
                            <h3>Multi-role Support</h3>
                            <p>Tailored dashboards for students, faculty, admins, and office staff.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h3>Analytics & Reports</h3>
                            <p>Comprehensive insights into event participation and venue utilization.</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">✓</div>
                            <h3>Integrated Workflows</h3>
                            <p>Seamless synchronization between club events, schedules, and venues.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="footer" className="footer">
                <p>Made with ❤️ by InfoNest team</p>
            </footer>
        </div>
    );
};

export default Home;
