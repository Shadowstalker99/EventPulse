import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const CATEGORIES = [
  'All',
  'Tech & Hackathons',
  'Cultural Fest',
  'Sports',
  'Workshops'
];

const CAMPUS_CLUBS = [
  {
    id: 'ieee',
    name: 'IEEE Student Branch',
    organizerKey: 'Host: IEEE Student Branch',
    icon: '💻',
    category: 'Technology & Hackathons',
    department: 'Dept. of Computer Science & IT',
    description: 'Premier campus technical society hosting national hackathons, code sprints, and AI developer conferences.',
    bgBadge: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  {
    id: 'arts',
    name: 'Fine Arts & Drama Society',
    organizerKey: 'Host: Fine Arts Club',
    icon: '🎭',
    category: 'Cultural & Performing Arts',
    department: 'Student Cultural Board',
    description: 'Organizes the flagship Annual Cultural Fest, stage plays, musical theatre, and inter-college dance battles.',
    bgBadge: 'bg-purple-50 text-purple-700 border-purple-100'
  },
  {
    id: 'sports',
    name: 'Sports & Athletics Committee',
    organizerKey: 'Host: Sports Committee',
    icon: '🏅',
    category: 'Athletics & Tournaments',
    department: 'University Physical Education',
    description: 'Manages inter-university sports championships, campus football leagues, basketball cups, and track events.',
    bgBadge: 'bg-amber-50 text-amber-700 border-amber-100'
  },
  {
    id: 'music',
    name: 'Campus Music Society',
    organizerKey: 'Host: Music Society',
    icon: '🎵',
    category: 'Music & Concerts',
    department: 'Student Affairs',
    description: 'Brings campus together with live band battles, acoustic amphitheater jam sessions, and guest DJ concerts.',
    bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  },
  {
    id: 'acm',
    name: 'ACM Student Chapter',
    organizerKey: 'Host: ACM Student Chapter',
    icon: '🤖',
    category: 'Robotics & Hardware Labs',
    department: 'Faculty of Engineering',
    description: 'Hands-on embedded systems workshops, autonomous robotics builds, and machine learning research labs.',
    bgBadge: 'bg-cyan-50 text-cyan-700 border-cyan-100'
  }
];

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const fetchEvents = () => {
    setLoading(true);
    let url = '/events/';
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') {
      params.append('category', selectedCategory);
    }
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    api.get(url)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleClubFilter = (organizerKey) => {
    if (selectedClub === organizerKey) {
      setSelectedClub(null);
    } else {
      setSelectedClub(organizerKey);
      const target = document.getElementById('events-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const toggleFavorite = (eventId) => {
    setFavorites(prev => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const getLowestPrice = (ticketCategories) => {
    if (!ticketCategories || ticketCategories.length === 0) return 0;
    const prices = ticketCategories.map(tc => parseFloat(tc.price));
    return Math.min(...prices);
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return { full: 'TBA', day: '--', month: '---' };
    const date = new Date(dateString);
    const full = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { full, day, month };
  };

  // Filter events by selected club if active
  const displayedEvents = events.filter(event => {
    if (selectedClub && event.organizer !== selectedClub) {
      return false;
    }
    return true;
  });

  return (
    <div className="pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-slate-50 to-slate-50 pt-8 sm:pt-12 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100/70 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
            <span>🎓</span>
            <span>Official University Event & Pass Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Discover Campus <span className="text-blue-600">Life & Events</span>
          </h1>

          <p className="mt-3 text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">
            Book student tickets for official college fests, inter-branch hackathons, athletic championships, and society workshops.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto mt-8">
            <div className="flex items-center bg-white rounded-full shadow-lg shadow-blue-500/5 border border-slate-200/90 px-4 py-2.5 pl-5 gap-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition">
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search hackathons, cultural fests, sports, workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shadow-blue-500/20 flex-shrink-0"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </form>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6" id="categories">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setSelectedClub(null); }}
                  className={`text-xs md:text-sm font-bold px-5 py-2.5 rounded-full transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm scale-105'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campus Events Section */}
      <section id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {selectedClub
                ? `Events by ${CAMPUS_CLUBS.find(c => c.organizerKey === selectedClub)?.name || selectedClub}`
                : selectedCategory === 'All'
                ? 'Upcoming Campus Events'
                : `${selectedCategory} Events`}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Verified university listings & student pass booking
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedClub && (
              <button
                onClick={() => setSelectedClub(null)}
                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition"
              >
                ✕ Clear Club Filter
              </button>
            )}
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              {displayedEvents.length} Events Available
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-slate-500">Loading campus events...</p>
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <span className="text-4xl block mb-3">🎓</span>
            <h3 className="text-base font-bold text-slate-800">No events found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search or club filter options</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedClub(null); setSearchTerm(''); }}
              className="mt-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedEvents.map(event => {
              const lowestPrice = getLowestPrice(event.ticket_categories);
              const { full, day, month } = formatEventDate(event.start_time);
              const isFav = !!favorites[event.id];

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Event Poster & Badges */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={event.poster_url || '/assets/events/tech-summit.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Venue Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                      <span className="text-blue-600">📍</span>
                      <span className="truncate max-w-[140px]">{event.location}</span>
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(event.id)}
                      className="absolute top-3 right-3 bg-white/80 hover:bg-white backdrop-blur-md text-slate-500 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm cursor-pointer"
                    >
                      <svg
                        className={`w-4 h-4 transition ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
                        fill={isFav ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Date Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{full}</span>
                    </div>

                    {/* Date Stamp Indicator */}
                    <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md flex flex-col items-center leading-tight">
                      <span>{day}</span>
                      <span className="uppercase text-[8px] text-slate-300">{month}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition line-clamp-1">
                      {event.title}
                    </h3>

                    {/* Venue pill */}
                    <div className="mt-2">
                      <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-md inline-block">
                        {event.location}
                      </span>
                    </div>

                    {/* Organizer/Host Tag */}
                    <p className="text-xs font-semibold text-slate-400 mt-1.5">
                      {event.organizer || 'Host: Student Council'}
                    </p>

                    {/* Description preview */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Card Footer */}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Student Ticket
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          {lowestPrice === 0 ? '$0 Free' : `$${lowestPrice.toFixed(0)} Pass`}
                        </span>
                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shadow-blue-500/20"
                      >
                        Book Pass
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Campus Clubs & Societies Directory Section */}
      <section id="clubs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-10 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <span>🏛️</span>
              <span>Official Student Bodies</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Campus Clubs & Societies
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Explore the student organizations hosting hackathons, fests, sports cups, and workshops
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {CAMPUS_CLUBS.length} Active Societies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPUS_CLUBS.map(club => {
            const isSelected = selectedClub === club.organizerKey;
            const hostedEventCount = events.filter(e => e.organizer === club.organizerKey).length;

            return (
              <div
                key={club.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-2xs">
                      {club.icon}
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${club.bgBadge}`}>
                      {club.category}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {club.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    {club.department}
                  </p>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {hostedEventCount} {hostedEventCount === 1 ? 'Event' : 'Events'} Active
                  </span>

                  <button
                    onClick={() => handleClubFilter(club.organizerKey)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ Showing Events' : 'View Events →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Home;
