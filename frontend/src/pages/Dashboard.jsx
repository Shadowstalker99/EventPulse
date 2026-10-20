import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this campus pass? Time-based cancellation penalties will apply.")) {
      return;
    }
    setCancellingId(id);
    try {
      const res = await api.post(`/bookings/${id}/cancel/`);
      setNotification({
        type: 'success',
        message: `Pass cancelled successfully! Refund of $${res.data.refund_amount} processed (Penalty: $${res.data.penalty_amount} / ${res.data.penalty_percentage}). Inventory restored to student pool.`
      });
      fetchBookings();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || "Failed to cancel booking."
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Student Portal</span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">My Campus Passes</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access your event reservations, digital tickets, and cancellation refunds
          </p>
        </div>
        <Link
          to="/"
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition w-fit shadow-sm"
        >
          + Browse More Events
        </Link>
      </div>

      {notification && (
        <div className={`p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center justify-between ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-slate-500">Loading your passes...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto">
          <span className="text-5xl block mb-3">🎟️</span>
          <h3 className="text-base font-bold text-slate-900">No active campus passes</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't reserved any event tickets yet. Explore upcoming hackathons, fests, and workshops on campus!
          </p>
          <Link
            to="/"
            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
          >
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => {
            const isConfirmed = booking.status === 'CONFIRMED';
            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden"
              >
                {/* Status Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isConfirmed ? 'bg-emerald-500' : 'bg-red-500'
                }`} />

                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Pass #{booking.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-2">
                    {booking.ticket_category?.event_title || 'Campus Event'}
                  </h3>

                  <div className="mt-4 grid grid-cols-3 gap-2 py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Tier</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{booking.ticket_category?.tier}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Quantity</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{booking.quantity} Pass(es)</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                      <p className="text-xs font-extrabold text-blue-600 mt-0.5">${booking.total_price}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    Booked on {new Date(booking.booking_time).toLocaleDateString()}
                  </span>

                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancellingId === booking.id}
                      className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-xl transition"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel & Refund'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
