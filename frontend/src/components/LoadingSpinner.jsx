import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', ring: 'border-2' },
    md: { container: 'w-12 h-12', ring: 'border-4' },
    lg: { container: 'w-16 h-16', ring: 'border-4' },
  };

  const { container, ring } = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${container} ${ring} border-gray-200 border-t-primary-500 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {message && <p className="text-muted text-sm font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
