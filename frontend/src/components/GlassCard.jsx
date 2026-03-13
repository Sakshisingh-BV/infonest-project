import { motion } from 'framer-motion';
import './GlassCard.css'; // Inline for now, extract later

const GlassCard = ({ children, className = '', hoverScale = true, ...props }) => {
  return (
    <motion.div
      className={`glass-card ${className}`}
      whileHover={hoverScale ? { scale: 1.005, y: -2 } : {}}
      transition={{ duration: 0.2 }}
      style={{ maxWidth: '100%', overflow: 'visible', boxSizing: 'border-box' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

