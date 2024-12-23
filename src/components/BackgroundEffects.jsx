import { useEffect } from 'react';

const BackgroundEffects = () => {
  useEffect(() => {
    // Create dynamic light spots
    const createLightSpot = () => {
      const spot = document.createElement('div');
      spot.className = 'absolute w-32 h-32 rounded-full blur-3xl';
      spot.style.background = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      spot.style.left = `${Math.random() * 100}%`;
      spot.style.top = `${Math.random() * 100}%`;
      spot.style.animation = `lightPulse ${3 + Math.random() * 5}s ease-in-out infinite`;
      return spot;
    };

    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none overflow-hidden';
    
    for (let i = 0; i < 10; i++) {
      container.appendChild(createLightSpot());
    }

    document.body.appendChild(container);

    return () => {
      document.body.removeChild(container);
    };
  }, []);

  return null;
};

export default BackgroundEffects;