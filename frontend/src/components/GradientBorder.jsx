import { motion } from 'framer-motion';

const GradientBorder = ({
  children,
  className = '',
  animated = true,
  ...props
}) => {
  return (
    <div
      className={`relative bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 p-[1px] rounded-2xl ${className}`}
      {...props}
    >
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 opacity-100"
          animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      )}
      <div className="relative bg-white rounded-2xl p-6">
        {children}
      </div>
    </div>
  );
};

export default GradientBorder;
