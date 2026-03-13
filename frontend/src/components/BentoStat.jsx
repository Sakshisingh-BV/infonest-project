import { motion } from 'framer-motion';

const BentoStat = ({ label, value, sub, img, progress = 0, className = '' }) => {
  return (
  <motion.div 
      className={`bento-stat ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5 }}
    >

      {img && <div className="stat-img" style={{ backgroundImage: `url(${img})` }} />}
      <div className="stat-content">
        <div className="stat-ring-container">
          <svg className="progress-ring" viewBox="0 0 36 36">
            <path
              className="progress-ring-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="progress-ring-circle"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="stat-value" textAnchor="middle">{value}</text>
          </svg>
        </div>
        <div className="stat-labels">
          <span className="stat-label">{label}</span>
          {sub && <span className="stat-sub">{sub}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default BentoStat;

