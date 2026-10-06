import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { auth } from '../utils/firebase';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}/`)
      .then(res => setEvent(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleBooking = async () => {
    if (!auth.currentUser) {
      alert("Please login to book tickets.");
      navigate('/login');
      return;
    }
    if (!selectedTier) {
      setError("Please select a ticket tier.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/bookings/', {
        ticket_category_id: selectedTier,
        quantity: quantity
      });
      alert("Booking successful!");
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded overflow-hidden">
      <img src={event.poster_url || 'https://via.placeholder.com/800x400'} alt={event.title} className="w-full h-64 object-cover" />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600 mb-4">{new Date(event.start_time).toLocaleString()} to {new Date(event.end_time).toLocaleString()} • {event.location}</p>
        <p className="text-gray-800 mb-8">{event.description}</p>

        <h2 className="text-2xl font-bold mb-4">Select Tickets</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <div className="space-y-4 mb-6">
          {event.ticket_categories.map(tier => (
            <div key={tier.id} 
                 onClick={() => setSelectedTier(tier.id)}
                 className={`border p-4 rounded cursor-pointer flex justify-between items-center ${selectedTier === tier.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
              <div>
                <h3 className="font-bold text-lg">{tier.tier}</h3>
                <p className="text-gray-600">${tier.price}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${tier.available_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tier.available_quantity} available
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <label className="font-bold">Quantity:</label>
          <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border p-2 rounded w-20" />
        </div>

        <button 
          onClick={handleBooking} 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Processing Payment...' : 'Checkout & Book'}
        </button>
      </div>
    </div>
  );
}

export default EventDetails;
