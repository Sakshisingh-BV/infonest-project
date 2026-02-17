import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { statsAPI } from '../services/api';
import { motion, useInView } from 'framer-motion';
import './Home.css';

// Animated Counter Component
const AnimatedCounter = ({ value, suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        let startTime;
        const duration = 1500;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setDisplayValue(Math.floor(easeOutQuart * value));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value]);

    return <span ref={ref}>{displayValue}{suffix}</span>;
};

// Typewriter Effect Component with blinking cursor
// Uses MutationObserver to watch the actual DOM for dark mode — bypasses all context/cascade issues
const TypewriterEffect = ({ blackText = '', orangeText = '', className }) => {
    const [displayBlackText, setDisplayBlackText] = useState('');
    const [displayOrangeText, setDisplayOrangeText] = useState('');
    const [blackIndex, setBlackIndex] = useState(0);
    const [orangeIndex, setOrangeIndex] = useState(0);
    const [isBlackComplete, setIsBlackComplete] = useState(false);
    const [isAllComplete, setIsAllComplete] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // Watch the DOM directly for any dark-mode class/attribute on html or body
    useEffect(() => {
        const checkDark = () => {
            const html = document.documentElement;
            const body = document.body;
            const dark =
                html.getAttribute('data-theme') === 'dark' ||
                html.classList.contains('dark') ||
                html.classList.contains('dark-mode') ||
                body.getAttribute('data-theme') === 'dark' ||
                body.classList.contains('dark') ||
                body.classList.contains('dark-mode');
            setIsDark(dark);
        };

        checkDark(); // run immediately

        // Watch for any attribute/class change on html and body
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView) {
            setDisplayBlackText('');
            setDisplayOrangeText('');
            setBlackIndex(0);
            setOrangeIndex(0);
            setIsBlackComplete(false);
            setIsAllComplete(false);
            return;
        }

        if (blackIndex < blackText.length) {
            const timeout = setTimeout(() => {
                setDisplayBlackText(prev => prev + blackText[blackIndex]);
                setBlackIndex(blackIndex + 1);
            }, 45);
            return () => clearTimeout(timeout);
        } else if (!isBlackComplete) {
            setIsBlackComplete(true);
        }

        if (isBlackComplete && orangeIndex < orangeText.length) {
            const timeout = setTimeout(() => {
                setDisplayOrangeText(prev => prev + orangeText[orangeIndex]);
                setOrangeIndex(orangeIndex + 1);
            }, 45);
            return () => clearTimeout(timeout);
        } else if (isBlackComplete && orangeIndex >= orangeText.length && !isAllComplete) {
            setIsAllComplete(true);
        }
    }, [isInView, blackIndex, orangeIndex, isBlackComplete, blackText, orangeText, isAllComplete]);

    return (
        <span ref={ref} className={className}>
            <span style={{ color: isDark ? '#ffffff' : '#111827', transition: 'color 0.3s ease' }}>
                {displayBlackText}
            </span>
            <span className="title-orange">{displayOrangeText}</span>
            <span className={`typewriter-cursor${isAllComplete ? ' cursor-blink' : ' cursor-typing'}`}>|</span>
        </span>
    );
};

// Floating Shape Background Component — CSS-only, no Framer Motion to avoid rAF conflicts
const FloatingShapes = () => {
    const shapes = Array.from({ length: 8 });
    return (
        <div className="floating-shapes">
            {shapes.map((_, i) => (
                <div key={i} className={`floating-shape shape-${i + 1}`} />
            ))}
        </div>
    );
};

// Simple fade-up wrapper — whileInView fires once and disconnects, no continuous scroll listener
const FadeUp = ({ children, className, delay = 0, once = true }) => {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
        >
            {children}
        </motion.div>
    );
};

