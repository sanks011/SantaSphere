import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update, get, set } from 'firebase/database';
import { Share2, Check, X, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import ShareModal from '../components/ShareModal';
import { database } from '../firebase';

// Helper function to create a Firebase-safe timestamp key
const createTimestampKey = () => {
  return new Date().toISOString().replace(/[.]/g, '_').replace(/[:/]/g, '-');
};

// Helper function to ensure user data is saved
const ensureUserDataSaved = async (user) => {
  if (!user) return;
  
  const userRef = ref(database, `users/${user.uid}`);
  await set(userRef, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    lastUpdated: new Date().toISOString()
  });
};

// FriendRequest Component
const FriendRequest = ({ user }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [friendData, setFriendData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  useEffect(() => {
    const loadFriendData = async () => {
      if (!user) return;
      
      if (userId === user.uid) {
        setError("You can't send a friend request to yourself");
        setIsLoading(false);
        return;
      }

      try {
        // First, ensure current user's data is saved
        await ensureUserDataSaved(user);

        // Check existing friend status
        const friendStatusRef = ref(database, `friends/${user.uid}/${userId}`);
        const statusSnapshot = await get(friendStatusRef);
        if (statusSnapshot.exists()) {
          setRequestStatus(statusSnapshot.val().status);
        }

        // Then get friend's data
        const friendRef = ref(database, `users/${userId}`);
        const snapshot = await get(friendRef);
        
        if (snapshot.exists()) {
          setFriendData(snapshot.val());
        } else {
          setError("User hasn't used the app yet");
        }
      } catch (err) {
        console.error("Error loading friend data:", err);
        setError("Failed to load user data");
      }
      setIsLoading(false);
    };

    loadFriendData();
  }, [userId, user]);

  const handleSendRequest = async () => {
    if (!user || !friendData) return;

    try {
      const timestamp = new Date().toISOString();
      const timestampKey = createTimestampKey();
      
      // Check if request already exists
      const friendCheckRef = ref(database, `friends/${user.uid}/${userId}`);
      const friendCheckSnapshot = await get(friendCheckRef);
      
      if (friendCheckSnapshot.exists()) {
        setError("Friend request already sent or you're already friends");
        return;
      }

      const updates = {};
      
      // Save both users' data if they haven't been saved yet
      updates[`users/${user.uid}`] = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastUpdated: timestamp
      };

      updates[`users/${userId}`] = {
        ...friendData,
        lastUpdated: timestamp
      };

      // Add friend request records
      updates[`friends/${user.uid}/${userId}`] = {
        uid: userId,
        email: friendData.email,
        displayName: friendData.displayName,
        photoURL: friendData.photoURL,
        status: 'sent',
        timestamp
      };

      updates[`friends/${userId}/${user.uid}`] = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: 'pending',
        timestamp
      };

      await update(ref(database), updates);
      navigate('/friends');
    } catch (err) {
      console.error("Error sending friend request:", err);
      setError("Failed to send friend request");
    }
  };

  const getRequestStatusButton = () => {
    switch (requestStatus) {
      case 'sent':
        return (
          <button disabled className="w-full btn-secondary py-2 opacity-75">
            Request Sent
          </button>
        );
      case 'pending':
        return (
          <button disabled className="w-full btn-secondary py-2 opacity-75">
            Request Pending
          </button>
        );
      case 'accepted':
        return (
          <button disabled className="w-full btn-secondary py-2 opacity-75">
            Already Friends
          </button>
        );
      default:
        return (
          <button
            onClick={handleSendRequest}
            disabled={isLoading}
            className="w-full btn-primary py-2 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            Send Friend Request
          </button>
        );
    }
  };

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to send friend requests</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-white py-12">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-2xl text-red-500">{error}</h2>
      </div>
    );
  }

  if (!friendData) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 relative"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Send Friend Request</h2>
        
        <div className="flex items-center mb-6">
          <img
            src={friendData.photoURL}
            alt={friendData.displayName}
            className="w-16 h-16 rounded-full border-2 border-holiday-gold"
          />
          <div className="ml-4">
            <h3 className="text-xl text-white">{friendData.displayName}</h3>
          </div>
        </div>

        {getRequestStatusButton()}
      </motion.div>
    </div>
  );
};

