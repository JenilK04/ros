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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get('/events');
        const eventsArray = Array.isArray(res.data) ? res.data : res.data.events || [];
        setAllEvents(eventsArray);
      } catch (err) {
        console.error('Error fetching events:', err);
        setAllEvents([]);
      }
    };
    fetchEvents();
  }, []);

  // Add event to state after adding from modal
  const handleEventAdded = (newEvent) => {
    setAllEvents(prev => [...prev, newEvent]);
  };

  // Delete event
  const handleDelete = async (eventId) => {
    try {
      await API.delete(`/events/${eventId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAllEvents(prev => prev.filter(event => event._id !== eventId));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  // Fetch event details by ID
  const handleEventClick = async (eventId) => {
    try {
      const res = await API.get(`/events/${eventId}`);
      if (res.data.success) {
        setSelectedEvent(res.data.event);
        setIsEventModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch event details:", err);
    }
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
              const isMyEvent = event.createdBy?.id === user?.id;

              return (
                <div
                  key={event._id}
                  onClick={() => handleEventClick(event._id)}
                  className={`rounded-xl shadow-lg overflow-hidden flex flex-col border-2 relative cursor-pointer transform transition hover:scale-105 ${
                    isMyEvent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Delete Button only for creator */}
                  {isMyEvent && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}
                      className="absolute top-2 right-2 text-red-600 bg-white rounded-full p-1 shadow hover:bg-red-100 transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Event Image */}
                  {event.images && event.images[0] && (
                    <img
                      src={event.images[0]}
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

      {/* Add Event Button */}
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

      {/* Event Details Modal */}
      {isEventModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-y-auto max-h-[90vh] relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsEventModalOpen(false)}
            >
              X
            </button>

            {/* Event Image */}
            {selectedEvent.images && selectedEvent.images.length > 0 && (
              <div className="w-full flex justify-center bg-gray-100">
                <img
                  src={selectedEvent.images[0]}
                  alt={selectedEvent.title}
                  className="max-w-full h-auto rounded-t-xl object-contain"
                />
              </div>
            )}

            {/* Event Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
              <p className="text-gray-600 mb-1">Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
              <p className="text-gray-600 mb-1">Location: {selectedEvent.location}</p>
              <p className="text-gray-600 mb-2">Category: {selectedEvent.category}</p>
              <p className="text-gray-700 mb-4">{selectedEvent.description}</p>

              <hr className="my-3" />

              <h3 className="font-semibold text-gray-800 mb-1">Organizer Info</h3>
              <p className="text-gray-600">Name: {selectedEvent.createdBy?.firstName} {selectedEvent.createdBy?.lastName}</p>
              <p className="text-gray-600">Company: {selectedEvent.createdBy?.companyName}</p>
              <p className="text-gray-600">Email: {selectedEvent.createdBy?.email}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Event;
