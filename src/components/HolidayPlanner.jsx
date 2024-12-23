import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ref, push, onValue, remove } from 'firebase/database';
import { database } from '../firebase';
import { toast } from 'react-toastify';

const HolidayPlanner = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    type: 'party', // party, dinner, activity
  });

  useEffect(() => {
    if (!user) return;

    const eventsRef = ref(database, `events/${user.uid}`);
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const eventsList = Object.entries(data).map(([id, event]) => ({
          id,
          ...event,
        }));
        setEvents(eventsList.sort((a, b) => new Date(a.date) - new Date(b.date)));
      } else {
        setEvents([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create events');
      return;
    }

    try {
      const eventsRef = ref(database, `events/${user.uid}`);
      await push(eventsRef, {
        ...newEvent,
        created: new Date().toISOString(),
      });
      setNewEvent({
        title: '',
        date: '',
        time: '',
        description: '',
        type: 'party',
      });
      toast.success('Holiday event added! 🎉');
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const eventRef = ref(database, `events/${user.uid}/${eventId}`);
      await remove(eventRef);
      toast.success('Event removed');
    } catch (error) {
      toast.error('Failed to remove event');
    }
  };

  if (!user) {
    return (
      <div className="text-center text-white py-12">
        <h2 className="text-3xl font-bold mb-4">Please sign in to plan holiday events</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <h2 className="text-3xl font-bold mb-8 text-white">Holiday Event Planner</h2>

        <form onSubmit={handleAddEvent} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="input-field"
              required
            />
            <select
              value={newEvent.type}
              onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
              className="input-field"
            >
              <option value="party">Holiday Party</option>
              <option value="dinner">Dinner</option>
              <option value="activity">Activity</option>
            </select>
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="time"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <textarea
            placeholder="Event description"
            value={newEvent.description}
            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            className="input-field w-full"
            rows="3"
          />
          <button type="submit" className="btn-primary">
            Add Event
          </button>
        </form>

        <div className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card p-4 card-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  <p className="text-white/80">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </p>
                  <p className="text-white/80">{event.description}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-sm bg-white/20 text-white mt-2">
                    {event.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="text-holiday-red hover:text-red-700 transition-colors"
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

export default HolidayPlanner;