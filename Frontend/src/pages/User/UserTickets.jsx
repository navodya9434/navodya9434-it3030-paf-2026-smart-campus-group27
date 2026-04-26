import { useEffect, useState } from "react";
import API from "../../api";

const TICKET_NOTIFICATION_KEY = "ticket_notifications";

const readTicketNotifications = () => {
  try {
    const stored = localStorage.getItem(TICKET_NOTIFICATION_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function UserTickets() {
  const [tickets, setTickets] = useState([]);
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    priority: "LOW",
    location: "",
    contact: "",
    description: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/tickets/my");
      const ticketList = Array.isArray(data) ? data : data.data || [];
      setTickets(ticketList);
      ticketList.forEach((t) => loadComments(t.id));
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (ticketId) => {
    try {
      const { data } = await API.get(`/tickets/${ticketId}/comments`);
      setCommentsMap((prev) => ({ ...prev, [ticketId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = "Title required";
    if (!form.location) newErrors.location = "Location required";
    if (!form.category) newErrors.category = "Category required";
    if (!form.contact) newErrors.contact = "Email required";
    if (!form.description) newErrors.description = "Description required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const promises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((images) => {
      setForm({ ...form, images });
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError("");
    setSubmitLoading(true);

    const payload = {
      title: form.title,
      category: form.category,
      priority: form.priority,
      location: form.location,
      contactEmail: form.contact,
      contactPhone: "",
      description: form.description,
      imageUrls: form.images,
    };

    try {
      const { data } = await API.post("/tickets", payload);
      setTickets((prev) => [data, ...prev]);

      const notification = {
        id: `ticket-${data?.id || Date.now()}`,
        title: "New Ticket Created",
        message: `${data?.title || form.title} was submitted successfully`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      const currentNotifications = readTicketNotifications();
      localStorage.setItem(
        TICKET_NOTIFICATION_KEY,
        JSON.stringify([notification, ...currentNotifications].slice(0, 20))
      );

      window.dispatchEvent(new Event("ticket-created"));

      setForm({
        title: "",
        category: "",
        priority: "LOW",
        location: "",
        contact: "",
        description: "",
        images: [],
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string"
          ? err.response.data
          : "Failed to submit ticket");
      setSubmitError(message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteTicket = async (id) => {
    try {
      await API.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (ticketId) => {
    const message = commentInputs[ticketId];
    if (!message) return;

    try {
      await API.post(`/tickets/${ticketId}/comment`, { message });
      setCommentInputs({ ...commentInputs, [ticketId]: "" });
      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const editComment = async (commentId, oldMessage, ticketId) => {
    const newMessage = prompt("Edit comment:", oldMessage);
    if (!newMessage) return;

    try {
      await API.put(`/tickets/comment/${commentId}`, {
        message: newMessage,
      });
      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const removeComment = async (commentId, ticketId) => {
    try {
      await API.delete(`/tickets/comment/${commentId}`);
      loadComments(ticketId);
    } catch (err) {
      console.error(err);
    }
  };

  const activeTickets = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
  );

  const pastTickets = tickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "REJECTED"
  );

  const TicketCard = ({ t }) => (
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg backdrop-blur-xl w-full max-w-md h-[520px] flex flex-col justify-between">

      <div>
        <h3 className="font-bold text-white">{t.title}</h3>
        <p className="text-slate-300 text-sm mt-1">📍 {t.location}</p>
        <p className="text-xs mt-1 text-cyan-300">{t.status}</p>

        {/* FIXED IMAGE GRID */}
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

        {/* COMMENTS */}
        <div className="mt-3 max-h-32 overflow-y-auto">
          {commentsMap[t.id]?.map((c) => {
            const isAdmin = c.userName?.includes("admin");

            return (
              <div
                key={c.id}
                className={`mt-1 p-2 rounded text-xs ${
                  isAdmin
                    ? "bg-slate-800 border"
                    : "ml-4 bg-slate-700 border-l-4 border-purple-400"
                }`}
              >
                <b>{c.userName}</b>: {c.message}

                {!isAdmin && (
                  <div className="mt-1">
                    <button
                      className="text-blue-400 mr-2"
                      onClick={() => editComment(c.id, c.message, t.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-400"
                      onClick={() => removeComment(c.id, t.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <input
          placeholder="Add comment..."
          value={commentInputs[t.id] || ""}
          onChange={(e) =>
            setCommentInputs({
              ...commentInputs,
              [t.id]: e.target.value,
            })
          }
          className="mt-2 w-full p-2 rounded bg-slate-800 border border-slate-600 text-white text-sm"
        />

        <button
          onClick={() => addComment(t.id)}
          className="mt-1 bg-cyan-500 px-3 py-1 rounded text-sm"
        >
          Post
        </button>
      </div>

      <button
        onClick={() => deleteTicket(t.id)}
        className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
    </div>
  );

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <div className="px-6 py-5 border-b border-slate-700 bg-slate-950/60 backdrop-blur-xl">
        <h1 className="text-2xl font-bold">My Tickets</h1>
        <p className="text-slate-400 text-sm">Manage your submitted tickets</p>
      </div>

      <div className="w-[92%] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 py-10">

        {/* FORM */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24 h-fit">
          <h2 className="text-xl font-bold mb-4">Create Ticket</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded" />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded" />

            <select name="category" onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded">
              <option value="">Category</option>
              <option>Equipment</option>
              <option>Furniture</option>
              <option>Network</option>
              <option>Other</option>
            </select>

            <select name="priority" onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded">
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>

            <input name="contact" placeholder="Email" value={form.contact} onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded" />

            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-3 bg-slate-800 border border-slate-700 rounded h-24" />

            <input type="file" multiple accept="image/*" onChange={handleImages} />

            <button type="submit" className="bg-blue-600 p-3 rounded font-bold">
              {submitLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>

        {/* TICKETS */}
        <div>

          <h2 className="text-xl font-bold mb-4 text-cyan-300">Active Tickets</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeTickets.map((t) => (
              <TicketCard key={t.id} t={t} />
            ))}
          </div>

          <h2 className="text-xl font-bold mt-10 mb-4 text-pink-400">Past Tickets</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastTickets.map((t) => (
              <TicketCard key={t.id} t={t} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}