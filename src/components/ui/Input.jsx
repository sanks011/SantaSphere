const Input = ({ className = '', ...props }) => {
    return (
      <input
        className={`input-field ${className}`}
        {...props}
      />
    );
  };
  
  export default Input;