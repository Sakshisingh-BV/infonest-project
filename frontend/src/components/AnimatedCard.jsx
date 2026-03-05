import { motion } from 'framer-motion';

const AnimatedCard = ({
  children,
  className = '',
  delay = 0,
  interactive = true,
  ...props
}) => {
  return (
    <motion.div
      className={`card card-interactive ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={interactive ? { y: -8, boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)' } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
