import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, push, update, onValue } from 'firebase/database'; // Added onValue import
import { database } from '../firebase';
import { toast } from 'react-toastify';
import MemoryCard from '../components/MemoryCard';
import { FriendsList, FriendRequest } from  '../components/FriendsList';
import ShareModal from '../components/ShareModal';
import { UserPlus } from 'lucide-react';

const MemoryWall = ({ user }) => {
  const [memories, setMemories] = useState([]);
  const [newMemory, setNewMemory] = useState({
    message: '',
    imageUrl: '',
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (!user) return;

    const memoriesRef = ref(database, 'memories');
    const unsubscribe = onValue(memoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const memoriesList = Object.entries(data)
          .map(([id, memory]) => ({
            id,
            ...memory,
          }))
          .filter(memory => 
            memory.userId === user.uid || 
            (memory.taggedFriends && memory.taggedFriends.some(f => f.uid === user.uid))
          );
        setMemories(memoriesList.reverse());
      } else {
        setMemories([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to share memories');
      return;
    }

    try {
      const memoriesRef = ref(database, 'memories');
      const newMemoryData = {
        ...newMemory,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        timestamp: new Date().toISOString(),
        taggedFriends: [],
      };
      
      const newMemoryRef = await push(memoriesRef, newMemoryData);
      setNewMemory({ message: '', imageUrl: '' });
      setShowShareModal(true);
      setSelectedMemory(newMemoryRef.key);
      toast.success('Memory shared successfully! 🎄');
    } catch (error) {
      toast.error('Failed to share memory');
    }
  };

  const handleTagFriend = async (memoryId, friends) => {
    if (!user) return;

    try {
      const memoryRef = ref(database, `memories/${memoryId}`);
      await update(memoryRef, {
        taggedFriends: friends
      });
      toast.success('Friends tagged successfully! 🤝');
      setShowTagModal(false);
    } catch (error) {
      toast.error('Failed to tag friends');
    }
  };

  const TagFriendsModal = ({ isOpen, onClose, onTag, memoryId }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Tag Friends</h3>
          <FriendsList 
            user={user}
            selectable={true}
            onSelect={(friends) => setSelectedFriends(friends)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              onClick={() => onTag(memoryId, selectedFriends)}
              className="px-4 py-2 bg-holiday-red text-white rounded-lg hover:bg-red-700"
            >
              Tag Friends
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to view and share memories</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8"
          >
            <h2 className="text-3xl font-bold mb-8 text-white">Holiday Memory Wall</h2>

            <form onSubmit={handleAddMemory} className="mb-8">
              <div className="space-y-4">
                <textarea
                  placeholder="Share your holiday memory..."
                  value={newMemory.message}
                  onChange={(e) => setNewMemory({ ...newMemory, message: e.target.value })}
                  className="input-field w-full"
                  rows="3"
                  required
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={newMemory.imageUrl}
                  onChange={(e) => setNewMemory({ ...newMemory, imageUrl: e.target.value })}
                  className="input-field w-full"
                />
              </div>
              <button type="submit" className="btn-primary mt-4">
                Share Memory
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memories.map((memory) => (
                <div key={memory.id} className="relative">
                  <MemoryCard memory={memory} currentUser={user} />
                  {memory.userId === user.uid && (
                    <button
                      onClick={() => {
                        setSelectedMemory(memory.id);
                        setShowTagModal(true);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                      title="Tag friends"
                    >
                      <UserPlus size={20} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-1">
          <FriendsList user={user} />
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={`${window.location.origin}/memory/${selectedMemory}`}
        title="Share this memory"
      />

      <TagFriendsModal
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setSelectedMemory(null);
          setSelectedFriends([]);
        }}
        onTag={handleTagFriend}
        memoryId={selectedMemory}
      />
    </div>
  );
};

export default MemoryWall;