import React, { useEffect, useState } from 'react';
import api from '../utils/api';

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = () => {
    api.get('/bookings/')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Penalties may apply.")) return;
    setLoading(true);
    try {
      const res = await api.post(`/bookings/${id}/cancel/`);
      alert(`Cancelled successfully. \nRefund Amount: $${res.data.refund_amount}\nPenalty: $${res.data.penalty_amount} (${res.data.penalty_percentage})`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <div className="bg-white shadow-md rounded overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking ID</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tier</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">#{booking.id}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold">
                  {booking.ticket_category?.event_title || 'Event Info'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{booking.ticket_category?.tier}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{booking.quantity}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">${booking.total_price}</td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  {booking.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 font-bold">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr><td colSpan="7" className="text-center p-4">No bookings found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
