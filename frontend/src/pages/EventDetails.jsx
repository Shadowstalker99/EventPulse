import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}/`)
      .then(res => {
        setEvent(res.data);
        if (res.data.ticket_categories?.length > 0) {
          setSelectedTier(res.data.ticket_categories[0].id);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      alert("Please sign in with your student credentials to reserve passes.");
      navigate('/login', { state: { from: location } });
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
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || "Booking failed. Please check availability.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading event details...</p>
      </div>
    );
  }

  const selectedTierObj = event.ticket_categories?.find(t => t.id === selectedTier);
  const totalPrice = selectedTierObj ? (parseFloat(selectedTierObj.price) * quantity).toFixed(2) : '0.00';

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'REGULAR': return 'Student General Pass';
      case 'PREMIUM': return 'Delegate / Club Pass';
      case 'VIP': return 'All-Access VIP Pass';
      default: return tier;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
        <Link to="/" className="hover:text-blue-600 transition">Campus Events</Link>
        <span>/</span>
        <span className="text-slate-700 truncate">{event.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Event Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-slate-100">
            <img
              src={event.poster_url || '/assets/events/tech-summit.jpg'}
              alt={event.title}
              className="w-full h-80 object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              📍 {event.location}
            </div>
            {event.category && (
              <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
                {event.category}
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              {event.organizer || 'Host: Campus Student Affairs'}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              {event.title}
            </h1>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                📅
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Starts</p>
                <p className="text-xs font-bold text-slate-800">{formatDateTime(event.start_time)}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
                📍
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Venue</p>
                <p className="text-xs font-bold text-slate-800">{event.location}</p>
              </div>
            </div>
          </div>

          {/* About Event */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-3">About This Event</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Campus Pass Guidelines
              </h3>
              <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                <li>Valid Student ID card required at entry gates.</li>
                <li>Concurreny safe booking: Ticket inventory locked during checkout.</li>
                <li>Dynamic cancellation refund available up to event start time.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Pass Booking */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-blue-500/5 sticky top-28">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Reserve Pass</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Select tier & quantity to book
            </p>

            {error && (
              <div className="mt-4 bg-red-50 text-red-600 text-xs font-semibold p-3.5 rounded-xl border border-red-100">
                ⚠️ {error}
              </div>
            )}

            {/* Ticket Tier Cards */}
            <div className="space-y-3 mt-6">
              {event.ticket_categories?.map(tier => {
                const isSelected = selectedTier === tier.id;
                const isSoldOut = tier.available_quantity <= 0;

                return (
                  <div
                    key={tier.id}
                    onClick={() => !isSoldOut && setSelectedTier(tier.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSoldOut
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          tier.tier === 'VIP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tier.tier}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">
                          {getTierLabel(tier.tier)}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-slate-900">
                          {parseFloat(tier.price) === 0 ? 'Free' : `$${parseFloat(tier.price).toFixed(0)}`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                      <span className={isSoldOut ? 'text-red-500' : 'text-emerald-600'}>
                        {isSoldOut ? 'Sold Out' : `${tier.available_quantity} passes left`}
                      </span>
                      {isSelected && (
                        <span className="text-blue-600 text-xs font-bold">✓ Selected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quantity Stepper */}
            <div className="mt-6 flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center text-sm"
                >
                  -
                </button>
                <span className="text-sm font-bold text-slate-900 w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Total Amount:</span>
              <span className="text-2xl font-black text-slate-900">
                ${totalPrice}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleBooking}
              disabled={loading || !selectedTierObj || selectedTierObj.available_quantity <= 0}
              className="w-full mt-5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Reserving Pass...</span>
                </>
              ) : (
                <span>Confirm & Reserve Pass</span>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-3 font-medium">
              🔒 Safe concurrency checkout with database row locking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
