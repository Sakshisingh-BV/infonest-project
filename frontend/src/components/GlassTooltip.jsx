import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GlassTooltip = ({ isVisible, bookings = [], position = {}, onClose }) => {
  const ref = useRef();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isVisible) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isVisible]);

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="glass-tooltip"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 1000,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tooltip-header">
          <h4>{bookings.length} Booking{bookings.length !== 1 ? 's' : ''}</h4>
        </div>
        <div className="tooltip-body">
          {bookings.map((b, i) => (
            <div key={i} className="booking-item">
              <span className="booking-time">{b.startTime} - {b.endTime}</span>
              <span>{b.eventName || b.purpose} ({b.venue?.name})</span>
            </div>
          ))}
        </div>
        <button className="tooltip-close" onClick={onClose}>✕</button>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default GlassTooltip;

