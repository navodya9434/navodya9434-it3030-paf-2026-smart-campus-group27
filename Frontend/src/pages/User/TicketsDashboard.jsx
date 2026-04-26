import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";
//jsx file for the user dashboard, showing a summary of their tickets and bookings, as well as recent activity. This is the main landing page after login for users. It should be visually appealing and easy to navigate.
export default function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= REAL SUMMARY =================
  const summary = {
    totalBookings: bookings.length,
    totalTickets: tickets.length,
    activeTickets: tickets.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
    ).length,
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const ticketRes = await API.get("/tickets/my");
        const allTickets = Array.isArray(ticketRes.data)
          ? ticketRes.data
          : ticketRes.data.data || [];

        const uniqueTickets = allTickets.filter(
          (ticket, index, arr) =>
            index === arr.findIndex((item) => item.id === ticket.id)
        );

        setTickets(uniqueTickets);
        setRecentTickets(uniqueTickets.slice(0, 3));

        const bookingRes = await API.get("/bookings/my");
        const userBookings = Array.isArray(bookingRes.data)
          ? bookingRes.data
          : [];

        setBookings(userBookings);
      } catch (error) {
        console.log(error.message);
        setTickets([]);
        setRecentTickets([]);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const upcomingBookings = bookings
    .filter((b) => b.status === "APPROVED" || b.status === "PENDING")
    .slice(0, 3);

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col">

      {/* TOP BAR */}
      <div className="w-[92%] mx-auto pt-6 flex justify-end">
        <Link
          to="/user-tickets"
          className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-2xl font-bold shadow-lg transition"
        >
          + Create Ticket
        </Link>
      </div>

      {/* MAIN */}
      <main className="w-[92%] mx-auto py-10 flex-1">

        {/* STATS (CENTERED + BIGGER) */}
        <section className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl">

            {[
              { value: summary.totalBookings, label: "Total Bookings" },
              { value: summary.totalTickets, label: "Total Tickets" },
              { value: summary.activeTickets, label: "Active Tickets" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-slate-900 p-10 rounded-3xl border border-slate-700 shadow-2xl hover:-translate-y-2 transition text-center"
              >
                <h2 className="text-4xl font-bold text-white">
                  {item.value}
                </h2>
                <p className="text-slate-400 mt-3 text-lg">
                  {item.label}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">

          {/* BOOKINGS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">

            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold text-cyan-300">
                Upcoming Bookings
              </h2>
              <Link className="text-cyan-400">View All →</Link>
            </div>

            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : upcomingBookings.length === 0 ? (
              <p className="text-slate-500">No upcoming bookings</p>
            ) : (
              upcomingBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 hover:bg-slate-700 transition"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-white">{b.facilityName}</h3>
                      <p className="text-sm text-slate-400">
                        {b.startTime?.split("T")[0]}
                      </p>
                    </div>

                    <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm">
                      {b.status}
                    </span>
                  </div>

                  <p className="mt-2 text-slate-300">
                    {b.startTime?.replace("T", " ")} → {b.endTime?.replace("T", " ")}
                  </p>
                </div>
              ))
            )}

          </div>

          {/* TICKETS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">

            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold text-cyan-300">
                Recent Tickets
              </h2>
              <Link className="text-cyan-400">View All →</Link>
            </div>

            {loading ? (
              <p className="text-slate-400">Loading...</p>
            ) : recentTickets.length === 0 ? (
              <p className="text-slate-500">No tickets found</p>
            ) : (
              recentTickets.map((t) => (
                <div
                  key={t.id}
                  className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 h-[260px] flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-white">{t.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">
                      {t.description}
                    </p>

                    {t.imageUrls?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {t.imageUrls.slice(0, 3).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            className="w-full h-20 object-cover rounded-lg border border-slate-600"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-2">
                    <p>Status: <b className="text-white">{t.status}</b></p>
                    <p>Priority: <b className="text-white">{t.priority}</b></p>
                    <p>Category: <b className="text-white">{t.category}</b></p>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </main>

    </div>
  );
}