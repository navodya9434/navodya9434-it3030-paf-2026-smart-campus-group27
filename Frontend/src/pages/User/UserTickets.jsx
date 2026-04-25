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
    <div className="min-h-screen bg-linear-to-br from-purple-100 via-blue-100 to-cyan-100">
      <div className="w-[92%] mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10 py-10">

        {/* LEFT SIDE FORM (UNCHANGED) */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-purple-200 sticky top-24 h-fit">
          <h2 className="text-2xl font-extrabold text-center mb-6 bg-linear-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            Create Ticket
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {submitError && (
              <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">
                {submitError}
              </p>
            )}

            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="p-4 border rounded-xl" />
            {errors.title && <p className="text-red-500">{errors.title}</p>}

            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="p-4 border rounded-xl" />
            {errors.location && <p className="text-red-500">{errors.location}</p>}

            <select name="category" onChange={handleChange} className="p-4 border rounded-xl">
              <option value="">Select Category</option>
              <option>Equipment</option>
              <option>Furniture</option>
              <option>Network</option>
              <option>Other</option>
            </select>

            <select name="priority" onChange={handleChange} className="p-4 border rounded-xl">
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>

            <input name="contact" placeholder="Email" value={form.contact} onChange={handleChange} className="p-4 border rounded-xl" />

            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="p-4 border rounded-xl h-32" />

            <input type="file" multiple accept="image/*" onChange={handleImages} />

            <button type="submit" disabled={submitLoading} className="bg-linear-to-r from-purple-600 via-pink-500 to-cyan-500 text-white font-bold p-4 rounded-xl hover:scale-105 transition">
              {submitLoading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-10">

          {/* ACTIVE */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-purple-700">
              Active Tickets ({activeTickets.length})
            </h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              activeTickets.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-2xl shadow-lg border mb-4">

                  <h3 className="text-lg font-bold text-purple-700">{t.title}</h3>
                  <p>{t.location}</p>
                  <p>Status: <b>{t.status}</b></p>

                  {t.imageUrls?.map((img, i) => (
                    <img key={i} src={img} className="rounded-xl mt-2 max-w-full" />
                  ))}

                  {/* COMMENTS */}
                  <div className="mt-4">
                    <h4 className="font-bold">Comments</h4>

                    {commentsMap[t.id]?.map((c) => {
                      const isAdmin = c.userName?.includes("admin"); // 🔥 simple detection

                      return (
                        <div
                          key={c.id}
                          className={`mt-2 p-2 rounded ${
                            isAdmin
                              ? "bg-blue-50 ml-6 border-l-4 border-blue-400"
                              : "border"
                          }`}
                        >
                          <p>
                            <b>{c.userName}</b>: {c.message}
                          </p>

                          {!isAdmin && (
                            <>
                              <button
                                className="text-blue-500 text-xs mr-2"
                                onClick={() =>
                                  editComment(c.id, c.message, t.id)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="text-red-500 text-xs"
                                onClick={() =>
                                  removeComment(c.id, t.id)
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      );
                    })}

                    <input
                      placeholder="Add comment..."
                      value={commentInputs[t.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({
                          ...commentInputs,
                          [t.id]: e.target.value,
                        })
                      }
                      className="border p-2 rounded w-full mt-2"
                    />

                    <button
                      onClick={() => addComment(t.id)}
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Post
                    </button>
                  </div>

                  <button onClick={() => deleteTicket(t.id)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl">
                    Delete
                  </button>

                </div>
              ))
            )}
          </div>

          {/* PAST */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-pink-600">
              Past Tickets ({pastTickets.length})
            </h2>

            {pastTickets.map((t) => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-lg border mb-4">

                <h3 className="font-bold">{t.title}</h3>
                <p>{t.location}</p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-gray-200">
                  {t.status}
                </span>

                {commentsMap[t.id]?.map((c) => (
                  <div key={c.id} className="border p-2 rounded mt-2">
                    <p><b>{c.userName}</b>: {c.message}</p>
                  </div>
                ))}

                {t.rejectionReason && (
                  <p className="mt-3 text-red-600 bg-red-100 p-2 rounded-lg">
                    {t.rejectionReason}
                  </p>
                )}

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}