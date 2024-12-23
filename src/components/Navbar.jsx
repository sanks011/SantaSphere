import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';

const Navbar = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to SantaSphere! 🎅');
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('See you next time! 🎄');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="bg-holiday-pine/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-white flex items-center">
            <span className="text-holiday-gold">Santa</span>
            <span className="text-holiday-red">Sphere</span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/wishlist" className="text-white hover:text-holiday-gold transition">
              Wishlist
            </Link>
            <Link to="/secret-santa" className="text-white hover:text-holiday-gold transition">
              Secret Santa
            </Link>
            <Link to="/memory-wall" className="text-white hover:text-holiday-gold transition">
              Memory Wall
            </Link>
          </div>

          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                <button
                  onClick={handleLogout}
                  className="bg-holiday-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-holiday-gold text-holiday-pine px-4 py-2 rounded-lg hover:bg-yellow-500 transition"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <Link
              to="/wishlist"
              className="block text-white py-2 hover:text-holiday-gold transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Wishlist
            </Link>
            <Link
              to="/secret-santa"
              className="block text-white py-2 hover:text-holiday-gold transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Secret Santa
            </Link>
            <Link
              to="/memory-wall"
              className="block text-white py-2 hover:text-holiday-gold transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Memory Wall
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left text-white py-2 hover:text-holiday-gold transition"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full text-left text-white py-2 hover:text-holiday-gold transition"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;