import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, push, onValue, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { toast } from 'react-toastify';
import { Trash2, Gift, Users, DollarSign, Calendar, Sparkles, Share2 } from 'lucide-react';
import ShareModal from '../components/ShareModal';

const SecretSanta = ({ user }) => {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({
    name: '',
    budget: '',
    date: '',
    description: '',
    theme: 'traditional'
  });
  const [showInfo, setShowInfo] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const groupsRef = ref(database, 'secretSantaGroups');
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsList = Object.entries(data).map(([id, group]) => ({
          id,
          ...group,
          participantCount: group.participants ? Object.keys(group.participants).length : 0
        }));
        setGroups(groupsList.filter(group => 
          group.participants && Object.values(group.participants).includes(user.uid)
        ));
      } else {
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a group');
      return;
    }

    try {
      const groupsRef = ref(database, 'secretSantaGroups');
      const newGroupRef = await push(groupsRef, {
        ...newGroup,
        creator: user.uid,
        creatorName: user.displayName,
        participants: { [user.uid]: user.uid },
        participantNames: { [user.uid]: user.displayName },
        created: new Date().toISOString(),
        status: 'open'
      });
      
      setNewGroup({ name: '', budget: '', date: '', description: '', theme: 'traditional' });
      toast.success('Secret Santa group created! 🎅');
      
      // Open share modal with the new group
      setSelectedGroupId(newGroupRef.key);
      setShowShareModal(true);
    } catch (error) {
      toast.error('Failed to create group');
    }
  };

  const getGroupInviteUrl = (groupId) => {
    return `${window.location.origin}/secret-santa/join/${groupId}`;
  };

  const handleShare = (groupId) => {
    setSelectedGroupId(groupId);
    setShowShareModal(true);
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) return;

    try {
      const updates = {};
      updates[`secretSantaGroups/${groupId}/participants/${user.uid}`] = user.uid;
      updates[`secretSantaGroups/${groupId}/participantNames/${user.uid}`] = user.displayName;
      await update(ref(database), updates);
      toast.success('Joined the group successfully! 🎄');
    } catch (error) {
      toast.error('Failed to join group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      try {
        const groupRef = ref(database, `secretSantaGroups/${groupId}`);
        await remove(groupRef);
        toast.success('Group deleted successfully');
      } catch (error) {
        toast.error('Failed to delete group');
      }
    }
  };

  const InfoSection = () => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8 text-white"
    >
      <div className="bg-gradient-to-r from-holiday-red/20 to-holiday-green/20 p-6 rounded-xl backdrop-blur-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-holiday-gold" />
          Why Start a Secret Santa Exchange?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg">
            <Gift className="text-holiday-gold mb-2" size={24} />
            <h4 className="font-semibold mb-2">Meaningful Gifting</h4>
            <p className="text-sm text-white/80">Focus on one special gift rather than many, making the exchange more meaningful and personal.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg">
            <DollarSign className="text-holiday-gold mb-2" size={24} />
            <h4 className="font-semibold mb-2">Budget Friendly</h4>
            <p className="text-sm text-white/80">Set a budget that works for everyone, making holiday gifting more affordable and stress-free.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4 bg-white/10 rounded-lg">
            <Users className="text-holiday-gold mb-2" size={24} />
            <h4 className="font-semibold mb-2">Build Connections</h4>
            <p className="text-sm text-white/80">Strengthen bonds with friends, family, or colleagues through thoughtful gift-giving.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowInfo(false)}
          className="mt-4 text-sm text-white/60 hover:text-white"
        >
          Hide this section
        </button>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to participate in Secret Santa</h2>
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
        <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
          <Gift className="text-holiday-gold" />
          Secret Santa Exchange
        </h2>

        <AnimatePresence>
          {showInfo && <InfoSection />}
        </AnimatePresence>

        <form onSubmit={handleCreateGroup} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Group name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
              required
            />
            <input
              type="number"
              placeholder="Budget"
              value={newGroup.budget}
              onChange={(e) => setNewGroup({ ...newGroup, budget: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
              required
            />
            <input
              type="date"
              value={newGroup.date}
              onChange={(e) => setNewGroup({ ...newGroup, date: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
              required
            />
            <select
              value={newGroup.theme}
              onChange={(e) => setNewGroup({ ...newGroup, theme: e.target.value })}
              className="bg-white/20 text-white placeholder-white/60 p-2 rounded-lg"
            >
              <option value="traditional">Traditional Holiday</option>
              <option value="funny">Funny Gifts</option>
              <option value="handmade">Handmade Only</option>
              <option value="eco">Eco-Friendly</option>
              <option value="local">Local Businesses Only</option>
            </select>
          </div>
          <textarea
            placeholder="Group description (optional)"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            className="w-full bg-white/20 text-white placeholder-white/60 p-2 rounded-lg mb-4"
            rows="2"
          />
          <button
            type="submit"
            className="bg-holiday-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Gift size={18} />
            Create Group
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <motion.div
              key={group.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white/20 p-4 rounded-lg relative"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-white">{group.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(group.id)}
                    className="text-holiday-gold hover:text-yellow-400 p-2 rounded-full hover:bg-white/10 transition"
                    title="Share group"
                  >
                    <Share2 size={20} />
                  </button>
                  {group.creator === user.uid && (
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-white/10 transition"
                      title="Delete group"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
              {group.description && (
                <p className="text-white/80 text-sm mb-2">{group.description}</p>
              )}
              <div className="space-y-1">
                <p className="text-white/80 flex items-center gap-2">
                  <DollarSign size={16} className="text-holiday-gold" />
                  Budget: ${group.budget}
                </p>
                <p className="text-white/80 flex items-center gap-2">
                  <Calendar size={16} className="text-holiday-gold" />
                  Exchange: {new Date(group.date).toLocaleDateString()}
                </p>
                <p className="text-white/80 flex items-center gap-2">
                  <Users size={16} className="text-holiday-gold" />
                  Participants: {group.participantCount}
                </p>
              </div>
              <div className="mt-4">
                {group.participants && user.uid in group.participants ? (
                  <span className="inline-block bg-holiday-gold/20 text-holiday-gold px-3 py-1 rounded-full text-sm">
                    You're participating! 🎁
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="bg-holiday-gold text-holiday-pine px-4 py-1 rounded-lg hover:bg-yellow-500 transition flex items-center gap-2"
                  >
                    <Users size={16} />
                    Join Group
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {showShareModal && selectedGroupId && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false);
              setSelectedGroupId(null);
            }}
            shareUrl={getGroupInviteUrl(selectedGroupId)}
            title="Invite Friends to Secret Santa"
          />
        )}
      </motion.div>
    </div>
  );
};

export default SecretSanta;