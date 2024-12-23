const Button = ({ 
    children, 
    variant = 'primary', 
    className = '', 
    ...props 
  }) => {
    const baseStyles = 'px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105';
    const variants = {
      primary: 'bg-holiday-gold text-holiday-pine hover:bg-yellow-500',
      secondary: 'bg-holiday-red text-white hover:bg-red-700',
      outline: 'border-2 border-white/20 text-white hover:bg-white/10'
    };
  
    return (
      <button 
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };
  
  export default Button;