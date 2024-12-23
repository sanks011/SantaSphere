import { useEffect, useState } from 'react';

const SnowfallAnimation = () => {
  const [snowflakes, setSnowflakes] = useState([]);

  useEffect(() => {
    const createSnowflake = () => ({
      id: Math.random(),
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 8}s`,
      opacity: Math.random(),
      size: `${Math.random() * 10 + 5}px`,
    });

    const generateSnowflakes = () => {
      const flakes = Array.from({ length: 50 }, createSnowflake);
      setSnowflakes(flakes);
    };

    generateSnowflakes();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snow-fall"
          style={{
            left: flake.left,
            animationDuration: flake.animationDuration,
            opacity: flake.opacity,
            width: flake.size,
            height: flake.size,
            background: 'white',
            borderRadius: '50%',
          }}
        />
      ))}
    </div>
  );
};

export default SnowfallAnimation;