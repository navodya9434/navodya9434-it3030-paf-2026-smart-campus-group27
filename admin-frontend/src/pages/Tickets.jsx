import { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../api";
//jsx file for the admin tickets page, showing all tickets in the system with options to filter, search, and manage them. Admins can approve/reject tickets, assign technicians, and view details. This is a key page for admins to oversee all reported issues and their statuses.
export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLocked, setActionLocked] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [groupByLocation, setGroupByLocation] = useState(false);

  const [locationFilter, setLocationFilter] = useState(""); // RESTORED (from V2)

  const [commentInputs, setCommentInputs] = useState({});
  const [editInputs, setEditInputs] = useState({});
  const [editingId, setEditingId] = useState(null);

  const [reportType, setReportType] = useState("ALL");

  const currentUserEmail = JSON.parse(localStorage.getItem("user"))?.email;

  useEffect(() => {
  loadTickets();
  loadTechnicians();
}, []);

const [technicians, setTechnicians] = useState([]);

const loadTechnicians = async () => {
  try {
    const { data } = await api.get("/technicians/all");
    setTechnicians(data);
  } catch (err) {
    console.error(err);
  }
};
const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchLocation =
        locationFilter === "" ||
        t.location?.toLowerCase().includes(locationFilter.toLowerCase());

      const matchPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;

      const matchStatus =
        statusFilter === "ALL" || t.status === statusFilter;

      return matchSearch && matchLocation && matchPriority && matchStatus;
    });
  }, [tickets, searchTerm, locationFilter, priorityFilter, statusFilter]);

  const processedTickets = useMemo(() => {
    if (!groupByLocation) return filteredTickets;

    return [...filteredTickets].sort((a, b) =>
      (a.location || "").localeCompare(b.location || "")
    );
  }, [filteredTickets, groupByLocation]);

  const activeTickets = processedTickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "REJECTED"
  );

