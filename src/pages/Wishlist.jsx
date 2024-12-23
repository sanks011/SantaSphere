import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, push, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { toast } from 'react-toastify';

const Wishlist = ({ user }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '', link: '' });

  useEffect(() => {
    if (!user) return;

    const wishlistRef = ref(database, `wishlists/${user.uid}`);
    const unsubscribe = onValue(wishlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsList = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
        setItems(itemsList);
      } else {
        setItems([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a wishlist');
      return;
    }

    try {
      const wishlistRef = ref(database, `wishlists/${user.uid}`);
      await push(wishlistRef, newItem);
      setNewItem({ name: '', price: '', link: '' });
      toast.success('Item added to wishlist! 🎁');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const itemRef = ref(database, `wishlists/${user.uid}/${itemId}`);
      await remove(itemRef);
      toast.success('Item removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to create your wishlist</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-white">My Holiday Wishlist</h2>

        <form onSubmit={handleAddItem} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
              required
            />
            <input
              type="url"
              placeholder="Link (optional)"
              value={newItem.link}
              onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-holiday-gold text-holiday-pine px-6 py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Add to Wishlist
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/20 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">{item.name}</h3>
                  <p className="text-white/80">${item.price}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-holiday-gold hover:underline"
                    >
                      View Item
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-holiday-red hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Wishlist;