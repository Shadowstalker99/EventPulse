import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { auth, storage } from '../utils/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function AdminDashboard() {
  const [stats, setStats] = useState({ total_revenue: 0, tickets_sold: 0, total_events: 0 });
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', start_time: '', end_time: '', poster_url: '' });
  const [newTicket, setNewTicket] = useState({ event_id: '', tier: 'REGULAR', price: '', total_quantity: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
    let poster_url = newEvent.poster_url;

    if (file) {
      try {
        const storageRef = ref(storage, `posters/${Date.now()}_${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        poster_url = await getDownloadURL(uploadTask.ref);
      } catch (err) {
        alert("Failed to upload image.");
        setUploading(false);
        return;
      }
    }

    try {
      await api.post('/events/', { ...newEvent, poster_url });
      alert("Event created successfully");
      fetchEvents();
      fetchStats();
      setNewEvent({ title: '', description: '', location: '', start_time: '', end_time: '', poster_url: '' });
      setFile(null);
    } catch (err) {
      alert("Error creating event");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Delete event?")) return;
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
      alert("Ticket category created successfully");
      fetchEvents();
      setNewTicket({ event_id: '', tier: 'REGULAR', price: '', total_quantity: '' });
    } catch (err) {
      alert("Error creating ticket category");
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
          <h2 className="text-gray-500 text-sm font-bold uppercase">Total Revenue</h2>
          <p className="text-3xl font-bold">${stats.total_revenue || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-green-500">
          <h2 className="text-gray-500 text-sm font-bold uppercase">Tickets Sold</h2>
          <p className="text-3xl font-bold">{stats.tickets_sold || 0}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-t-4 border-purple-500">
          <h2 className="text-gray-500 text-sm font-bold uppercase">Total Events</h2>
          <p className="text-3xl font-bold">{stats.total_events || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Event Form */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <input type="text" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full border p-2 rounded" required />
            <input type="text" placeholder="Location" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full border p-2 rounded" required />
            <div className="flex space-x-2">
              <input type="datetime-local" value={newEvent.start_time} onChange={e => setNewEvent({...newEvent, start_time: e.target.value})} className="w-1/2 border p-2 rounded" required />
              <input type="datetime-local" value={newEvent.end_time} onChange={e => setNewEvent({...newEvent, end_time: e.target.value})} className="w-1/2 border p-2 rounded" required />
            </div>
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Event Poster</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full border p-2 rounded" />
            </div>

            <textarea placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full border p-2 rounded" required></textarea>
            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">
                {uploading ? 'Uploading & Creating...' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* Ticket Form */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Create Ticket Category</h2>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <select value={newTicket.event_id} onChange={e => setNewTicket({...newTicket, event_id: e.target.value})} className="w-full border p-2 rounded" required>
              <option value="">Select Event...</option>
              {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
            <select value={newTicket.tier} onChange={e => setNewTicket({...newTicket, tier: e.target.value})} className="w-full border p-2 rounded" required>
              <option value="REGULAR">Regular</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
            <input type="number" step="0.01" placeholder="Price" value={newTicket.price} onChange={e => setNewTicket({...newTicket, price: e.target.value})} className="w-full border p-2 rounded" required />
            <input type="number" placeholder="Total Quantity" value={newTicket.total_quantity} onChange={e => setNewTicket({...newTicket, total_quantity: e.target.value})} className="w-full border p-2 rounded" required />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700">Add Tickets to Event</button>
          </form>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Manage Events</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Title</th>
              <th className="p-3">Location</th>
              <th className="p-3">Tickets Available</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id} className="border-b">
                <td className="p-3">{ev.title}</td>
                <td className="p-3">{ev.location}</td>
                <td className="p-3">
                  {ev.ticket_categories?.map(t => (
                    <span key={t.id} className="inline-block bg-gray-200 rounded px-2 py-1 mr-2 text-xs mb-1">
                      {t.tier}: {t.available_quantity}/{t.total_quantity}
                    </span>
                  ))}
                </td>
                <td className="p-3">
                  <button onClick={() => handleDeleteEvent(ev.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
