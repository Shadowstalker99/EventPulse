import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

function Home() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.get('/events/')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded shadow-md overflow-hidden flex flex-col">
            <img src={event.poster_url || 'https://via.placeholder.com/400x200'} alt={event.title} className="w-full h-48 object-cover" />
            <div className="p-4 flex-grow">
              <h2 className="text-xl font-bold mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-2">{new Date(event.start_time).toLocaleDateString()} • {event.location}</p>
              <p className="text-sm text-gray-700 line-clamp-3">{event.description}</p>
            </div>
            <div className="p-4 bg-gray-50 border-t">
              <Link to={`/events/${event.id}`} className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
