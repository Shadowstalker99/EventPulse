import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_revenue: 0, tickets_sold: 0, total_events: 0 });
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Tech & Hackathons',
    organizer: '',
    location: '',
    start_time: '',
    end_time: '',
    poster_url: '',
    description: ''
  });
  const [newTicket, setNewTicket] = useState({ event_id: '', tier: 'REGULAR', price: '', total_quantity: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchEvents();
  }, []);

  const fetchStats = () => {
    api.get('/admin/stats/')
      .then(res => setStats(res.data))
      .catch(err => console.error("Not authorized or error", err));
  };

  const fetchEvents = () => {
    api.get('/events/')
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStatusMsg(null);
    let poster_url = newEvent.poster_url;

    if (file) {
      try {
        const storageRef = ref(storage, `posters/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        poster_url = await getDownloadURL(uploadTask.ref);
      } catch (err) {
        setStatusMsg({ type: 'error', text: "Failed to upload image to Firebase Storage." });
        setUploading(false);
        return;
      }
    }

    try {
      await api.post('/events/', { ...newEvent, poster_url });
      setStatusMsg({ type: 'success', text: "Campus event published successfully!" });
      fetchEvents();
      fetchStats();
      setNewEvent({
        title: '',
        category: 'Tech & Hackathons',
        organizer: '',
        location: '',
        start_time: '',
        end_time: '',
        poster_url: '',
        description: ''
      });
      setFile(null);
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Error creating campus event. Make sure you have admin rights." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campus event?")) return;
    try {
      await api.delete(`/events/${id}/`);
      fetchEvents();
      fetchStats();
    } catch (err) {
      alert("Error deleting event");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets/', {
        event: newTicket.event_id,
        tier: newTicket.tier,
        price: newTicket.price,
        total_quantity: newTicket.total_quantity
      });
      setStatusMsg({ type: 'success', text: "Pass tier allocated to event!" });
      fetchEvents();
      setNewTicket({ event_id: '', tier: 'REGULAR', price: '', total_quantity: '' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Error creating ticket tier." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
      {/* Title */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Faculty & Committee</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          Campus Admin Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Monitor ticket sales, create events, and configure pass quotas
        </p>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl mb-6 text-xs font-semibold flex items-center justify-between ${
          statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">${stats.total_revenue || 0}</p>
          <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">All pass tiers</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tickets Issued</span>
            <span className="text-xl">🎟️</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.tickets_sold || 0}</p>
          <span className="text-[11px] font-semibold text-blue-600 mt-1 inline-block">Across active events</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Events</span>
            <span className="text-xl">🏛️</span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.total_events || 0}</p>
          <span className="text-[11px] font-semibold text-purple-600 mt-1 inline-block">Active campus listings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Create Event Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Publish New Campus Event</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">Add details, host society, and poster image</p>

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Event Title</label>
              <input
                type="text"
                placeholder="e.g. Annual Tech Symposium 2026"
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Category</label>
                <select
                  value={newEvent.category}
                  onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                >
                  <option value="Tech & Hackathons">Tech & Hackathons</option>
                  <option value="Cultural Fest">Cultural Fest</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshops">Workshops</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Organizer</label>
                <input
                  type="text"
                  placeholder="e.g. Host: IEEE Student Branch"
                  value={newEvent.organizer}
                  onChange={e => setNewEvent({...newEvent, organizer: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Campus Venue</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium / Seminar Hall B"
                value={newEvent.location}
                onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={e => setNewEvent({...newEvent, start_time: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={e => setNewEvent({...newEvent, end_time: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Poster Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-medium rounded-xl p-2.5 text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Event Description</label>
              <textarea
                rows="3"
                placeholder="Provide event details, schedule, and guidelines for students..."
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none transition"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {uploading ? 'Uploading Poster & Publishing...' : 'Publish Campus Event'}
            </button>
          </form>
        </div>

        {/* Add Ticket Tier Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Add Pass Tier to Event</h2>
          <p className="text-xs text-slate-400 mb-6 font-medium">Allocate inventory quotas and pricing</p>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Select Campus Event</label>
              <select
                value={newTicket.event_id}
                onChange={e => setNewTicket({...newTicket, event_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                required
              >
                <option value="">Select an Event...</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tier Name</label>
                <select
                  value={newTicket.tier}
                  onChange={e => setNewTicket({...newTicket, tier: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                  required
                >
                  <option value="REGULAR">Regular (Student Pass)</option>
                  <option value="PREMIUM">Premium (Delegate)</option>
                  <option value="VIP">VIP (All-Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Pass Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00 for Free"
                  value={newTicket.price}
                  onChange={e => setNewTicket({...newTicket, price: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Total Quantity Cap</label>
              <input
                type="number"
                placeholder="e.g. 150"
                value={newTicket.total_quantity}
                onChange={e => setNewTicket({...newTicket, total_quantity: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm py-3 rounded-xl shadow-md shadow-emerald-500/20 transition"
            >
              Add Pass Tier to Event
            </button>
          </form>
        </div>
      </div>

      {/* Events Listing Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Manage Published Events</h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {events.length} Events Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100">
                <th className="p-4 pl-6">Title & Organizer</th>
                <th className="p-4">Venue</th>
                <th className="p-4">Pass Quotas</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900 text-sm">{ev.title}</p>
                    <p className="text-slate-400 text-[11px] font-medium">{ev.organizer || 'Student Affairs'}</p>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">
                    📍 {ev.location}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {ev.ticket_categories?.map(t => (
                        <span
                          key={t.id}
                          className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md text-[10px]"
                        >
                          {t.tier}: {t.available_quantity}/{t.total_quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleDeleteEvent(ev.id)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
