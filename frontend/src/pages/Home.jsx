import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI } from '../services/api';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './Home.css';

/* ─── SVG Icons ───────────────────────────────────────── */
const IcHome     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const IcModules  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcFeatures = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IcContact  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 11.9a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 8 8l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcUser     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>;
const IcLogout   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcLogin    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const IcSignup   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;

/* ─── Animated Counter ────────────────────────────────── */
const AnimatedCounter = ({ value }) => {
    const [display, setDisplay] = useState(0);
    const ref  = useRef(null);
    const inView = useInView(ref, { once: false, margin: '-80px' });
    useEffect(() => {
        if (!inView) return;
        let start;
        const dur = 1400;
        const step = t => {
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
            const t = setTimeout(() => { setText(p => p + cur[charIdx]); setCharIdx(c => c + 1); }, 36);
            return () => clearTimeout(t);
        } else { setPartIdx(p => p + 1); setCharIdx(0); }
    }, [inView, partIdx, charIdx, parts]);
    let consumed = 0;
    const segs = parts.map((p, i) => {
        const chunk = text.slice(consumed, consumed + p.text.length);
        consumed += p.text.length;
        return <span key={i} style={{ color: p.color }}>{chunk}</span>;
    });
    return <span ref={ref}>{segs}{!done && <span className="tw-cursor">|</span>}</span>;
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
const CARD_SVG = [
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
];

const FlipCard = ({ card, index, onNavigate }) => (
    <motion.div
        className={`flip-card flip-card--${index}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
        <div className="flip-card__inner">
            <div className="flip-card__front">
                <div className="flip-card__front-icon">{CARD_SVG[index]}</div>
                <h3 className="flip-card__front-title">{card.title}</h3>
                <div className="flip-card__front-hint">Hover to explore →</div>
                <div className="flip-card__front-orb" />
            </div>
            <div className="flip-card__back">
                <div className="flip-card__back-header">
                    <h3 className="flip-card__back-title">{card.title}</h3>
                    <p className="flip-card__back-desc">{card.description}</p>
                    <ul className="flip-card__back-features">
                        {card.features.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                </div>
                <button className="flip-card__back-cta" onClick={() => onNavigate(card.path)}>
                    Explore Module →
                </button>
            </div>
        </div>
    </motion.div>
);

/* ─── Feature Grid ────────────────────────────────────── */
const FEAT_SVG = [
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
];
const FEATURES = [
    { title: 'Lightning Fast',       desc: 'Optimized performance ensures instant response times and smooth navigation.' },
    { title: 'Secure & Compliant',   desc: 'Role-based access control, encrypted data, and compliance for student privacy.' },
    { title: 'Real-time Updates',    desc: 'Instant notifications for bookings, approvals, and schedule changes.' },
    { title: 'Multi-role Support',   desc: 'Tailored dashboards for students, faculty, admins, and office staff.' },
    { title: 'Analytics & Reports',  desc: 'Comprehensive insights into event participation and venue utilization.' },
    { title: 'Integrated Workflows', desc: 'Seamless synchronization between club events, schedules, and venues.' },
];
const SCATTER = [
    { x: -110, y: -75, rotate: -11 }, { x: 0,    y: -130, rotate: 6  },
    { x: 110,  y: -75, rotate: 11  }, { x: -110, y: 75,   rotate: 10 },
    { x: 0,    y: 130, rotate: -6  }, { x: 110,  y: 75,   rotate: -11 },
];

const FeatureGrid = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: false, margin: '-60px' });
    return (
        <div ref={ref} className="feat-grid">
            {FEATURES.map((f, i) => (
                <motion.div key={i} className="feat-item"
                    initial={{ opacity: 0, ...SCATTER[i], scale: 0.85 }}
                    animate={inView ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 } : { opacity: 0, ...SCATTER[i], scale: 0.85 }}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="feat-icon">{FEAT_SVG[i]}</span>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                </motion.div>
            ))}
        </div>
    );
};

/* ─── Hero Visual ─────────────────────────────────────── */
const HeroVisual = ({ stats }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
    const items = [
        { label: 'Active Users',   value: stats.totalUsers,  sub: 'STUDENTS & FACULTY', img: '/p1.jpeg' },
        { label: 'Total Events',   value: stats.totalEvents, sub: 'ACROSS ALL CLUBS',   img: '/p2.jpeg' },
        { label: 'Venues Managed', value: stats.totalVenues, sub: 'REAL-TIME BOOKING',  img: '/p3.jpeg' },
    ];
    return (
        <motion.div ref={ref} className="hero-visual" style={{ y }}>
            <div className="stat-cards-cluster">
                {items.map((s, i) => (
                    <motion.div key={i} className={`stat-pill stat-pill--${i}`}
                        style={{ backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        initial={{ opacity: 0, x: 40, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.38 + i * 0.14, duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="stat-pill__overlay" />
                        <div className="stat-pill__content">
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

/* ─── Network Map Background ──────────────────────────────
   Clean topology map — fewer nodes, solid lines with a
   glowing light-sweep travelling along each connection.
   No moving dots. Just the line itself illuminating.
   ──────────────────────────────────────────────────────── */
/* ─── Interactive Light Network Background ──────────────── */
const NetworkMapBackground = () => {
    const canvasRef = useRef(null);
    const mouseRef  = useRef({ x: -9999, y: -9999 });
    const rafRef    = useRef(null);
    const { scrollY } = useScroll();
    const bgOpacity = useTransform(scrollY, [400, 900], [1, 0.05]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = 0, H = 0;
        const setSize = () => {
            const dpr = window.devicePixelRatio || 1;
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width  = W * dpr;
            canvas.height = H * dpr;
            ctx.scale(dpr, dpr);
        };
        setSize();

        const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        const onClick = e => {
            // Find nearest node and trigger a "burst" of packets
            let nearestIdx = -1, minD = 120;
            nodes.forEach((n, i) => {
                const d = Math.hypot(n.x - e.clientX, n.y - e.clientY);
                if (d < minD) { minD = d; nearestIdx = i; }
            });
            if (nearestIdx !== -1) triggerBurst(nearestIdx);
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('click', onClick);
        window.addEventListener('resize', setSize);

        let nodes = [], edges = [], packets = [];

        const build = () => {
            nodes = []; edges = [];
            const cols = 10, rows = 8; // Increased density for more "popped" effect
            for(let i=0; i<cols; i++) {
                for(let j=0; j<rows; j++) {
                    nodes.push({
                        x: (i + 0.5) * (W/cols) + (Math.random()-0.5)*60, // Reduced jitter for cleaner look
                        y: (j + 0.5) * (H/rows) + (Math.random()-0.5)*60,
                        r: 1.5 + Math.random() * 1.5, // Smaller nodes for density
                        driftX: (Math.random() - 0.5) * 0.3, // Add slight drift
                        driftY: (Math.random() - 0.5) * 0.3,
                    });
                }
            }
            nodes.forEach((n1, i) => {
                nodes.forEach((n2, j) => {
                    if (i <= j) return;
                    const d = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                    if (d < 250) edges.push({ a: i, b: j, d }); // Slightly larger connection radius
                });
            });
        };

        const triggerBurst = (idx) => {
            // Send packets to all connected neighbors
            edges.forEach(e => {
                if (e.a === idx || e.b === idx) {
                    const target = e.a === idx ? e.b : e.a;
                    packets.push({ from: idx, to: target, progress: 0, speed: 0.015 + Math.random()*0.01, type: 'burst' });
                }
            });
        };

        build();

        const draw = () => {
            ctx.clearRect(0, 0, W, H);
            const { x: mx, y: my } = mouseRef.current;

// Update node positions for subtle drifting
            nodes.forEach(n => {
                n.x += n.driftX;
                n.y += n.driftY;

                // Bounce off edges
                if (n.x < 0 || n.x > W) n.driftX *= -1;
                if (n.y < 0 || n.y > H) n.driftY *= -1;

                // Keep within bounds
                n.x = Math.max(0, Math.min(W, n.x));
                n.y = Math.max(0, Math.min(H, n.y));
            });

            // Draw Lines (More visible, thicker)
            ctx.lineWidth = 0.8; // Base thickness
            edges.forEach(e => {
                const n1 = nodes[e.a], n2 = nodes[e.b];
                const dToMouse = Math.hypot((n1.x+n2.x)/2 - mx, (n1.y+n2.y)/2 - my);
                const alpha = Math.max(0.08, 0.5 - e.d/300); // More visible base alpha

                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);

                if (dToMouse < 120) {
                    // Hover effect: thicker, more vibrant lines
                    ctx.strokeStyle = `rgba(37, 99, 235, ${Math.min(0.8, alpha * 2)})`;
                    ctx.lineWidth = 1.5;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = 'rgba(37, 99, 235, 0.4)';
                } else {
                    ctx.strokeStyle = `rgba(203, 213, 225, ${alpha})`; // Light grey base
                    ctx.lineWidth = 0.8;
                    ctx.shadowBlur = 0;
                }
                ctx.stroke();
                ctx.shadowBlur = 0; // Reset shadow
            });

            // Draw Packets (Moving dots)
            packets = packets.filter(p => {
                p.progress += p.speed;
                const n1 = nodes[p.from], n2 = nodes[p.to];
                const px = n1.x + (n2.x - n1.x) * p.progress;
                const py = n1.y + (n2.y - n1.y) * p.progress;

                ctx.beginPath();
                ctx.arc(px, py, p.type === 'burst' ? 4 : 2.5, 0, Math.PI * 2);
                ctx.fillStyle = p.type === 'burst' ? '#ffffff' : '#2563eb';
                ctx.shadowBlur = 8;
                ctx.shadowColor = p.type === 'burst' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(37, 99, 235, 0.6)';
                ctx.fill();
                ctx.shadowBlur = 0;

                return p.progress < 1;
            });

            // More frequent ambient packets
            if(Math.random() > 0.90) { // Increased frequency
                const e = edges[Math.floor(Math.random() * edges.length)];
                packets.push({ from: e.a, to: e.b, progress: 0, speed: 0.008 + Math.random()*0.01 });
            }

// Draw Nodes with enhanced glow
            nodes.forEach(n => {
                const dToMouse = Math.hypot(n.x - mx, n.y - my);
                const isHover = dToMouse < 60;

                // Enhanced glow ring for visibility
                if (isHover) {
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(37, 99, 235, 0.12)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
                    ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, isHover ? n.r * 1.8 : n.r, 0, Math.PI * 2);
                ctx.fillStyle = isHover ? '#2563eb' : '#93c5fd';
                ctx.fill();
            });

            rafRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', setSize);
        };
    }, []);

    return (
        <motion.div className="flow-bg" style={{ opacity: bgOpacity }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </motion.div>
    );
};

/* ─── Nav Item Component ──────────────────────────────── */
const NavItem = ({ icon, label, href, onClick, variant, expanded }) => {
    const cls = `vn-item${variant ? ` vn-item--${variant}` : ''}`;
    const inner = (
        <motion.span className={cls} whileTap={{ scale: 0.93 }}>
            <span className="vn-item__icon">{icon}</span>
            <AnimatePresence>
                {expanded && (
                    <motion.span
                        className="vn-item__label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.span>
    );
    if (href)    return <a       href={href}    className="vn-link">{inner}</a>;
    if (onClick) return <button  onClick={onClick} className="vn-link vn-btn">{inner}</button>;
    return inner;
};

/* ─── Home Page ───────────────────────────────────────── */
export default function Home() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate  = useNavigate();
    const [stats, setStats]         = useState({ totalUsers: 0, totalEvents: 0, totalVenues: 0 });
    const [navExpanded, setNavExp]  = useState(false);

    useEffect(() => { statsAPI.getStats().then(setStats).catch(() => {}); }, []);

    const goToDashboard = () => {
        if (user?.role === 'ADMIN') navigate('/admin');
        else if (user?.role === 'FACULTY') navigate('/faculty');
        else navigate('/dashboard');
    };

    const modules = [
        { path: '/clubs',    title: 'Club Management', description: 'Comprehensive club oversight, event creation, and student engagement tools with ML-powered resume screening.', features: ['Event Management', 'Student Registration', 'Resume Screening', 'Faculty Dashboard'] },
        { path: '/schedule', title: 'Schedule Module',  description: 'Real-time timetable viewing with integrated venue booking and location tracking for seamless coordination.',   features: ['Live Timetables', 'Location Tracking', 'Conflict Detection', 'Auto-sync'] },
        { path: '/booking',  title: 'Venue Booking',    description: 'Classroom and event venue booking with role-based access and real-time availability across your campus.',     features: ['Real-time Availability', 'Role-based Access', 'Auto-confirmation', 'Calendar Sync'] },
    ];

    const marqueeItems = [
        'Club Management', 'Event Scheduling', 'Venue Booking', 'Student Registration',
        'Live Timetables', 'Analytics Dashboard', 'ML Resume Screening', 'Real-time Updates', 'Faculty Dashboard',
    ];

    const NAV_W_CLOSED = 64;
    const NAV_W_OPEN   = 192;

    return (
        <div className="homepage">

            {/* ── Side Nav ──────────────────────────────────────── */}
            <motion.nav
                className="vn"
                onMouseEnter={() => setNavExp(true)}
                onMouseLeave={() => setNavExp(false)}
                animate={{ width: navExpanded ? NAV_W_OPEN : NAV_W_CLOSED }}
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Logo */}
                <Link to="/" className="vn-logo">
                    <span className="vn-logo__mark">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                            <path d="M9 21V12h6v9"/>
                        </svg>
                    </span>
                    <AnimatePresence>
                        {navExpanded && (
                            <motion.span className="vn-logo__wordmark"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8 }}
                                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                            >InfoNest</motion.span>
                        )}
                    </AnimatePresence>
                </Link>

                <div className="vn-divider" />

                {/* Nav links */}
                <nav className="vn-menu">
                    <NavItem icon={<IcHome />}     label="Home"     href="#hero-section"     expanded={navExpanded} />
                    <NavItem icon={<IcModules />}  label="Modules"  href="#modules-section"  expanded={navExpanded} />
                    <NavItem icon={<IcFeatures />} label="Features" href="#features-section" expanded={navExpanded} />
                    <NavItem icon={<IcContact />}  label="Contact"  href="#footer"           expanded={navExpanded} />
                </nav>

                <div className="vn-divider" style={{ marginTop: 'auto' }} />

                {/* Auth actions */}
                <div className="vn-actions">
                    {isAuthenticated ? (
                        <>
                            <NavItem icon={<IcUser />}   label="Dashboard" onClick={goToDashboard} expanded={navExpanded} />
                            <NavItem icon={<IcLogout />} label="Logout"    onClick={logout}        expanded={navExpanded} variant="danger" />
                        </>
                    ) : (
                        <>
                            <Link to="/login"  className="vn-link"><motion.span className="vn-item" whileTap={{ scale: 0.93 }}><span className="vn-item__icon"><IcLogin /></span><AnimatePresence>{navExpanded && <motion.span className="vn-item__label" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}>Sign In</motion.span>}</AnimatePresence></motion.span></Link>
                            <Link to="/signup" className="vn-link"><motion.span className="vn-item vn-item--primary" whileTap={{ scale: 0.93 }}><span className="vn-item__icon"><IcSignup /></span><AnimatePresence>{navExpanded && <motion.span className="vn-item__label" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}>Get Started</motion.span>}</AnimatePresence></motion.span></Link>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* ── Main Content ──────────────────────────────────── */}
            <motion.div
                className="main-content"
                animate={{ marginLeft: navExpanded ? NAV_W_OPEN : NAV_W_CLOSED }}
                transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
            >
                <NetworkMapBackground />

                {/* Hero */}
                <section className="hero" id="hero-section">
                    <div className="hero__inner">
                        <div className="hero__left">
                            <motion.div className="hero__eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48 }}>
                                <span className="eyebrow-dot" />
                                Campus Management Platform
                            </motion.div>
                            <motion.h1 className="hero__headline" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.68, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
                                <Typewriter parts={[
                                    { text: 'Streamline Your Campus\nManagement with\n', color: 'var(--h-text)' },
                                    { text: 'Confidence', color: 'var(--primary)' },
                                ]} />
                            </motion.h1>
                            <motion.p className="hero__sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.55 }}>
                                InfoNest empowers educational institutions with a unified platform for club management,
                                event scheduling, and venue booking — built for students, faculty, and admins.
                            </motion.p>
                            <motion.div className="hero__btns" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.48 }}>
                                <Link to="/signup" className="btn-pill btn-pill--primary btn-pill--lg">Start Free →</Link>
                                <a href="#modules-section" className="btn-pill btn-pill--outline btn-pill--lg">See Modules</a>
                            </motion.div>
                            <motion.div className="hero__badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.74, duration: 0.48 }}>
                                <span className="badge">University Ready</span>
                                <span className="badge">Secure</span>
                                <span className="badge">Real-time</span>
                            </motion.div>
                        </div>
                        <div className="hero__right"><HeroVisual stats={stats} /></div>
                    </div>
                </section>

                {/* Marquee */}
                <div className="marquee-section"><Marquee items={marqueeItems} /></div>

                {/* Modules */}
                <section id="modules-section" className="modules-section">
                    <div className="section-wrap">
                        <motion.div className="section-head" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}>
                            <span className="section-kicker">Platform Modules</span>
                            <h2 className="section-title">Everything You Need, In One Place</h2>
                        </motion.div>
                        <div className="module-cards-grid">
                            {modules.map((card, i) => <FlipCard key={i} card={card} index={i} onNavigate={path => navigate(path)} />)}
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features-section" className="features-section">
                    <div className="section-wrap">
                        <motion.div className="section-head" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}>
                            <span className="section-kicker">Why InfoNest</span>
                            <h2 className="section-title">Built for Modern Institutions</h2>
                            <p className="section-body">Best-in-class security, reliability, and user experience crafted for campus life.</p>
                        </motion.div>
                        <FeatureGrid />
                    </div>
                </section>

                {/* Footer */}
                <footer id="footer" className="site-footer">
                    <div className="site-footer__bar">
                        <div className="site-footer__bar-inner">
                            <Link to="/" className="site-footer__logo">Info<span>Nest</span></Link>
                            <p className="site-footer__copy">© {new Date().getFullYear()} InfoNest. Made with care for campuses everywhere.</p>
                        </div>
                    </div>
                </footer>
            </motion.div>
        </div>
    );
}