import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api";

export default function TicketsDashboard() {
  const [tickets, setTickets] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const summary = {
    totalBookings: 12,
    totalTickets: tickets.length,
    activeTickets: tickets.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
    ).length,
    resolvedTickets: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  const upcomingBookings = [
    {
      id: 1,
      title: "Lab A-12 Booking",
      date: "April 20, 2026",
      time: "10:00 AM - 12:00 PM",
      status: "Confirmed",
    },
    {
      id: 2,
      title: "Meeting Room B3",
      date: "April 22, 2026",
      time: "2:30 PM - 4:00 PM",
      status: "Pending",
    },
  ];

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);

        const { data } = await API.get("/tickets/my");
        const allTickets = Array.isArray(data) ? data : data.data || [];

        const uniqueTickets = allTickets.filter(
          (ticket, index, arr) =>
            index === arr.findIndex((item) => item.id === ticket.id)
        );

        setTickets(uniqueTickets);
        setRecentTickets(uniqueTickets.slice(0, 3));
      } catch (error) {
        console.log(error.message);
        setTickets([]);
        setRecentTickets([]);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

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

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {[{
            value: summary.totalBookings,
            label: "Total Bookings"
          },{
            value: summary.totalTickets,
            label: "Total Tickets"
          },{
            value: summary.activeTickets,
            label: "Active Tickets"
          },{
            value: summary.resolvedTickets,
            label: "Resolved Tickets"
          }].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-lg hover:-translate-y-1 transition"
            >
              <h2 className="text-3xl font-bold text-white">{item.value}</h2>
              <p className="text-slate-400 mt-2">{item.label}</p>
            </div>
          ))}

        </section>

        {/* GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">

          {/* BOOKINGS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">

            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold text-cyan-300">Upcoming Bookings</h2>
              <Link className="text-cyan-400">View All →</Link>
            </div>

            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-800 p-4 rounded-xl mb-4 border border-slate-700 hover:bg-slate-700 transition"
              >

                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-white">{b.title}</h3>
                    <p className="text-sm text-slate-400">{b.date}</p>
                  </div>

                  <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm">
                    {b.status}
                  </span>
                </div>

                <p className="mt-2 text-slate-300">{b.time}</p>

              </div>
            ))}

          </div>

          {/* TICKETS */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl">

            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold text-cyan-300">Recent Tickets</h2>
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
                    <p className="text-slate-400 text-sm line-clamp-2">{t.description}</p>

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