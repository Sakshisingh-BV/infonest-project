import { motion, AnimatePresence } from 'framer-motion';

const AlertBanner = ({ 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title = '',
  message,
  onClose,
  duration = 5000,
  showIcon = true,
}) => {
  const variants = {
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: '✓',
    },
    error: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '✕',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '⚠',
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'ℹ',
    },
  };

  const style = variants[type];

  return (
    <AnimatePresence>
      <motion.div
        className={`alert ${style.bg} ${style.text} ${style.border} border rounded-lg overflow-hidden`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3 p-4">
          {showIcon && (
            <div className="text-xl font-bold flex-shrink-0">
              {style.icon}
            </div>
          )}
          <div className="flex-1">
            {title && <h4 className="font-semibold text-sm mb-1">{title}</h4>}
            <p className="text-sm">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xl font-bold opacity-50 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          )}
        </div>

        {/* Auto-close progress bar */}
        {duration && (
          <motion.div
            className={`h-1 ${style.text} opacity-50`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
            onAnimationComplete={onClose}
            style={{ transformOrigin: 'left' }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AlertBanner;
