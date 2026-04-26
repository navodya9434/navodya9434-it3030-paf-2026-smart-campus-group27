import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [commentInputs, setCommentInputs] = useState({});

  const [technicians] = useState([
    { id: 1, username: "sam_wick", email: "sam.tech@example.com" },
    { id: 2, username: "john_doe", email: "john.tech@example.com" },
    { id: 3, username: "ruwan_perera", email: "ruwan.tech@example.com" },
  ]);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
const { data } = await api.get("/tickets/all");
      const ticketList = Array.isArray(data) ? data : data?.data || [];
      setTickets(ticketList);

      ticketList.forEach((t) => loadComments(t.id));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId) => {
    try {
      const { data } = await api.get(`/tickets/${ticketId}/comments`);
      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: data,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (id, status, reason = null) => {
    try {
      let url = `/tickets/${id}/status?status=${status}`;
      if (reason) url += `&reason=${encodeURIComponent(reason)}`;

      await api.put(url);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, status, rejectionReason: reason || t.rejectionReason }
            : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const acceptTicket = (id) => updateTicketStatus(id, "IN_PROGRESS");

  const rejectTicket = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    updateTicketStatus(id, "REJECTED", reason);
  };

  const assignTechnician = async (id, email) => {
    if (!email) return;

    try {
      await api.put(`/tickets/${id}/assign?technicianEmail=${email}`);

      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, assignedTo: email } : t
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const sendAlert = async (ticket) => {
  try {
    await api.post(`/tickets/alert/${ticket.id}`);

    alert(
      `🚨 ALERT SENT\nTicket ID: ${ticket.id}\nLocation: ${ticket.location}`
    );
  } catch (err) {
    console.error(err);
    alert("Failed to send alert");
  }
};

  const addComment = async (ticketId) => {
    const message = commentInputs[ticketId];
    if (!message) return;

    try {
      await api.post(`/tickets/${ticketId}/comment`, { message });

      setCommentInputs((prev) => ({
        ...prev,
        [ticketId]: "",
      }));

      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Ticket Report", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["ID", "Title", "Location", "Priority", "Status"]],
      body: tickets.map((t) => [
        t.id,
        t.title,
        t.location,
        t.priority,
        t.status,
      ]),
    });

    doc.save("tickets.pdf");
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;

      const matchStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    });
  }, [tickets, searchTerm, priorityFilter, statusFilter]);

  // 🔥 SPLIT ACTIVE & PAST
  const activeTickets = filteredTickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "REJECTED"
  );

  const pastTickets = filteredTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "REJECTED"
  );

  const TicketCard = ({ t, isPast }) => (
    <div className="rounded-xl border border-slate-700 bg-slate-950/55 p-5 shadow-lg backdrop-blur-xl">

      <div className="flex justify-between">
        <h3 className="font-bold text-white">{t.title}</h3>

        <span className="px-3 py-1 text-xs rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-200">
          {t.priority}
        </span>
      </div>

      <p className="text-slate-300 mt-2">📍 {t.location}</p>

      <p className="mt-2 text-sm font-semibold text-yellow-300">
        Status: {t.status}
      </p>

      {t.imageUrls?.length > 0 && (
        <div className="flex gap-2 mt-2">
          {t.imageUrls.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              className="w-14 h-14 rounded-lg object-cover border border-slate-600"
            />
          ))}
        </div>
      )}

      {/* COMMENTS (only active) */}
      <div className="mt-3">
        <h4 className="text-sm font-bold mb-1">Comments</h4>

        {commentsMap[t.id]?.map((c) => (
          <div
            key={c.id}
            className="mt-1 p-2 rounded bg-slate-800/50 border-l-4 border-purple-400"
          >
            <p className="text-sm">
              <b>{c.userName}</b>: {c.message}
            </p>
          </div>
        ))}

        {!isPast && (
          <>
            <input
              placeholder="Add comment..."
              value={commentInputs[t.id] || ""}
              onChange={(e) =>
                setCommentInputs({
                  ...commentInputs,
                  [t.id]: e.target.value,
                })
              }
              className="mt-2 w-full p-2 rounded bg-slate-900 border border-slate-600 text-white text-sm"
            />

            <button
              onClick={() => addComment(t.id)}
              className="mt-1 bg-cyan-500 px-3 py-1 rounded text-sm"
            >
              Post
            </button>
          </>
        )}
      </div>

      {/* ACTIVE CONTROLS ONLY */}
      {!isPast && (
        <>
          <div className="mt-3">
            <select
              className="w-full p-2 rounded-lg bg-slate-900/80 border border-slate-600 text-white"
              onChange={(e) => assignTechnician(t.id, e.target.value)}
            >
              <option value="">Assign Technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.email}>
                  {tech.username}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2">
            <select
              className="w-full p-2 rounded-lg bg-slate-900/80 border border-slate-600 text-white"
              value={t.status}
              onChange={(e) => updateTicketStatus(t.id, e.target.value)}
            >
              <option>OPEN</option>
              <option>IN_PROGRESS</option>
              <option>RESOLVED</option>
              <option>REJECTED</option>
            </select>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => acceptTicket(t.id)}
              className="flex-1 bg-emerald-500/80 hover:bg-emerald-500 p-2 rounded-lg text-white"
            >
              Accept
            </button>

            <button
              onClick={() => rejectTicket(t.id)}
              className="flex-1 bg-rose-500/80 hover:bg-rose-500 p-2 rounded-lg text-white"
            >
              Reject
            </button>

            <button
              onClick={() => sendAlert(t)}
              className="flex-1 bg-yellow-500/80 hover:bg-yellow-500 p-2 rounded-lg text-white"
            >
              Alert
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen text-white bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">

      <div className="px-6 py-5 border-b border-slate-700 bg-slate-950/60 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">Tickets Management</h1>
      </div>

      <div className="px-6 pt-4">
        <button
          onClick={generatePDF}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          Download PDF
        </button>
      </div>

      <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        <h2 className="col-span-full text-xl font-bold text-emerald-400">
          Active Tickets
        </h2>

        {activeTickets.map((t) => (
          <TicketCard key={t.id} t={t} isPast={false} />
        ))}

        <h2 className="col-span-full text-xl font-bold text-slate-400 mt-6">
          Past Tickets
        </h2>

        {pastTickets.map((t) => (
          <TicketCard key={t.id} t={t} isPast={true} />
        ))}
      </div>
    </div>
  );
}