import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

const Home = ({ user }) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const calculateRotation = (x, y) => {
    const deltaX = (x - windowSize.width / 2) / 50;
    const deltaY = (y - windowSize.height / 2) / 50;
    return { x: -deltaY, y: deltaX };
  };

  return (
    <>
      {user && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150}
          gravity={0.1}
          colors={['#FFD700', '#FF0000', '#00FF00', '#FFFFFF']}
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-white relative overflow-hidden">
        <motion.div
          animate={{
            rotateX: calculateRotation(mousePosition.x, mousePosition.y).x,
            rotateY: calculateRotation(mousePosition.x, mousePosition.y).y,
          }}
          transition={{ type: "spring", stiffness: 50 }}
          className="text-center perspective-1000"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              type: "spring",
              bounce: 0.5
            }}
            className="text-6xl font-bold mb-8 relative"
          >
            <motion.span
              animate={{ 
                color: ['#FFD700', '#FFA500', '#FFD700'],
                textShadow: ['0 0 10px #FFD700', '0 0 20px #FFA500', '0 0 10px #FFD700']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-holiday-gold"
            >
              Welcome to
            </motion.span>{' '}
            <motion.span
              animate={{
                color: ['#FF0000', '#FF4500', '#FF0000'],
                textShadow: ['0 0 10px #FF0000', '0 0 20px #FF4500', '0 0 10px #FF0000']
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="text-holiday-red"
            >
              SantaSphere
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl mb-12 max-w-2xl mx-auto"
          >
            Create and share holiday wishlists, organize Secret Santa exchanges, and capture
            magical moments with friends and family.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Wishlists",
                description: "Create and share your holiday wishlist with loved ones.",
                link: "/wishlist",
                buttonText: "Start Wishing",
                color: "holiday-gold",
                hoverColor: "yellow-500",
                textColor: "holiday-pine"
              },
              {
                title: "Secret Santa",
                description: "Organize a magical Secret Santa exchange with friends.",
                link: "/secret-santa",
                buttonText: "Join Exchange",
                color: "holiday-red",
                hoverColor: "red-700",
                textColor: "white"
              },
              {
                title: "Memory Wall",
                description: "Share and cherish holiday moments with your circle.",
                link: "/memory-wall",
                buttonText: "View Memories",
                color: "holiday-green",
                hoverColor: "green-700",
                textColor: "white"
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * index }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  boxShadow: "0 20px 30px rgba(0,0,0,0.2)"
                }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-xl transform-gpu"
              >
                <motion.h3
                  animate={{
                    color: [`#${Math.floor(Math.random()*16777215).toString(16)}`, `#${Math.floor(Math.random()*16777215).toString(16)}`]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-xl font-bold mb-4 text-${card.color}`}
                >
                  {card.title}
                </motion.h3>
                <p className="mb-4">{card.description}</p>
                <Link
                  to={card.link}
                  className={`inline-block bg-${card.color} text-${card.textColor} px-6 py-2 rounded-lg hover:bg-${card.hoverColor} transition-all duration-300 transform hover:-translate-y-1`}
                >
                  {card.buttonText}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;