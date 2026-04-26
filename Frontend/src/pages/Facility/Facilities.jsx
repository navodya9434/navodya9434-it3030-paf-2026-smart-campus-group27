import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, MapPin, Users, Phone, Mail } from 'lucide-react';
import { FaPencilAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../api';

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    location: '',
    contactPerson: '',
    contactPhone: '',
    notes: ''
  });

  const facilityTypes = [
    'LECTURE_HALL',
    'LAB',
    'MEETING_ROOM',
    'AUDITORIUM',
    'SPORTS_FACILITY',
    'EQUIPMENT',
    'PARKING',
    'CAFETERIA',
    'LIBRARY',
    'OTHER'
  ];

  const facilityStatuses = ['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'CLOSED'];

  // Fetch all facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/facilities');
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  // Search facilities
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchFacilities();
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/facilities/search?term=${searchTerm}`);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error searching facilities:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter facilities
  const handleFilter = async (e) => {
    e.preventDefault();
    if (!filterType && !filterLocation) {
      fetchFacilities();
      return;
    }
    try {
      setLoading(true);
      let endpoint = '/facilities/filter';
      const params = [];
      if (filterType) params.push(`type=${filterType}`);
      if (filterLocation) params.push(`location=${filterLocation}`);
      const response = await api.get(`${endpoint}?${params.join('&')}`);
      setFacilities(response.data);
    } catch (error) {
      console.error('Error filtering facilities:', error);
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  // Create or update facility
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.type || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (editingFacility) {
        // Update facility
        await api.put(`/facilities/${editingFacility.id}`, formData);
        toast.success('Facility updated successfully');
      } else {
        // Create facility
        await api.post('/facilities', formData);
        toast.success('Facility created successfully');
      }
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        type: '',
        capacity: '',
        location: '',
        contactPerson: '',
        contactPhone: '',
        notes: ''
      });
      setEditingFacility(null);
      fetchFacilities();
    } catch (error) {
      console.error('Error saving facility:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save facility');
      }
    }
  };

  // Edit facility
  const handleEdit = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name,
      description: facility.description,
      type: facility.type,
      capacity: facility.capacity,
      location: facility.location,
      contactPerson: facility.contactPerson,
      contactPhone: facility.contactPhone,
      notes: facility.notes
    });
    setShowModal(true);
  };

  // Delete facility
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await api.delete(`/facilities/${id}`);
        toast.success('Facility deleted successfully');
        fetchFacilities();
      } catch (error) {
        console.error('Error deleting facility:', error);
        toast.error('Failed to delete facility');
      }
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingFacility(null);
    setFormData({
      name: '',
      description: '',
      type: '',
      capacity: '',
      location: '',
      contactPerson: '',
      contactPhone: '',
      notes: ''
    });
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
        "--ink": "#0f172a",
        "--sand": "#f8f4ee",
        "--stone": "#e7dcc8",
        "--copper": "#c06b3e",
        "--teal": "#0f766e",
      }}
    >
      <style>{`
        @keyframes facilityFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @media (prefers-reduced-motion: reduce) { .facility-animate { animation: none !important; } }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,233,218,0.85),rgba(15,23,42,0.9))]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/45 to-transparent"></div>
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[color:var(--teal)]/25 blur-[90px] facility-animate" style={{ animation: "glowFloat 6s ease-in-out infinite" }}></div>
      <div className="pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-[color:var(--copper)]/30 blur-[100px] facility-animate" style={{ animation: "glowFloat 7s ease-in-out infinite" }}></div>

      <div className="relative mx-auto w-[92%] max-w-7xl py-10">
        <header className="facility-animate rounded-[32px] border border-white/30 bg-white/80 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl" style={{ animation: "facilityFade 550ms ease-out" }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--copper)]">Facilities</p>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--ink)]">Spaces & Assets</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Browse available campus facilities, filter by type, and search by name or location.
          </p>
        </header>

        <div className="facility-animate mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]" style={{ animation: "facilityFade 600ms ease-out 80ms both" }}>
          <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-[26px] border border-white/60 bg-white/85 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-10 py-3 text-sm text-[color:var(--ink)] outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[color:var(--teal)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Search
            </button>
          </form>

          <form onSubmit={handleFilter} className="flex flex-col gap-3 rounded-[26px] border border-white/60 bg-white/85 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.12)] sm:flex-row sm:items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none"
            >
              <option value="">All Types</option>
              {facilityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--teal)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              <Filter size={14} /> Filter
            </button>
          </form>
        </div>

        <div className="facility-animate mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" style={{ animation: "facilityFade 650ms ease-out 140ms both" }}>
          {loading ? (
            <div className="col-span-full rounded-2xl border border-white/70 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
              Loading facilities...
            </div>
          ) : facilities.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-white/70 bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
              No facilities found
            </div>
          ) : (
            facilities.map((facility) => (
              <div key={facility.id} className="overflow-hidden rounded-[26px] border border-white/60 bg-white/85 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                <div className="bg-gradient-to-r from-[color:var(--teal)]/80 to-[color:var(--copper)]/70 p-4">
                  <h3 className="text-lg font-semibold text-white">{facility.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold text-white ${
                      facility.status === 'ACTIVE'
                        ? 'bg-emerald-600'
                        : facility.status === 'MAINTENANCE'
                        ? 'bg-amber-600'
                        : facility.status === 'OUT_OF_SERVICE'
                        ? 'bg-red-600'
                        : 'bg-slate-500'
                    }`}>
                      {facility.status}
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-semibold text-white">
                      {facility.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {facility.description && (
                    <p className="text-sm text-slate-600">{facility.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-slate-600">
                    {facility.capacity && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[color:var(--teal)]" />
                        <span>Capacity: {facility.capacity} persons</span>
                      </div>
                    )}
                    {facility.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[color:var(--teal)]" />
                        <span>{facility.location}</span>
                      </div>
                    )}
                    {facility.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-[color:var(--teal)]" />
                        <span>{facility.contactPhone}</span>
                      </div>
                    )}
                    {facility.contactPerson && (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-[color:var(--teal)]" />
                        <span>{facility.contactPerson}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Facilities;
