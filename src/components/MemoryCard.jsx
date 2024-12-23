import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import { formatDate } from '../utils/dates';
import { UserPlus, X, Check } from 'lucide-react';

const MemoryCard = ({ memory, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const defaultImage = "/api/placeholder/400/320";

  // Image loading and error handling
  const handleImageError = () => {
    setImageError(true);
  };

  // Load friends when tag modal opens
  useEffect(() => {
    if (showTagModal && currentUser) {
      loadFriends();
    }
  }, [showTagModal, currentUser]);

  const loadFriends = async () => {
    setIsLoading(true);
    try {
      const friendsRef = ref(database, `friends/${currentUser.uid}`);
      const snapshot = await get(friendsRef);
      const friendsData = snapshot.val() || {};
      
      // Only get accepted friends
      const acceptedFriends = Object.values(friendsData)
        .filter(friend => friend.status === 'accepted');
      
      setFriends(acceptedFriends);
      
      // Pre-select already tagged friends
      if (memory.taggedFriends) {
        const taggedIds = new Set(memory.taggedFriends.map(f => f.uid));
        setSelectedFriends(taggedIds);
      }
    } catch (error) {
      console.error("Error loading friends:", error);
    }
    setIsLoading(false);
  };

  const handleTagFriends = async () => {
    try {
      const selectedFriendsData = friends
        .filter(friend => selectedFriends.has(friend.uid))
        .map(friend => ({
          uid: friend.uid,
          displayName: friend.displayName,
          photoURL: friend.photoURL
        }));

      // Update memory with tagged friends
      const updates = {};
      updates[`memories/${memory.id}/taggedFriends`] = selectedFriendsData;

      // Add notifications for tagged friends
      selectedFriendsData.forEach(friend => {
        const notificationKey = new Date().toISOString().replace(/[.]/g, '_');
        updates[`notifications/${friend.uid}/${notificationKey}`] = {
          type: 'memory_tag',
          memoryId: memory.id,
          from: currentUser.uid,
          fromName: currentUser.displayName,
          fromPhoto: currentUser.photoURL,
          message: `${currentUser.displayName} tagged you in a memory`,
          timestamp: new Date().toISOString(),
          status: 'unread'
        };
      });

      await update(ref(database), updates);
      setShowTagModal(false);
    } catch (error) {
      console.error("Error tagging friends:", error);
    }
  };

  const TagFriendsModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={() => setShowTagModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Tag Friends</h3>
          <button
            onClick={() => setShowTagModal(false)}
            className="text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-white/60">Loading friends...</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-4 text-white/60">No friends to tag</div>
        ) : (
          <div className="space-y-2">
            {friends.map(friend => (
              <motion.div
                key={friend.uid}
                className="flex items-center p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
                onClick={() => {
                  const newSelected = new Set(selectedFriends);
                  if (newSelected.has(friend.uid)) {
                    newSelected.delete(friend.uid);
                  } else {
                    newSelected.add(friend.uid);
                  }
                  setSelectedFriends(newSelected);
                }}
              >
                <div className="flex items-center flex-1">
                  <img
                    src={friend.photoURL || defaultImage}
                    alt={friend.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="ml-3 text-white">{friend.displayName}</span>
                </div>
                <div className={`w-5 h-5 rounded border ${
                  selectedFriends.has(friend.uid)
                    ? 'bg-holiday-gold border-holiday-gold'
                    : 'border-white/30'
                }`}>
                  {selectedFriends.has(friend.uid) && (
                    <Check className="text-black" size={16} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleTagFriends}
            disabled={selectedFriends.size === 0}
            className="btn-primary px-4 py-2 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Tag Selected Friends
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      layout
      className="memory-card relative bg-white/5 rounded-lg overflow-hidden"
      whileHover={{ scale: 1.02, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      onClick={() => setIsExpanded(!isExpanded)}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <AnimatePresence>
        {memory.imageUrl && !imageError && (
          <motion.div 
            className="memory-image-container relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              src={memory.imageUrl || defaultImage}
              alt={memory.message || "Memory"}
              className="w-full h-64 object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
            
            {/* Image overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* Tagged friends overlay */}
            {memory.taggedFriends?.length > 0 && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="absolute top-2 left-2 flex -space-x-2"
              >
                {memory.taggedFriends.map((friend, index) => (
                  <motion.div
                    key={friend.uid}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <img
                      src={friend.photoURL || defaultImage}
                      alt={friend.displayName}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-lg transform transition-transform group-hover:scale-110"
                      title={friend.displayName}
                    />
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {friend.displayName}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className={`p-4 bg-white/10 backdrop-blur-md rounded-b-lg ${isExpanded ? 'min-h-[200px]' : ''}`}
        layout
      >
        <motion.div 
          className="flex items-center mb-4"
          layout
        >
          <motion.img
            src={memory.userPhoto || defaultImage}
            alt={memory.userName}
            className="w-10 h-10 rounded-full border-2 border-holiday-gold shadow-lg"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <div className="ml-3">
            <motion.p 
              className="font-semibold text-white"
              layout
            >
              {memory.userName}
            </motion.p>
            <motion.p 
              className="text-sm text-white/60"
              layout
            >
              {formatDate(memory.timestamp)}
            </motion.p>
          </div>
        </motion.div>
        
        <motion.p 
          className="text-white mb-4"
          layout
        >
          {memory.message}
        </motion.p>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTagModal(true);
                }}
                className="btn-secondary text-sm bg-holiday-gold text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus className="inline-block mr-2" size={18} />
                Tag Friends
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showTagModal && <TagFriendsModal />}
      </AnimatePresence>
    </motion.div>
  );
};

export default MemoryCard;