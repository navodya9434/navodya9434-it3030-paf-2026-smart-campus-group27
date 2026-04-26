import { useEffect, useState } from "react";
import API from "../../api";

const TICKET_NOTIFICATION_KEY = "ticket_notifications";

const currentUserEmail = JSON.parse(localStorage.getItem("user"))?.email;
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
  const [commentsMap, setCommentsMap] = useState({}); // ✅ NEW
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

      // ✅ LOAD COMMENTS FOR EACH TICKET
      ticketList.forEach((t) => loadComments(t.id));
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: LOAD COMMENTS
  const loadComments = async (ticketId) => {
    try {
      const { data } = await API.get(`/tickets/${ticketId}/comments`);
      setCommentsMap((prev) => ({
        ...prev,
        [ticketId]: data,
      }));
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

      loadComments(ticketId); // ✅ reload only that ticket comments
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
        @keyframes ticketFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glowFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @media (prefers-reduced-motion: reduce) { .ticket-animate { animation: none !important; } }
      `}</style>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,233,218,0.85),rgba(15,23,42,0.9))]"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/45 to-transparent"></div>
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[color:var(--teal)]/25 blur-[90px] ticket-animate" style={{ animation: "glowFloat 6s ease-in-out infinite" }}></div>
      <div className="pointer-events-none absolute -right-20 bottom-16 h-80 w-80 rounded-full bg-[color:var(--copper)]/30 blur-[100px] ticket-animate" style={{ animation: "glowFloat 7s ease-in-out infinite" }}></div>

      <div className="relative mx-auto w-[92%] max-w-6xl py-10">
        <header className="ticket-animate rounded-[32px] border border-white/30 bg-white/80 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl" style={{ animation: "ticketFade 550ms ease-out" }}>
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--copper)]">Tickets</p>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--ink)]">Request Studio</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Submit, track, and collaborate on support tickets with a clear view of active and resolved updates.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
          <div className="ticket-animate sticky top-24 h-fit rounded-[30px] border border-white/60 bg-white/85 p-7 shadow-[0_30px_70px_rgba(15,23,42,0.16)]" style={{ animation: "ticketFade 600ms ease-out 80ms both" }}>
            <h2 className="text-2xl font-bold text-[color:var(--ink)]">Create Ticket</h2>
            <p className="mt-2 text-sm text-slate-600">Describe the issue and attach evidence if needed.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {submitError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <div>
                <input
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--teal)]"
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              <div>
                <input
                  name="location"
                  placeholder="Location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none focus:border-[color:var(--teal)]"
                />
                {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select name="category" onChange={handleChange} className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none">
                  <option value="">Select Category</option>
                  <option>Equipment</option>
                  <option>Furniture</option>
                  <option>Network</option>
                  <option>Other</option>
                </select>

                <select name="priority" onChange={handleChange} className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none">
                  <option>LOW</option>
                  <option>MEDIUM</option>
                  <option>HIGH</option>
                </select>
              </div>

              <input
                name="contact"
                placeholder="Email"
                value={form.contact}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="h-32 w-full rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-4 py-3 text-sm text-[color:var(--ink)] outline-none"
              />

              <div className="rounded-2xl border border-dashed border-[color:var(--stone)] bg-white/60 px-4 py-3 text-xs text-slate-600">
                <input type="file" multiple accept="image/*" onChange={handleImages} className="text-sm" />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full rounded-full bg-[color:var(--teal)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_14px_30px_rgba(15,118,110,0.35)] transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                {submitLoading ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-10">
            <section className="ticket-animate" style={{ animation: "ticketFade 650ms ease-out 120ms both" }}>
              <h2 className="text-2xl font-bold text-[color:var(--ink)]">Active Tickets</h2>
              <p className="mt-1 text-sm text-slate-600">{activeTickets.length} active tickets in progress</p>

              <div className="mt-5 space-y-4">
  {loading ? (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-slate-500">
      Loading...
    </div>
  ) : (
    activeTickets.map((t) => (
      <div
        key={t.id}
        className="rounded-[26px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.12)]"
      >
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--ink)]">
              {t.title}
            </h3>
            <p className="text-sm text-slate-600">{t.location}</p>
          </div>

          <span className="rounded-full bg-[color:var(--teal)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--teal)]">
            {t.status}
          </span>
        </div>

        {/* IMAGES */}
        {t.imageUrls?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {t.imageUrls.map((img, i) => (
              <img
                key={i}
                src={img}
                className="h-20 w-20 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        {/* ===== COMMENTS (FIXED STRUCTURE) ===== */}
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Comments
          </h4>

          <div className="mt-3 space-y-2">
            {commentsMap[t.id]?.map((c) => {
              const isOwn =
                c.userEmail === currentUserEmail ||
                c.userName === currentUserEmail;

              return (
                <div
                  key={c.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                      isOwn
                        ? "bg-[color:var(--teal)]/10 border border-[color:var(--teal)]/30 text-right"
                        : "bg-[color:var(--sand)]/80 border border-white/70"
                    }`}
                  >
                    <p className="text-slate-700">
                      <span className="font-semibold text-[color:var(--ink)]">
                        {c.userName}
                      </span>
                      : {c.message}
                    </p>

                    {isOwn && (
                      <div className="mt-2 flex gap-3 text-xs justify-end">
                        <button
                          className="text-[color:var(--teal)]"
                          onClick={() =>
                            editComment(c.id, c.message, t.id)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="text-red-600"
                          onClick={() =>
                            removeComment(c.id, t.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INPUT */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              placeholder="Add comment..."
              value={commentInputs[t.id] || ""}
              onChange={(e) =>
                setCommentInputs({
                  ...commentInputs,
                  [t.id]: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm text-[color:var(--ink)] outline-none"
            />

            <button
              onClick={() => addComment(t.id)}
              className="rounded-full bg-[color:var(--teal)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Post
            </button>
          </div>
        </div>

        {/* DELETE TICKET */}
        <button
          onClick={() => deleteTicket(t.id)}
          className="mt-4 rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
        >
          Delete
        </button>
      </div>
    ))
  )}
</div>
            </section>

            <section className="ticket-animate" style={{ animation: "ticketFade 700ms ease-out 160ms both" }}>
              <h2 className="text-2xl font-bold text-[color:var(--ink)]">Past Tickets</h2>
              <p className="mt-1 text-sm text-slate-600">{pastTickets.length} resolved or rejected</p>

              <div className="mt-5 space-y-4">
                {pastTickets.map((t) => (
                  <div key={t.id} className="rounded-[26px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[color:var(--ink)]">{t.title}</h3>
                        <p className="text-sm text-slate-600">{t.location}</p>
                      </div>
                      <span className="rounded-full bg-[color:var(--stone)] px-3 py-1 text-xs font-semibold text-slate-700">
                        {t.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {commentsMap[t.id]?.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-white/70 bg-[color:var(--sand)]/80 px-3 py-2 text-sm text-slate-700">
                          <span className="font-semibold text-[color:var(--ink)]">{c.userName}</span>: {c.message}
                        </div>
                      ))}
                    </div>

                    {t.rejectionReason && (
                      <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {t.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}