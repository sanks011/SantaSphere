import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Wishlist from './pages/Wishlist';
import SecretSanta from './pages/SecretSanta';
import MemoryWall from './pages/MemoryWall';
import HolidayPlanner from './components/HolidayPlanner';
import SnowfallAnimation from './components/SnowfallAnimation';
import 'react-toastify/dist/ReactToastify.css';
import { FriendsList, FriendRequest } from  './components/FriendsList';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-holiday-pine to-holiday-green">
        <SnowfallAnimation />
        <Navbar user={user} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/wishlist" element={<Wishlist user={user} />} />
            <Route path="/secret-santa" element={<SecretSanta user={user} />} />
            <Route path="/memory-wall" element={<MemoryWall user={user} />} />
            <Route path="/planner" element={<HolidayPlanner user={user} />} />
            <Route path="/friends" element={<FriendsList user={user} />} />
            <Route path="/friend/:userId" element={<FriendRequest user={user} />} />
          </Routes>
        </main>
        <ToastContainer 
          position="bottom-right"
          theme="dark"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;