import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/api';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import './Home.css';

/* ─── Animated Counter ────────────────────────────────── */
const AnimatedCounter = ({ value }) => {
    const [display, setDisplay] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: false, margin: '-80px' });

    useEffect(() => {
        if (!inView) return;
        let start;
        const dur = 1400;
        const step = (t) => {
            if (!start) start = t;
            const p = Math.min((t - start) / dur, 1);
            setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, value]);

    return <span ref={ref}>{display}</span>;
};

/* ─── Typewriter ──────────────────────────────────────── */
const Typewriter = ({ parts = [] }) => {
    const [text, setText] = useState('');
    const [partIdx, setPartIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [done, setDone] = useState(false);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        if (partIdx >= parts.length) { setDone(true); return; }
        const cur = parts[partIdx].text;
        if (charIdx < cur.length) {
            const t = setTimeout(() => {
                setText(prev => prev + cur[charIdx]);
                setCharIdx(c => c + 1);
            }, 36);
            return () => clearTimeout(t);
        } else { setPartIdx(p => p + 1); setCharIdx(0); }
    }, [inView, partIdx, charIdx, parts]);

    let consumed = 0;
    const segs = parts.map((p, i) => {
        const chunk = text.slice(consumed, consumed + p.text.length);
        consumed += p.text.length;
        return <span key={i} style={{ color: p.color }}>{chunk}</span>;
    });

    return (
        <span ref={ref}>
            {segs}
            {!done && <span className="tw-cursor">|</span>}
        </span>
    );
};

/* ─── Marquee ─────────────────────────────────────────── */
const Marquee = ({ items }) => (
    <div className="marquee-wrap">
        <div className="marquee-track">
            {[...items, ...items].map((item, i) => (
                <span key={i} className="marquee-item">
                    <span className="marquee-dot" />{item}
                </span>
            ))}
        </div>
    </div>
);

/* ─── Flip Card ───────────────────────────────────────── */
// Icons matching the video: person silhouette → calendar → map pin
const ICONS = ['👤', '📅', '📍'];

