import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true }) => {
  const baseStyles = 'glass-card p-4';
  
  if (!animate) {
    return (
      <div className={`${baseStyles} ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${baseStyles} ${className} hover:scale-101 transition-transform duration-300`}
    >
      {children}
    </motion.div>
  );
};

export default Card;