// FriendsList Component
const FriendsList = ({ user }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingFriend, setAcceptingFriend] = useState(null);
  const [decliningFriend, setDecliningFriend] = useState(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const setup = async () => {
      try {
        await ensureUserDataSaved(user);
        
        const friendsRef = ref(database, `friends/${user.uid}`);
        return onValue(friendsRef, (snapshot) => {
          const data = snapshot.val() || {};
          const allFriends = Object.values(data);
          setFriends(allFriends.filter(f => f.status === 'accepted'));
          setPendingRequests(allFriends.filter(f => f.status === 'pending'));
          setSentRequests(allFriends.filter(f => f.status === 'sent'));
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error setting up friends list:", error);
        setIsLoading(false);
      }
    };

    setup();
  }, [user]);

  const handleAcceptFriend = async (friendId) => {
    if (acceptingFriend) return;
    
    try {
      setAcceptingFriend(friendId);
      const timestamp = new Date().toISOString();
      const timestampKey = createTimestampKey();
      
      const friendRef = ref(database, `users/${friendId}`);
      const friendSnapshot = await get(friendRef);
      const friendData = friendSnapshot.val();

      if (!friendData) {
        console.error("Friend data not found");
        return;
      }

      const updates = {};
      
      updates[`friends/${user.uid}/${friendId}`] = {
        uid: friendId,
        email: friendData.email,
        displayName: friendData.displayName,
        photoURL: friendData.photoURL,
        status: 'accepted',
        timestamp
      };

      updates[`friends/${friendId}/${user.uid}`] = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: 'accepted',
        timestamp
      };
      
      // Use the safe timestamp key for notifications
      updates[`notifications/${friendId}/${timestampKey}`] = {
        type: 'friend_accepted',
        from: user.uid,
        fromName: user.displayName,
        fromPhoto: user.photoURL,
        status: 'unread',
        timestamp
      };

      await update(ref(database), updates);
    } catch (err) {
      console.error("Error accepting friend request:", err);
    } finally {
      setAcceptingFriend(null);
    }
  };

  const handleDeclineFriend = async (friendId) => {
    if (decliningFriend) return;
    
    try {
      setDecliningFriend(friendId);
      const updates = {};
      updates[`friends/${user.uid}/${friendId}`] = null;
      updates[`friends/${friendId}/${user.uid}`] = null;
      await update(ref(database), updates);
    } catch (err) {
      console.error("Error declining friend request:", err);
    } finally {
      setDecliningFriend(null);
    }
  };

  const getFriendInviteUrl = () => {
    return `${window.location.origin}/friend/${user.uid}`;
  };

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to view friends</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-white py-12">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Friends</h3>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition"
        >
          <Share2 size={18} />
          <span>Share Profile</span>
        </button>
      </div>
      
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white/80 text-sm mb-2">Pending Requests</h4>
          {pendingRequests.map((request) => (
            <motion.div
              key={request.uid}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-2 bg-white/5 rounded-lg mb-2"
            >
              <div className="flex items-center flex-1 min-w-0">
                <img
                  src={request.photoURL}
                  alt={request.displayName}
                  className="w-8 h-8 rounded-full border-2 border-yellow-500 flex-shrink-0"
                />
                <span className="ml-2 text-white truncate">{request.displayName}</span>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button
                  onClick={() => handleAcceptFriend(request.uid)}
                  disabled={acceptingFriend === request.uid}
                  className={`btn-primary text-sm flex items-center gap-1 px-3 py-1 ${
                    acceptingFriend === request.uid ? 'opacity-50' : ''
                  }`}
                >
                  <Check size={14} />
                  {acceptingFriend === request.uid ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  onClick={() => handleDeclineFriend(request.uid)}
                  disabled={decliningFriend === request.uid}
                  className={`btn-secondary text-sm flex items-center gap-1 px-3 py-1 ${
                    decliningFriend === request.uid ? 'opacity-50' : ''
                  }`}
                >
                  <X size={14} />
                  {decliningFriend === request.uid ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white/80 text-sm mb-2">Sent Requests</h4>
          <div className="space-y-2">
            {sentRequests.map((request) => (
              <motion.div
                key={request.uid}
                className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <img
                    src={request.photoURL}
                    alt={request.displayName}
                    className="w-8 h-8 rounded-full border-2 border-yellow-500 flex-shrink-0"
                  />
                  <span className="ml-2 text-white truncate">{request.displayName}</span>
                </div>
                <span className="text-sm text-white/60 ml-4 flex-shrink-0">Pending</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
  {friends.length > 0 ? (
    friends.map((friend) => (
      <motion.div
        key={friend.uid}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className="flex items-center  bg-gradient-to-r from-transparent via-transparent to-transparent rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <img
            src={friend.photoURL || "/default-avatar.png"}
            alt={`${friend.displayName}'s profile picture`}
            className="w-12 h-12 rounded-full border-2 border-yellow-500 object-cover"
          />
        </div>
        <div className="ml-4">
          <span className="block text-white font-semibold truncate">
            {friend.displayName || "Anonymous"}
          </span>
          <span className="block text-sm text-gray-400 truncate">
            {friend.email || "No email provided"}
          </span>
        </div>
      </motion.div>
    ))
  ) : (
    <div className="text-center text-gray-400 col-span-full">
      No friends to display. Add some friends to see them here!
    </div>
  )}
</div>

      {friends.length === 0 && !pendingRequests.length && !sentRequests.length && (
        <div className="text-center text-white/60 py-8">
          <p>No friends or pending requests yet.</p>
          <p className="text-sm mt-2">Share your profile to connect with friends!</p>
        </div>
      )}

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareUrl={getFriendInviteUrl()}
          title="Share Your Profile"
        />
      )}
    </div>
  );
};

export { FriendsList, FriendRequest };