// Module card — hover-only animations, NO scroll-triggered entrance (prevents lag)
const ModuleCard = ({ onClick, imgSrc, imgAlt, title, description, features, index }) => {
    const [hovered, setHovered] = useState(false);

    const hoverAnimations = [
        { rotate: -2, y: -14, scale: 1.03 },
        { rotate:  0, y: -18, scale: 1.05 },
        { rotate:  2, y: -14, scale: 1.03 },
    ];

    const accentColors = ['#6366f1', '#06b6d4', '#f59e0b'];

    return (
        <motion.div
            className={`module-card module-card--${index}`}
            onClick={onClick}
            whileHover={hoverAnimations[index]}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{ '--card-accent': accentColors[index] }}
        >
            <motion.div
                className="module-card__accent-bar"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hovered ? 1 : 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />

            <motion.img
                src={imgSrc}
                alt={imgAlt}
                className="module-icon-img"
                animate={hovered ? {
                    y: index === 1 ? [0, -8, 0] : index === 0 ? [0, -6, 2, -4, 0] : [0, -6, -6, 0],
                    rotate: index === 0 ? [-2, 2, -2] : index === 2 ? [2, -2, 2] : 0,
                } : { y: 0, rotate: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            <h3 className="module-title">{title}</h3>
            <p className="module-description">{description}</p>

            <ul className="module-features">
                {features.map((feat, fi) => (
                    <motion.li
                        key={fi}
                        animate={hovered ? { x: 6 } : { x: 0 }}
                        transition={{ duration: 0.2, delay: fi * 0.04 }}
                    >
                        {feat}
                    </motion.li>
                ))}
            </ul>

            <motion.button
                className="btn btn-secondary module-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
            >
                Explore →
            </motion.button>
        </motion.div>
    );
};

const FEATURES = [
    { icon: '⚡', title: 'Lightning Fast',       desc: 'Optimized performance ensures instant response times and smooth navigation.' },
    { icon: '🔒', title: 'Secure & Compliant',   desc: 'Role-based access control, encrypted data, and compliance for student privacy.' },
    { icon: '🔔', title: 'Real-time Updates',    desc: 'Instant notifications for bookings, approvals, and schedule changes.' },
    { icon: '👥', title: 'Multi-role Support',   desc: 'Tailored dashboards for students, faculty, admins, and office staff.' },
    { icon: '📊', title: 'Analytics & Reports',  desc: 'Comprehensive insights into event participation and venue utilization.' },
    { icon: '✓',  title: 'Integrated Workflows', desc: 'Seamless synchronization between club events, schedules, and venues.' },
];

// Each card starts scattered in a different direction, then converges to its grid slot.
// The directions cycle so the 6-card grid fans out from all sides.
const SCATTER_ORIGINS = [
    { x: -160, y: -120, rotate: -18 }, // top-left
    { x:    0, y: -180, rotate:   8 }, // top-center
    { x:  160, y: -120, rotate:  16 }, // top-right
    { x: -160, y:  120, rotate:  14 }, // bottom-left
    { x:    0, y:  180, rotate:  -8 }, // bottom-center
    { x:  160, y:  120, rotate: -16 }, // bottom-right
];

const FeaturesGrid = () => {
    const ref = useRef(null);
    // once: false → animation fires every time the section enters the viewport
    const isInView = useInView(ref, { once: false, margin: '-80px' });

    return (
        <div ref={ref} className="features-grid">
            {FEATURES.map((f, i) => {
                const origin = SCATTER_ORIGINS[i];
                return (
                    <motion.div
                        key={i}
                        className="feature-item"
                        // Reset to scattered when NOT in view so animation replays
                        initial={{ opacity: 0, x: origin.x, y: origin.y, rotate: origin.rotate, scale: 0.75 }}
                        animate={
                            isInView
                                ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                                : { opacity: 0, x: origin.x, y: origin.y, rotate: origin.rotate, scale: 0.75 }
                        }
                        transition={{
                            duration: 0.65,
                            delay: i * 0.07,          // slight stagger so they don't all land at once
                            ease: [0.22, 1, 0.36, 1], // snappy overshoot feel
                        }}
                        whileHover={{
                            y: -10,
                            scale: 1.03,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                            borderColor: 'var(--primary)',
                            transition: { duration: 0.25 },
                        }}
                    >
                        <div className="feature-icon">{f.icon}</div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </motion.div>
                );
            })}
        </div>
    );
};

const Home = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, totalVenues: 0 });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isDark, setIsDark] = useState(false);

    // Watch the DOM directly — works regardless of how ThemeContext names its values
    useEffect(() => {
        const checkDark = () => {
            const html = document.documentElement;
            const body = document.body;
            const dark =
                html.getAttribute('data-theme') === 'dark' ||
                html.classList.contains('dark') ||
                html.classList.contains('dark-mode') ||
                body.getAttribute('data-theme') === 'dark' ||
                body.classList.contains('dark') ||
                body.classList.contains('dark-mode');
            setIsDark(dark);
        };
        checkDark();
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        return () => observer.disconnect();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 48 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 36, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
    };

    useEffect(() => {
        // Lightweight native smooth scroll — avoids Lenis + Framer Motion rAF conflicts
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = '';
        };
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await statsAPI.getStats();
            setStats(data);
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleModuleClick = (path) => navigate(path);

    const goToDashboard = () => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else if (user?.role === 'FACULTY') navigate('/faculty');
        else navigate('/dashboard');
    };

    const moduleData = [
        {
            path: '/clubs',
            imgSrc: '/clubs.png',
            imgAlt: 'Clubs',
            title: 'Club Management',
            description: 'Comprehensive club oversight, event creation, and student engagement tools with ML-powered resume screening.',
            features: ['✓ Event Management', '✓ Student Registration', '✓ Resume Screening', '✓ Faculty Dashboard'],
        },
        {
            path: '/schedule',
            imgSrc: '/schedule.png',
            imgAlt: 'Schedule',
            title: 'Schedule Module',
            description: 'Real-time timetable viewing with integrated venue booking and location tracking for seamless coordination.',
            features: ['✓ Live Timetables', '✓ Location Tracking', '✓ Conflict Detection', '✓ Auto-sync'],
        },
        {
            path: '/booking',
            imgSrc: '/venuee.png',
            imgAlt: 'Venue',
            title: 'Venue Booking',
            description: 'Classroom and event venue booking system with role-based access and real-time availability updates.',
            features: ['✓ Real-time Availability', '✓ Role-based Access', '✓ Auto-confirmation', '✓ Calendar Sync'],
        },
    ];

    return (
        <div className="homepage">
            <FloatingShapes />

            {/* Navigation */}
            <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
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
                            <motion.button
                                className="theme-toggle-btn"
                                onClick={toggleTheme}
                                title="Toggle theme"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </motion.button>
                            {isAuthenticated ? (
                                <div className="home-nav__user">
                                    <motion.span className="home-nav__avatar" whileHover={{ scale: 1.1 }}>
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </motion.span>
                                    <span className="home-nav__username">{user?.firstName}</span>
                                    <motion.button className="btn btn-secondary btn-sm" onClick={goToDashboard} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Dashboard</motion.button>
                                    <motion.button className="btn btn-danger btn-sm" onClick={logout} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Logout</motion.button>
                                </div>
                            ) : (
                                <>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
                                    </motion.div>
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
                        <motion.div
                            className="hero-content"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                        >
                            <h1 className="hero-title">
                                <TypewriterEffect
                                    blackText="Streamline Your Campus Management with "
                                    orangeText="Confidence"
                                />
                            </h1>
                            <motion.p
                                className="hero-description"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                InfoNest empowers educational institutions with a comprehensive platform for club management,
                                event scheduling, and venue booking. Built for students, faculty, and administrators to
                                collaborate seamlessly.
                            </motion.p>
                            <motion.div
                                className="hero-buttons"
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Link
                                        to="/login"
                                        className="btn btn-secondary btn-lg"
                                        style={{ color: isDark ? '#ffffff' : '#111827' }}
                                    >Sign In</Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="hero-stats"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                        >
                            {[
                                { icon: '👥', label: 'Active Users', value: stats.totalUsers, sub: 'Students & Faculty' },
                                { icon: '📅', label: 'Total Events', value: stats.totalEvents, sub: 'Across All Clubs' },
                                { icon: '📍', label: 'Venues Managed', value: stats.totalVenues, sub: 'Real-time Booking' },
                            ].map((s, i) => (
                                <motion.div
                                    key={i}
                                    className="stat-card"
                                    variants={cardVariants}
                                    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.12)", borderColor: "var(--primary)", transition: { duration: 0.3 } }}
                                >
                                    <div className="stat-icon">{s.icon}</div>
                                    <h3>{s.label}</h3>
                                    <p className="stat-number"><AnimatedCounter value={s.value} /></p>
                                    <p className="stat-label">{s.sub}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section id="modules-section" className="modules-section">
                <div className="section-container">
                    <FadeUp once className="section-header">
                        <h2 className="section-title">Comprehensive Platform Modules</h2>
                        <p className="section-subtitle">Three integrated systems working together to deliver seamless campus management</p>
                    </FadeUp>

                    <div className="modules-grid">
                        {moduleData.map((mod, i) => (
                            <ModuleCard
                                key={i}
                                index={i}
                                onClick={() => handleModuleClick(mod.path)}
                                imgSrc={mod.imgSrc}
                                imgAlt={mod.imgAlt}
                                title={mod.title}
                                description={mod.description}
                                features={mod.features}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features-section" className="features-section">
                <div className="section-container">
                    <FadeUp once className="section-header">
                        <h2 className="section-title">Why Choose InfoNest?</h2>
                        <p className="section-subtitle">Built with best practices for security, reliability, and user experience</p>
                    </FadeUp>

                    <FeaturesGrid />
                </div>
            </section>

            {/* Footer */}
            <motion.footer
                id="footer"
                className="footer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <p>Made with ❤️ by InfoNest team</p>
            </motion.footer>
        </div>
    );
};

export default Home;