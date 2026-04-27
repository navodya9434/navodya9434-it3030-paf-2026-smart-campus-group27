import React, { useState, useEffect } from 'react';
import API from "../api";
import { FiCalendar } from 'react-icons/fi';
//user booking jsx file
// 🌙 DARK INPUT STYLE
const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500";

const primaryButton =
  "w-full rounded-lg bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-black";

// ---------------- TOAST ----------------
const Toast = ({ msg }) =>
  msg ? (
    <div className="fixed top-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 border border-slate-700">
      {msg}
    </div>
  ) : null;

const Booking = () => {

  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedRanges, setBlockedRanges] = useState([]);
  const [toast, setToast] = useState("");

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    facilityId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: ''
  });

  const [filters, setFilters] = useState({
    status: 'ALL'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    API.get("/facilities").then(res => setFacilities(res.data));
    API.get("/bookings/all").then(res => setBookings(res.data));
  }, []);

  const loadDayData = async (facilityId, date) => {
    if (!facilityId || !date) return;

    try {
      const res = await API.get(
        `/bookings/facility/${facilityId}/day`,
        { params: { date } }
      );

      setBlockedRanges(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const updated = {
      ...formData,
      [e.target.name]: e.target.value
    };

    setFormData(updated);

    if (updated.facilityId && updated.date) {
      loadDayData(updated.facilityId, updated.date);
    }
  };

  const handleDownloadQR = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:9090/api/v1.0/bookings/${id}/qr`
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-${id}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      alert("QR download failed: " + err.message);
    }
  };

  const isOverlapping = (start, end) => {
    if (!formData.date || !start || !end) return false;

    const s = new Date(`${formData.date}T${start}`).getTime();
    const e = new Date(`${formData.date}T${end}`).getTime();

    return blockedRanges.some(b => {
      const bs = new Date(b.startTime).getTime();
      const be = new Date(b.endTime).getTime();
      return s < be && e > bs;
    });
  };

  // ---------- VALIDATION ----------
  const validateForm = () => {
    if (!formData.facilityId) return "Please select a facility";
    if (!formData.date) return "Please select a date";
    if (!formData.startTime) return "Please select start time";
    if (!formData.endTime) return "Please select end time";
    if (!formData.purpose || formData.purpose.trim().length < 10)
      return "Purpose must be at least 10 characters";
    if (!formData.attendees || Number(formData.attendees) <= 0)
      return "Attendees must be greater than 0";

    if (isOverlapping(formData.startTime, formData.endTime)) {
      return "Time slot already booked";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) return showToast("❌ " + error);

    try {
      const payload = {
        facilityId: formData.facilityId,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`,
        purpose: formData.purpose,
        attendees: Number(formData.attendees)
      };

      await API.post("/bookings", payload);

      showToast("✅ Booking submitted");

      const res = await API.get("/bookings/all");
      setBookings(res.data);

      setBlockedRanges([]);

    } catch (err) {
      console.error(err);
      showToast("Booking failed");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filters.status !== 'ALL' && b.status !== filters.status) return false;

    if (search.trim() !== "") {
      const keyword = search.toLowerCase();

      return (
        b.facilityName?.toLowerCase().includes(keyword) ||
        b.purpose?.toLowerCase().includes(keyword) ||
        b.status?.toLowerCase().includes(keyword)
      );
    }

    return true;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">

      <Toast msg={toast} />

      <div className="max-w-6xl mx-auto space-y-6">

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl text-center">
  <h1 className="text-2xl font-bold">Booking System</h1>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* FORM */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-3">

            <h2 className="flex items-center gap-2 font-bold text-cyan-300">
              <FiCalendar /> New Booking
            </h2>

            {/* FACILITY */}
            <select
              name="facilityId"
              value={formData.facilityId}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="">Select Facility *</option>
              {facilities.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {/* DATE */}
            <input
              type="date"
              name="date"
              value={formData.date}
              min={today}
              onChange={handleInputChange}
              className={inputClass}
            />
            <p className="text-xs text-slate-400">Select today or a future date</p>
            {blockedRanges.length > 0 && (
  <div className="mt-4 space-y-2">
    <h3 className="text-sm font-bold text-red-400">
      Already Booked Slots for this Day
    </h3>

    <div className="space-y-1 max-h-40 overflow-y-auto">
      {blockedRanges.map((b, idx) => (
        <div
          key={idx}
          className="text-xs bg-slate-800 border border-slate-700 px-3 py-2 rounded"
        >
          <span className="text-slate-300">
            {new Date(b.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {" → "}
          <span className="text-slate-300">
            {new Date(b.endTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

            {/* TIME */}
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              className={inputClass}
            />
            <p className="text-xs text-slate-400">Start time of booking</p>

            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              className={inputClass}
            />
            <p className="text-xs text-slate-400">End time must be after start time</p>

            

            {/* PURPOSE */}
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Enter purpose (minimum 10 characters)"
            />
            <p className="text-xs text-slate-400">
              Purpose must describe booking clearly (min 10 chars)
            </p>

            {/* ATTENDEES */}
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Number of attendees"
              min="1"
            />
            <p className="text-xs text-slate-400">Must be greater than 0</p>

            <button onClick={handleSubmit} className={primaryButton}>
              Submit Booking
            </button>

          </div>

          {/* BOOKINGS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">

            <h2 className="font-bold text-cyan-300">Bookings</h2>

            <select
              className={inputClass}
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
            >
              <option value="ALL">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />

            {["PENDING", "APPROVED", "REJECTED"].map((statusGroup) => (
              <div key={statusGroup} className="space-y-2">

                <h3 className="text-sm font-bold text-cyan-400">
                  {statusGroup}
                </h3>

                {filteredBookings
                  .filter(b => b.status === statusGroup)
                  .map(b => (
                    <div
                      key={b.id}
                      className="bg-slate-800 border border-slate-700 p-4 rounded-xl flex flex-col justify-between"
                    >

                      <div className="flex justify-between">
                        <strong className="text-white">{b.facilityName}</strong>
                        <span className="text-cyan-300 text-sm">{b.status}</span>
                      </div>

                      <p className="text-sm text-slate-400">
                        {b.startTime?.replace("T", " ")} → {b.endTime?.replace("T", " ")}
                      </p>

                      <p className="text-sm text-slate-300 line-clamp-2">
                        {b.purpose}
                      </p>

                      {b.status === "REJECTED" && b.adminReason && (
                        <p className="text-red-400 text-xs mt-2">
                          ❌ Reason: {b.adminReason}
                        </p>
                      )}

                      {b.status === "APPROVED" && (
                        <button
                          onClick={() => handleDownloadQR(b.id)}
                          className="mt-2 text-xs bg-cyan-500 text-black px-3 py-1 rounded"
                        >
                          Download QR
                        </button>
                      )}

                    </div>
                  ))}
              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;