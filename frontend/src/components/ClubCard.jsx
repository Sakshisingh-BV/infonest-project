import { useState } from 'react';
import { motion } from 'framer-motion';

const ClubCard = ({ club, onEdit, onDelete, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className="club-card-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <motion.div 
        className="club-card glass-card"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="card-face front">
          <div className="club-icon">C</div>
          <h4>{club.clubName}</h4>
          <p className="club-desc">{club.description || 'No description available'}</p>
          <span className="club-id">ID: {club.clubId}</span>
        </div>

        {/* Back */}
        <motion.div 
          className="card-face back"
          initial={{ rotateY: 180 }}
          animate={{ rotateY: isFlipped ? 0 : 180 }}
          style={{ position: 'absolute', backfaceVisibility: 'hidden', rotateY: 180 }}
        >
          <div className="card-actions">
            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); onEdit(club); }}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(club.clubId); }}>
              Delete
            </button>
            <button className="btn btn-secondary" onClick={() => setIsFlipped(false)}>
              Close
            </button>
          </div>
          <div className="status-info">
            <span>Status: Active</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ClubCard;

