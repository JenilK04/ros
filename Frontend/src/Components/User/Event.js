import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '../../Context/userContext';
import Navbar from './navbar';
import AddEventModal from './addEvent';
import API from '../../services/api'; // your axios instance

function Event() {
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEvents, setAllEvents] = useState([]);

  // Fetch all events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get('/events'); // public route
        const eventsArray = Array.isArray(res.data) ? res.data : res.data.events || [];
        setAllEvents(eventsArray);
      } catch (err) {
        console.error('Error fetching events:', err);
        setAllEvents([]);
      }
    };

    fetchEvents();
  }, []);

  const handleEventAdded = (newEvent) => {
    setAllEvents(prev => [...prev, newEvent]);
  };

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto mt-3">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Events</h2>

        {allEvents.length === 0 ? (
          <p className="text-gray-600">No events available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allEvents.map(event => {
              const isMyEvent = event.createdBy === user?._id; // Check if logged-in user added this event

              return (
                <div
                  key={event._id}
                  className={`rounded-xl shadow-lg overflow-hidden flex flex-col border-2 ${
                    isMyEvent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Image */}
                  {event.images && event.images[0] && (
                    <img
                      src={event.images[0]} // base64 or URL
                      alt={event.title}
                      className="h-40 w-full object-cover"
                    />
                  )}

                  {/* Event Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className={`text-lg font-semibold ${isMyEvent ? 'text-indigo-700' : 'text-gray-800'}`}>
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600 mt-2 flex-1">
                      {event.description?.slice(0, 80)}
                      {event.description?.length > 80 ? '...' : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Category: {event.category}</p>
                    <p className="text-xs text-gray-400">Location: {event.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Button (Developer Only) */}
      {user?.userType === 'developer' && (
        <button
          className="fixed bottom-6 right-6 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      )}

      {/* Add Event Modal */}
      {isModalOpen && (
        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEventAdded={handleEventAdded}
        />
      )}
    </>
  );
}

export default Event;
