import { motion } from 'framer-motion';

const EventFlipCard = ({ event, index, onAction, showDelete }) => {
  return (
    <motion.div
      className="event-flip-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5 }}
    >
      <div className="event-flip-card__inner">
        {/* Front */}
        <div className="event-flip-card__front">
          <div className="event-flip-card__front-header">
            <span className="event-date-badge">
              {event.eventDate ? new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBD'}
            </span>
            {event.hidden && <span className="event-hidden-badge">Hidden</span>}
          </div>
          
          <h3 className="event-flip-card__front-title">{event.eventName}</h3>
          <p className="event-flip-card__front-club">by {event.clubId || event.eventDate || ''}</p>
          
          <div className="event-flip-card__front-footer">
            <span className="event-cta">Click for details →</span>
          </div>
          
          <div className="event-flip-card__front-orb" />
        </div>

        {/* Back */}
        <div className="event-flip-card__back">
          <h3 className="event-flip-card__back-title">{event.eventName}</h3>
          
          <div className="event-flip-card__back-details">
            {event.eventDate && (
              <div className="detail-row">
                <span className="detail-label">📅 Date</span>
                <span className="detail-value">
                  {new Date(event.eventDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
            {event.eventTime && (
              <div className="detail-row">
                <span className="detail-label">⏰ Time</span>
                <span className="detail-value">{event.eventTime}</span>
              </div>
            )}
            {event.venueId && (
              <div className="detail-row">
                <span className="detail-label">📍 Venue</span>
                <span className="detail-value">{event.venueId}</span>
              </div>
            )}
            {event.deadline && (
              <div className="detail-row">
                <span className="detail-label">📝 Deadline</span>
                <span className="detail-value">
                  {new Date(event.deadline + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            )}
            {event.capacity && (
              <div className="detail-row">
                <span className="detail-label">👥 Capacity</span>
                <span className="detail-value">{event.capacity}</span>
              </div>
            )}
            {event.location && (
              <div className="detail-row">
                <span className="detail-label">📍 Location</span>
                <span className="detail-value">{event.location}</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="event-flip-card__back-desc">{event.description}</p>
          )}
          
          <div className="event-flip-card__back-actions">
            {showDelete ? (
              <button
                className="event-flip-card__back-cta delete"
                onClick={() => onAction && onAction(event)}
              >
                🗑️ Delete
              </button>
            ) : (
              <button
                className="event-flip-card__back-cta"
                onClick={() => onAction && onAction(event)}
              >
                View Details →
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventFlipCard;

