import { useEffect, useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const statusStyles = {
  REQUESTED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function BookingChat({ booking, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Retrieve current user and token
  let currentUser = null;
  try {
    const stored = localStorage.getItem("user");
    if (stored && stored !== "undefined") {
      currentUser = JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading user from localStorage:", e);
  }

  const token = localStorage.getItem("token");
  const loginMode = localStorage.getItem("loginMode");

  const isCustomer =
    loginMode === "CUSTOMER" ||
    (currentUser?.email &&
      booking?.customerEmail &&
      currentUser.email.toLowerCase() === booking.customerEmail.toLowerCase()) ||
    (currentUser?.userId &&
      booking?.customerId &&
      currentUser.userId === booking.customerId);

  const otherPartyName = isCustomer
    ? booking.providerName || "Service Provider"
    : booking.customerName || "Customer";

  const otherPartyRole = isCustomer ? "Provider" : "Customer";

  // Auto-scroll to bottom of chat
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Fetch messages from backend API
  const fetchMessages = async (isInitial = false) => {
    if (!token || !booking?.bookingId) return;

    try {
      const res = await fetch(
        `${API_URL}/api/bookings/${booking.bookingId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (isInitial) {
          const body = await res.json().catch(() => null);
          setError(body?.message || "Failed to load chat messages.");
        }
        return;
      }

      const data = await res.json();
      setMessages(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      if (isInitial) {
        setError("Unable to connect to chat server.");
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  // Initial load and polling setup
  useEffect(() => {
    fetchMessages(true);

    // Poll every 3 seconds for new messages
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [booking?.bookingId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault();

    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    if (!token) {
      alert("You must be logged in to send messages.");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/api/bookings/${booking.bookingId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: trimmed }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to send message.");
      }

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setInputText("");
      setTimeout(() => scrollToBottom(true), 50);
    } catch (err) {
      console.error("Send message error:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Helper to check if message was sent by the currently logged-in user
  const isSentByMe = (msg) => {
    if (
      currentUser?.email &&
      msg.senderEmail &&
      currentUser.email.toLowerCase() === msg.senderEmail.toLowerCase()
    ) {
      return true;
    }
    if (
      currentUser?.userId &&
      msg.senderId &&
      currentUser.userId === msg.senderId
    ) {
      return true;
    }
    if (currentUser?.id && msg.senderId && currentUser.id === msg.senderId) {
      return true;
    }
    return false;
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl border border-line shadow-2xl w-full max-w-xl flex flex-col h-[600px] max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-line bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primaryLight text-primary flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-700 text-base text-ink leading-tight">
                  {otherPartyName}
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {otherPartyRole}
                </span>
              </div>
              <p className="text-xs text-sub mt-0.5">
                Booking #{booking.bookingId} • {booking.serviceTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                statusStyles[booking.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {booking.status}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-ink transition-colors text-lg font-semibold"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/40">
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-sub">
              <span className="animate-pulse">Loading conversation...</span>
            </div>
          ) : error && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <button
                onClick={() => fetchMessages(true)}
                className="text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primaryLight transition-colors"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-sub">
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-semibold text-ink text-sm">No messages yet</h3>
              <p className="text-xs text-sub mt-1 max-w-xs">
                Start the conversation with {otherPartyName} regarding this booking.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const mine = isSentByMe(msg);
              return (
                <div
                  key={msg.messageId}
                  className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`text-[11px] mb-1 px-1 text-sub flex items-center gap-1.5 ${
                      mine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-medium text-ink/80">
                      {mine ? "You" : msg.senderName}
                    </span>
                    <span>•</span>
                    <span>{formatMessageTime(msg.createdAt)}</span>
                  </div>

                  <div
                    className={`px-4 py-2.5 text-sm rounded-2xl max-w-[85%] sm:max-w-[75%] break-words whitespace-pre-wrap shadow-xs ${
                      mine
                        ? "bg-primary text-white rounded-tr-xs"
                        : "bg-white border border-line text-ink rounded-tl-xs"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-line bg-white">
          {error && messages.length > 0 && (
            <p className="text-xs text-red-600 mb-2 px-1">{error}</p>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${otherPartyName}...`}
              disabled={sending}
              maxLength={2000}
              className="flex-1 border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-surface/30 focus:bg-white transition-colors"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primaryDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
