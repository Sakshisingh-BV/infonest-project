import { motion } from 'framer-motion';

const AnimatedText = ({
  text,
  as = 'div',
  className = '',
  delay = 0,
  type = 'fade', // 'fade', 'slideUp', 'typewriter'
  duration = 0.6,
  ...props
}) => {
  const Component = motion[as];

  const variants = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    typewriter: {
      hidden: { width: 0 },
      visible: { width: 'auto' },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: delay,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      {...props}
    >
      {text.split('').map((char, i) => (
        <motion.span key={i} variants={itemVariants}>
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </Component>
  );
};

export default AnimatedText;