const FlipCard = ({ card, index, onNavigate }) => (
    <motion.div
        className={`flip-card flip-card--${index}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
        <div className="flip-card__inner">

            {/* FRONT */}
            <div className="flip-card__front">
                <div className="flip-card__front-icon">{ICONS[index]}</div>
                <h3 className="flip-card__front-title">{card.title}</h3>
                <div className="flip-card__front-hint">Click to explore →</div>
                <div className="flip-card__front-orb" />
            </div>

            {/* BACK */}
            <div className="flip-card__back">
                <div className="flip-card__back-header">
                    <h3 className="flip-card__back-title">{card.title}</h3>
                    <p className="flip-card__back-desc">{card.description}</p>
                    <ul className="flip-card__back-features">
                        {card.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <button
                    className="flip-card__back-cta"
                    onClick={() => onNavigate(card.path)}
                >
                    Explore Module →
                </button>
            </div>

        </div>
    </motion.div>
);

/* ─── Feature Grid ────────────────────────────────────── */
const FEATURES = [
    { icon: '⚡', title: 'Lightning Fast',       desc: 'Optimized performance ensures instant response times and smooth navigation.' },
    { icon: '🔒', title: 'Secure & Compliant',   desc: 'Role-based access control, encrypted data, and compliance for student privacy.' },
    { icon: '🔔', title: 'Real-time Updates',    desc: 'Instant notifications for bookings, approvals, and schedule changes.' },
    { icon: '👥', title: 'Multi-role Support',   desc: 'Tailored dashboards for students, faculty, admins, and office staff.' },
    { icon: '📊', title: 'Analytics & Reports',  desc: 'Comprehensive insights into event participation and venue utilization.' },
    { icon: '✔️',  title: 'Integrated Workflows', desc: 'Seamless synchronization between club events, schedules, and venues.' },
];

const SCATTER = [
    { x: -110, y: -75, rotate: -11 }, { x: 0, y: -130, rotate: 6 },
    { x: 110,  y: -75, rotate: 11  }, { x: -110, y: 75, rotate: 10 },
    { x: 0,    y: 130, rotate: -6  }, { x: 110,  y: 75, rotate: -11 },
];

const FeatureGrid = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: false, margin: '-60px' });
    return (
        <div ref={ref} className="feat-grid">
            {FEATURES.map((f, i) => (
                <motion.div
                    key={i} className="feat-item"
                    initial={{ opacity: 0, ...SCATTER[i], scale: 0.85 }}
                    animate={inView
                        ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
                        : { opacity: 0, ...SCATTER[i], scale: 0.85 }
                    }
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="feat-icon">{f.icon}</span>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                </motion.div>
            ))}
        </div>
    );
};

/* ─── Hero Visual — photo stat cards ─────────────────── */
const HeroVisual = ({ stats }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

    const items = [
        { label: 'Active Users',   value: stats.totalUsers,  sub: 'STUDENTS & FACULTY', icon: '👥', img: '/p1.jpeg' },
        { label: 'Total Events',   value: stats.totalEvents, sub: 'ACROSS ALL CLUBS',   icon: '📅', img: '/p2.jpeg' },
        { label: 'Venues Managed', value: stats.totalVenues, sub: 'REAL-TIME BOOKING',  icon: '📍', img: '/p3.jpeg' },
    ];

    return (
        <motion.div ref={ref} className="hero-visual" style={{ y }}>
            <div className="stat-cards-cluster">
                {items.map((s, i) => (
                    <motion.div
                        key={i}
                        className={`stat-pill stat-pill--${i}`}
                        style={{
                            backgroundImage: `url(${s.img})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.38 + i * 0.14, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="stat-pill__overlay" />
                        <div className="stat-pill__content">
                            <div className="stat-pill__icon">{s.icon}</div>
                            <div className="stat-pill__label">{s.label}</div>
                            <div className="stat-pill__divider" />
                            <div className="stat-pill__num"><AnimatedCounter value={s.value} /></div>
                            <div className="stat-pill__divider" />
                            <div className="stat-pill__sub">{s.sub}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

/* ─── Home ────────────────────────────────────────────── */
export default function Home() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, totalVenues: 0 });
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => { statsAPI.getStats().then(setStats).catch(() => {}); }, []);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const goToDashboard = () => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else if (user?.role === 'FACULTY') navigate('/faculty');
        else navigate('/dashboard');
    };

    const modules = [
        {
            path: '/clubs',
            title: 'Club Management',
            description: 'Comprehensive club oversight, event creation, and student engagement tools with ML-powered resume screening.',
            features: ['Event Management', 'Student Registration', 'Resume Screening', 'Faculty Dashboard'],
        },
        {
            path: '/schedule',
            title: 'Schedule Module',
            description: 'Real-time timetable viewing with integrated venue booking and location tracking for seamless coordination.',
            features: ['Live Timetables', 'Location Tracking', 'Conflict Detection', 'Auto-sync'],
        },
        {
            path: '/booking',
            title: 'Venue Booking',
            description: 'Classroom and event venue booking with role-based access and real-time availability across your campus.',
            features: ['Real-time Availability', 'Role-based Access', 'Auto-confirmation', 'Calendar Sync'],
        },
    ];

    const marqueeItems = [
        'Club Management', 'Event Scheduling', 'Venue Booking',
        'Student Registration', 'Live Timetables', 'Analytics Dashboard',
        'ML Resume Screening', 'Real-time Updates', 'Faculty Dashboard',
    ];

    return (
        <div className="homepage">

            {/* ── Nav ─────────────────────────────────────────── */}
            <nav className={`hn${scrolled ? ' hn--scrolled' : ''}`}>
                <div className="hn__inner">

                    {/* Logo */}
                    <Link to="/" className="hn__logo">
                        <img src="/logoo.png" alt="InfoNest" className="hn__logo-img" />
                        Info<em>Nest</em>
                    </Link>

                    {/* Links + actions */}
                    <div className={`hn__menu${menuOpen ? ' hn__menu--open' : ''}`}>
                        <a href="#modules-section" className="hn__link" onClick={() => setMenuOpen(false)}>Modules</a>
                        <a href="#features-section" className="hn__link" onClick={() => setMenuOpen(false)}>Features</a>
                        <a href="#footer" className="hn__link" onClick={() => setMenuOpen(false)}>Contact</a>

                        <div className="hn__actions">
                            {isAuthenticated ? (
                                <>
                                    <motion.div className="hn__avatar" whileHover={{ scale: 1.08 }}>
                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </motion.div>
                                    <span className="hn__username">{user?.firstName || ''}</span>
                                    <button className="btn-pill btn-pill--ghost" onClick={goToDashboard}>
                                        Dashboard
                                    </button>
                                    <button className="btn-pill btn-pill--danger" onClick={logout}>
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn-pill btn-pill--ghost">Sign In</Link>
                                    <Link to="/signup" className="btn-pill btn-pill--primary">Get Started</Link>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        className="hn__burger"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </nav>

            {/* ── Hero ────────────────────────────────────────── */}
            <section className="hero" id="hero-section">
                <div className="hero__inner">

                    {/* Left */}
                    <div className="hero__left">
                        <motion.div
                            className="hero__eyebrow"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.48 }}
                        >
                            <span className="eyebrow-dot" />
                            Campus Management Platform
                        </motion.div>

                        <motion.h1
                            className="hero__headline"
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.68, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Typewriter parts={[
                                { text: 'Streamline Your Campus\nManagement with\n', color: 'var(--h-text)' },
                                { text: 'Confidence',                                color: 'var(--primary)' },
                            ]} />
                        </motion.h1>

                        <motion.p
                            className="hero__sub"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.55 }}
                        >
                            InfoNest empowers educational institutions with a unified platform
                            for club management, event scheduling, and venue booking —
                            built for students, faculty, and admins.
                        </motion.p>

                        <motion.div
                            className="hero__btns"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.48 }}
                        >
                            <Link to="/signup" className="btn-pill btn-pill--primary btn-pill--lg">
                                Start Free →
                            </Link>
                            <a href="#modules-section" className="btn-pill btn-pill--outline btn-pill--lg">
                                See Modules
                            </a>
                        </motion.div>

                        <motion.div
                            className="hero__badges"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.74, duration: 0.48 }}
                        >
                            <span className="badge">🎓 University Ready</span>
                            <span className="badge">🔒 Secure</span>
                            <span className="badge">⚡ Real-time</span>
                        </motion.div>
                    </div>

                    {/* Right */}
                    <div className="hero__right">
                        <HeroVisual stats={stats} />
                    </div>
                </div>
            </section>

            {/* ── Marquee ─────────────────────────────────────── */}
            <div className="marquee-section">
                <Marquee items={marqueeItems} />
            </div>

            {/* ── Modules ─────────────────────────────────────── */}
            <section id="modules-section" className="modules-section">
                <div className="section-wrap">
                    <motion.div
                        className="section-head"
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="section-kicker">Platform Modules</span>
                        <h2 className="section-title">Everything You Need, In One Place</h2>
                    </motion.div>

                    <div className="module-cards-grid">
                        {modules.map((card, i) => (
                            <FlipCard
                                key={i}
                                card={card}
                                index={i}
                                onNavigate={path => navigate(path)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ────────────────────────────────────── */}
            <section id="features-section" className="features-section">
                <div className="section-wrap">
                    <motion.div
                        className="section-head"
                        initial={{ opacity: 0, y: 22 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="section-kicker">Why InfoNest</span>
                        <h2 className="section-title">Built for Modern Institutions</h2>
                        <p className="section-body">
                            Best-in-class security, reliability, and user experience crafted for campus life.
                        </p>
                    </motion.div>

                    <FeatureGrid />
                </div>
            </section>

            {/* ── Footer ──────────────────────────────────────── */}
            <footer id="footer" className="site-footer">
                <div className="site-footer__bar">
                    <div className="site-footer__bar-inner">
                        <Link to="/" className="site-footer__logo">
                            Info<span>Nest</span>
                        </Link>
                        <p className="site-footer__copy">
                            © {new Date().getFullYear()} InfoNest. Made with ❤️ for campuses everywhere.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}