const groupedTickets = useMemo(() => {
  if (!groupByLocation) return null;

  return filteredTickets.reduce((acc, ticket) => {
    const loc = ticket.location || "Unknown";

    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(ticket);

    return acc;
  }, {});
}, [filteredTickets, groupByLocation]);
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

  const acceptTicket = async (id) => {
    if (actionLocked[id]?.approved) return;

    await updateTicketStatus(id, "IN_PROGRESS");

    setActionLocked((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        approved: true,
        rejected: false,
      },
    }));
  };

  const rejectTicket = async (id) => {
    if (actionLocked[id]?.rejected) return;

    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    await updateTicketStatus(id, "REJECTED", reason);

    setActionLocked((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        rejected: true,
        approved: false,
      },
    }));
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
    if (actionLocked[ticket.id]?.alert) return;

    await api.post(`/tickets/alert/${ticket.id}`);

    setActionLocked((prev) => ({
      ...prev,
      [ticket.id]: {
        ...prev[ticket.id],
        alert: true,
      },
    }));
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

  const updateComment = async (commentId, ticketId) => {
    const message = editInputs[commentId];
    if (!message) return;

    try {
      await api.put(`/tickets/comment/${commentId}`, { message });
      setEditingId(null);
      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId, ticketId) => {
    try {
      await api.delete(`/tickets/comment/${commentId}`);
      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Ticket Report", 14, 15);

    let data = tickets;

    if (reportType === "ACTIVE") {
      data = tickets.filter(
        (t) => t.status !== "RESOLVED" && t.status !== "REJECTED"
      );
    } else if (reportType === "PAST") {
      data = tickets.filter(
        (t) => t.status === "RESOLVED" || t.status === "REJECTED"
      );
    }

    autoTable(doc, {
      startY: 25,
      head: [["ID", "Title", "Location", "Priority", "Status"]],
      body: data.map((t) => [
        t.id,
        t.title,
        t.location,
        t.priority,
        t.status,
      ]),
    });

    doc.save("tickets.pdf");
  };

  
  const pastTickets = processedTickets.filter(
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

      {/* IMAGES */}
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

      {/* ➕ ADDED: TECHNICIAN ASSIGNMENT (ACTIVE ONLY) */}
      {!isPast && (
        <div className="mt-3">
          <label className="text-xs text-slate-400">Assign Technician</label>

          <select
            value={t.assignedTo || ""}
            onChange={(e) => assignTechnician(t.id, e.target.value)}
            className="w-full mt-1 p-2 rounded bg-slate-900 border border-slate-600 text-white text-sm"
          >
            <option value="">Select technician</option>

            {technicians.map((tech) => (
              <option key={tech.id} value={tech.email}>
                {tech.username} ({tech.email})
              </option>
            ))}
          </select>

          {t.assignedTo && (
            <p className="text-xs text-cyan-300 mt-1">
              👨‍🔧 Assigned: {t.assignedTo}
            </p>
          )}
        </div>
      )}

      {/* COMMENTS */}
      <div className="mt-3 max-h-32 overflow-y-auto">
        <h4 className="text-sm font-bold mb-1">Comments</h4>

        {commentsMap[t.id]?.map((c) => {
          const isOwn = c.userName === currentUserEmail;

          return (
            <div
              key={c.id}
              className={`mt-2 flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs p-2 rounded border-l-4 ${
                isOwn
                  ? "bg-cyan-800/40 border-cyan-400 text-right"
                  : "bg-slate-800/50 border-purple-400"
              }`}>

                <p className="text-sm">
                  <b>{c.userName?.split("@")[0]}</b>: {c.message}
                </p>
              </div>
            </div>
          );
        })}

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

      {/* ACTION BUTTONS (UNCHANGED) */}
      {!isPast && (
        <div className="flex gap-2 mt-3 flex-wrap">

          <button
            onClick={() => acceptTicket(t.id)}
            disabled={actionLocked[t.id]?.approved || t.status !== "OPEN"}
            className={`px-3 py-1 text-xs rounded ${
              actionLocked[t.id]?.approved || t.status !== "OPEN"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 text-black"
            }`}
          >
            {actionLocked[t.id]?.approved ? "Approved ✓" : "Approve"}
          </button>

          <button
            onClick={() => rejectTicket(t.id)}
            disabled={actionLocked[t.id]?.rejected || t.status === "REJECTED"}
            className={`px-3 py-1 text-xs rounded ${
              actionLocked[t.id]?.rejected || t.status === "REJECTED"
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white"
            }`}
          >
            {actionLocked[t.id]?.rejected ? "Rejected ✓" : "Reject"}
          </button>
          <button
onClick={async () => {
  await updateTicketStatus(t.id, "RESOLVED");
  await api.put(`/tickets/alert/resolve-by-ticket/${t.id}`);
}}  disabled={t.status === "RESOLVED" || t.status === "REJECTED"}
  className={`px-3 py-1 text-xs rounded ${
    t.status === "RESOLVED"
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-blue-500 text-white"
  }`}
> 
  {t.status === "RESOLVED" ? "Resolved ✓" : "Mark Resolved"}
</button>

          <button
            onClick={() => sendAlert(t)}
            disabled={actionLocked[t.id]?.alert}
            className={`px-3 py-1 text-xs rounded ${
              actionLocked[t.id]?.alert
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-black"
            }`}
          >
            {actionLocked[t.id]?.alert ? "Alert Sent ✓" : "Alert"}
          </button>

        </div>
      )}

    </div>
  );

  return (
    <div className="min-h-screen text-white bg-linear-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="px-6 py-5 border-b border-slate-700 bg-slate-950/60 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">Tickets Management</h1>
      </div>

      <div className="p-6 grid md:grid-cols-4 gap-3">
        <input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-slate-900 border border-slate-600"
        />

        <input
          placeholder="Filter by location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="p-2 rounded bg-slate-900 border border-slate-600"
        />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="p-2 rounded bg-slate-900 border border-slate-600"
        >
          <option value="ALL">All Priority</option>
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 rounded bg-slate-900 border border-slate-600"
        >
          <option value="ALL">All Status</option>
          <option>OPEN</option>
          <option>IN_PROGRESS</option>
          <option>RESOLVED</option>
          <option>REJECTED</option>
        </select>
      </div>

      <div className="px-6 flex gap-3">
        <button
          onClick={() => setGroupByLocation((p) => !p)}
          className={`px-4 py-2 rounded-lg border ${
            groupByLocation
              ? "bg-cyan-500 text-black"
              : "bg-slate-900 border-slate-600"
          }`}
        >
          Group by Location
        </button>

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

        {groupByLocation && groupedTickets ? (
  Object.entries(groupedTickets).map(([location, tickets]) => (
    <div key={location} className="col-span-full">
      
      <h2 className="text-lg font-bold text-cyan-300 mt-4 mb-2">
        📍 {location}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tickets
          .filter((t) => t.status !== "RESOLVED" && t.status !== "REJECTED")
          .map((t) => (
            <TicketCard key={t.id} t={t} isPast={false} />
          ))}
      </div>
    </div>
  ))
) : (
  activeTickets.map((t) => (
    <TicketCard key={t.id} t={t} isPast={false} />
  ))
)}

        <h2 className="col-span-full text-xl font-bold text-slate-400 mt-6">
          Past Tickets
        </h2>

        {groupByLocation && groupedTickets ? (
  Object.entries(groupedTickets).map(([location, tickets]) => (
    <div key={location} className="col-span-full">
      
      <h2 className="text-lg font-bold text-slate-400 mt-6 mb-2">
        📍 {location}
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tickets
          .filter((t) => t.status === "RESOLVED" || t.status === "REJECTED")
          .map((t) => (
            <TicketCard key={t.id} t={t} isPast={true} />
          ))}
      </div>
    </div>
  ))
) : (
  pastTickets.map((t) => (
    <TicketCard key={t.id} t={t} isPast={true} />
  ))
)}
      </div>
    </div>
  );
}