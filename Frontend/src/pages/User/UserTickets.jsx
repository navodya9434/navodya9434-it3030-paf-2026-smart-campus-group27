import { useEffect, useState } from "react";
import API from "../../api";
//jsx file for user to view and manage their tickets, also create new tickets
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
  const [commentsMap, setCommentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [facilities, setFacilities] = useState([]);

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

  useEffect(() => {
    loadTickets();
    API.get("/facilities")
      .then((res) => setFacilities(res.data))
      .catch((err) => console.error(err));
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

    if (!form.title.trim()) newErrors.title = "Title required";
    if (!form.location.trim()) newErrors.location = "Location required";
    if (!form.category.trim()) newErrors.category = "Category required";
    if (!form.contact.trim()) newErrors.contact = "Email required";

    if (!form.description.trim()) {
      newErrors.description = "Description required";
    } else if (form.description.trim().length <= 20) {
      newErrors.description =
        "Description must be more than 20 characters";
    }

    if (!form.images || form.images.length < 1) {
      newErrors.images = "At least 1 image is required";
    } else if (form.images.length > 3) {
      newErrors.images = "Maximum 3 images allowed";
    }

    if (!form.contact.trim()) {
  newErrors.contact = "Email or contact number is required";
} else {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const isValidEmail = emailRegex.test(form.contact.trim());
  const isValidPhone = phoneRegex.test(form.contact.trim());

  if (!isValidEmail && !isValidPhone) {
    newErrors.contact =
      "Enter a valid email or 10-digit contact number";
  }
}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // clear field error while typing
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 3) {
      setErrors((prev) => ({
        ...prev,
        images: "Maximum 3 images allowed",
      }));
      return;
    }

    const promises = files.slice(0, 3).map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then((images) => {
      setForm({ ...form, images });

      setErrors((prev) => ({
        ...prev,
        images: "",
      }));
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
        JSON.stringify([
          notification,
          ...currentNotifications,
        ].slice(0, 20))
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

      setErrors({});
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
    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 shadow-lg backdrop-blur-xl w-full h-[460px] flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-white">{t.title}</h3>
        <p className="text-slate-300 text-sm mt-1">📍 {t.location}</p>
        <p className="text-xs mt-1 text-cyan-300">{t.status}</p>

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

        <div className="mt-3 max-h-32 overflow-y-auto">
          {commentsMap[t.id]?.map((c) => {
            const isOwn =
              c.userEmail === currentUserEmail ||
              c.userName === currentUserEmail;

            return (
              <div
                key={c.id}
                className={`mt-1 p-2 rounded text-xs ${
                  isOwn
                    ? "bg-slate-800 border"
                    : "ml-4 bg-slate-700 border-l-4 border-purple-400"
                }`}
              >
                <b>{c.userName?.split("@")[0]}</b>: {c.message}

                {isOwn && (
                  <div className="mt-1">
                    <button
                      className="text-blue-400 mr-2"
                      onClick={() =>
                        editComment(c.id, c.message, t.id)
                      }
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

    
    </div>
  );

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">

      <div className="max-w-6xl mx-auto space-y-6 pt-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl text-center">
          <h1 className="text-2xl font-bold text-cyan-300">
            Tickets
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Request & manage support tickets
          </p>
        </div>
      </div>

      <div className="w-[92%] mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 py-10">

        {/* FORM */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl sticky top-24 h-fit">
          <h2 className="text-xl font-bold mb-4">Create Ticket</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded"
            />
            {errors.title && <p className="text-red-400 text-xs">{errors.title}</p>}

            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded"
            >
              <option value="">Select Location</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.location && <p className="text-red-400 text-xs">{errors.location}</p>}

            <select
              name="category"
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded"
            >
              <option value="">Category</option>
              <option>Equipment</option>
              <option>Furniture</option>
              <option>Network</option>
              <option>Other</option>
            </select>
            {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}

            <select
              name="priority"
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded"
            >
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>

            <input
              name="contact"
              placeholder="Email / Contact Number"
              value={form.contact}
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded"
            />
            {errors.contact && <p className="text-red-400 text-xs">{errors.contact}</p>}

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="p-3 bg-slate-800 border border-slate-700 rounded h-24"
            />
            {errors.description && (
              <p className="text-red-400 text-xs">{errors.description}</p>
            )}

            <input type="file" multiple accept="image/*" onChange={handleImages} />
            {errors.images && <p className="text-red-400 text-xs">{errors.images}</p>}

            <button
              type="submit"
              className="bg-blue-600 p-3 rounded font-bold"
              disabled={submitLoading}
            >
              {submitLoading ? "Submitting..." : "Submit"}
            </button>

            {submitError && (
              <p className="text-red-400 text-sm">{submitError}</p>
            )}
          </form>
        </div>

        {/* TICKETS */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-cyan-300">
            Active Tickets
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <p>Loading...</p>
            ) : (
              activeTickets.map((t) => (
                <TicketCard key={t.id} t={t} />
              ))
            )}
          </div>

          <h2 className="text-xl font-bold mt-10 mb-4 text-pink-400">
            Past Tickets
          </h2>

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