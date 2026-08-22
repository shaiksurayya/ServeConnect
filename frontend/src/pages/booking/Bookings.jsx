import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const statusStyles = {
  REQUESTED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

/* =========================================================
   STAR PICKER
========================================================= */

function StarPicker({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl leading-none ${
            star <= rating ? "text-amber-400" : "text-gray-300"
          }`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* =========================================================
   RESCHEDULE MODAL
========================================================= */

function RescheduleModal({ booking, onClose, onRescheduled }) {
  const [bookingDate, setBookingDate] = useState(
    booking.bookingDate || ""
  );

  const [bookingTime, setBookingTime] = useState(
    booking.bookingTime || ""
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!bookingDate || !bookingTime) {
      setError("Please select both a valid date and time.");
      return;
    }

    if (bookingDate < todayStr) {
      setError("Booking date cannot be in the past.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login/customer";
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/customer/${booking.bookingId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingDate,
            bookingTime,
          }),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to reschedule booking. Please try again.";

        try {
          const body = await response.json();

          if (body?.message) {
            message = body.message;
          }
        } catch (_) {}

        setError(message);
        return;
      }

      const updatedBooking = await response.json();

      onRescheduled(updatedBooking);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-line p-6 w-full max-w-md">
        <h2 className="font-display font-700 text-lg text-ink">
          Reschedule Booking #{booking.bookingId}
        </h2>

        <p className="text-sm text-sub mt-1 mb-4">
          {booking.serviceTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-1">
              New Booking Date
            </label>

            <input
              type="date"
              min={todayStr}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-1">
              New Booking Time
            </label>

            <input
              type="time"
              value={bookingTime}
              onChange={(e) => setBookingTime(e.target.value)}
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-line text-ink rounded-lg py-2 text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW MODAL
========================================================= */

function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login/customer";
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        let message =
          "Unable to submit review. Please try again.";

        try {
          const body = await response.json();

          if (body?.message) {
            message = body.message;
          }
        } catch (_) {}

        setError(message);
        return;
      }

      const savedReview = await response.json();

      onSubmitted(booking.bookingId, savedReview);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl border border-line p-6 w-full max-w-md">
        <h2 className="font-display font-700 text-lg text-ink">
          Review {booking.providerName}
        </h2>

        <p className="text-sm text-sub mt-1 mb-4">
          {booking.serviceTitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-ink block mb-2">
              Rating
            </label>

            <StarPicker
              rating={rating}
              onChange={setRating}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink block mb-2">
              Comment
            </label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how the service went..."
              rows="4"
              className="w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-line text-ink rounded-lg py-2 text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primaryDark transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING CARD
========================================================= */

function BookingCard({
  booking,
  onReschedule,
  onCancel,
  onReview,
  justReviewed,
  isSelected,
}) {
  const b = booking;

  return (
    <div
      id={`booking-${b.bookingId}`}
      className={`bg-white rounded-xl p-6 shadow-sm transition-all duration-500 ${
        isSelected
          ? "border-2 border-primary ring-4 ring-primary/20 shadow-lg"
          : "border border-line"
      }`}
    >
      {/* Notification Highlight */}
      {isSelected && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 bg-primaryLight text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
            🔔 Opened from notification
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">
            {b.serviceTitle}
          </h2>

          <p className="text-xs text-sub mt-1">
            Booking #{b.bookingId}
          </p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1 rounded-full w-fit ${
            statusStyles[b.status] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {b.status}
        </span>
      </div>

      {/* Service Details */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-ink mb-3">
          Service Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-sub">
              Service
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              {b.serviceTitle}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Status
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              {b.status}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Booking Date
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              📅 {b.bookingDate}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Booking Time
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              🕒 {b.bookingTime}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-sub">
              Service Address
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              📍 {b.address}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Total Amount
            </p>

            <p className="text-sm font-semibold text-ink mt-1">
              ₹{b.totalAmount}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Payment Method
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              {b.paymentMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Provider Contact */}
      <div className="mt-6 pt-5 border-t border-line">
        <h3 className="text-sm font-semibold text-ink mb-3">
          Provider Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-sub">
              Provider Name
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              {b.providerName}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Email
            </p>

            <p className="text-sm font-medium text-ink mt-1 break-all">
              📧 {b.providerEmail || "Not available"}
            </p>
          </div>

          <div>
            <p className="text-xs text-sub">
              Phone
            </p>

            <p className="text-sm font-medium text-ink mt-1">
              📞 {b.providerPhone || "Not available"}
            </p>
          </div>
        </div>
      </div>

      {/* Review */}
      {b.reviewed && b.reviewRating && (
        <div className="mt-6 pt-5 border-t border-line">
          <h3 className="text-sm font-semibold text-ink mb-2">
            Your Review
          </h3>

          <div className="text-sm text-amber-500">
            {"★".repeat(b.reviewRating)}
            {"☆".repeat(5 - b.reviewRating)}
          </div>

          {b.reviewComment && (
            <p className="text-sm text-sub mt-2">
              "{b.reviewComment}"
            </p>
          )}
        </div>
      )}

      {/* Review Success */}
      {justReviewed === b.bookingId && (
        <div className="text-xs text-green-600 mt-3">
          Thanks for your review!
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-line flex flex-wrap justify-end gap-3">
        {(b.status === "REQUESTED" ||
          b.status === "ACCEPTED") && (
          <>
            <button
              onClick={() => onReschedule(b)}
              className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
            >
              Reschedule
            </button>

            <button
              onClick={() => onCancel(b.bookingId)}
              className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
            >
              Cancel Booking
            </button>
          </>
        )}

        {b.status === "COMPLETED" &&
          (b.reviewed ? (
            <span className="text-xs font-medium text-sub border border-line rounded-lg px-3 py-1.5">
              Reviewed
            </span>
          ) : (
            <button
              onClick={() => onReview(b)}
              className="text-xs font-medium text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primaryLight transition-colors"
            >
              Review Provider
            </button>
          ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN BOOKINGS PAGE
========================================================= */

export default function Bookings() {
  const location = useLocation();

  const selectedBookingId =
    location.state?.bookingId;

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] =
    useState("upcoming");

  const [reviewingBooking, setReviewingBooking] =
    useState(null);

  const [reschedulingBooking, setReschedulingBooking] =
    useState(null);

  const [justReviewed, setJustReviewed] =
    useState(null);

  /* =======================================================
     FETCH BOOKINGS
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login/customer";
      return;
    }

    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/customer`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();

      setBookings(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load your bookings right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     OPEN EXACT BOOKING FROM NOTIFICATION
  ======================================================= */

  useEffect(() => {
    if (!selectedBookingId || bookings.length === 0) {
      return;
    }

    const selectedBooking = bookings.find(
      (booking) =>
        String(booking.bookingId) ===
        String(selectedBookingId)
    );

    if (!selectedBooking) {
      return;
    }

    // Select the correct tab
    if (selectedBooking.status === "COMPLETED") {
      setActiveTab("completed");
    } else if (
      selectedBooking.status === "CANCELLED" ||
      selectedBooking.status === "REJECTED"
    ) {
      setActiveTab("cancelled");
    } else {
      setActiveTab("upcoming");
    }

    // Scroll after tab/content has rendered
    setTimeout(() => {
      const element = document.getElementById(
        `booking-${selectedBooking.bookingId}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 200);
  }, [selectedBookingId, bookings]);

  /* =======================================================
     RESCHEDULE
  ======================================================= */

  const handleRescheduled = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === updatedBooking.bookingId
          ? updatedBooking
          : b
      )
    );

    setReschedulingBooking(null);
  };

  /* =======================================================
     CANCEL BOOKING
  ======================================================= */

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this booking?"
      )
    ) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login/customer";
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/customer/${bookingId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = "Unable to cancel booking.";

        try {
          const body = await response.json();

          if (body?.message) {
            message = body.message;
          }
        } catch (_) {}

        alert(message);
        return;
      }

      const updatedBooking = await response.json();

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId
            ? updatedBooking
            : b
        )
      );

      alert("Booking cancelled successfully.");

      setActiveTab("cancelled");
    } catch (err) {
      console.error(err);

      alert(
        "Something went wrong while cancelling the booking."
      );
    }
  };

  /* =======================================================
     REVIEW SUBMITTED
  ======================================================= */

  const handleReviewSubmitted = (
    bookingId,
    savedReview
  ) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === bookingId
          ? {
              ...b,
              reviewed: true,
              reviewRating: savedReview.rating,
              reviewComment: savedReview.comment,
            }
          : b
      )
    );

    setReviewingBooking(null);

    setJustReviewed(bookingId);

    setTimeout(() => {
      setJustReviewed(null);
    }, 4000);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Loading bookings...
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="bg-surface min-h-[calc(100vh-73px)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl border border-line p-10 text-center">
            <h2 className="text-lg font-semibold text-red-600">
              {error}
            </h2>

            <button
              onClick={fetchBookings}
              className="mt-4 text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primaryLight transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     FILTER BOOKINGS
  ======================================================= */

  const upcomingBookings = bookings.filter(
    (b) =>
      b.status === "REQUESTED" ||
      b.status === "ACCEPTED" ||
      b.status === "IN_PROGRESS"
  );

  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  );

  const cancelledBookings = bookings.filter(
    (b) =>
      b.status === "CANCELLED" ||
      b.status === "REJECTED"
  );

  /* =======================================================
     ACTIVE BOOKINGS
  ======================================================= */

  let activeBookings = [];

  if (activeTab === "upcoming") {
    activeBookings = upcomingBookings;
  } else if (activeTab === "completed") {
    activeBookings = completedBookings;
  } else if (activeTab === "cancelled") {
    activeBookings = cancelledBookings;
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Page Header */}

        <div className="mb-8">
          <h1 className="font-display font-700 text-2xl text-ink">
            My Bookings
          </h1>

          <p className="text-sm text-sub mt-1">
            Track and manage your service requests.
          </p>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="bg-white border border-line rounded-xl p-2 mb-8 grid grid-cols-3 gap-2">

          {/* Upcoming */}

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-primary text-white"
                : "text-sub hover:bg-surface"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>🔵 Upcoming</span>

              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  activeTab === "upcoming"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {upcomingBookings.length}
              </span>
            </div>
          </button>

          {/* Completed */}

          <button
            onClick={() => setActiveTab("completed")}
            className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "completed"
                ? "bg-green-600 text-white"
                : "text-sub hover:bg-surface"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>🟢 Completed</span>

              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  activeTab === "completed"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {completedBookings.length}
              </span>
            </div>
          </button>

          {/* Cancelled */}

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
              activeTab === "cancelled"
                ? "bg-red-600 text-white"
                : "text-sub hover:bg-surface"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <span>🔴 Cancelled</span>

              <span
                className={`text-xs rounded-full px-2 py-0.5 ${
                  activeTab === "cancelled"
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cancelledBookings.length}
              </span>
            </div>
          </button>
        </div>

        {/* =================================================
            ACTIVE TAB TITLE
        ================================================= */}

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {activeTab === "upcoming" &&
                "Upcoming Bookings"}

              {activeTab === "completed" &&
                "Completed Bookings"}

              {activeTab === "cancelled" &&
                "Cancelled Bookings"}
            </h2>

            <p className="text-xs text-sub mt-1">
              {activeTab === "upcoming" &&
                "Your requested, accepted and ongoing bookings."}

              {activeTab === "completed" &&
                "Services that have been completed."}

              {activeTab === "cancelled" &&
                "Cancelled or rejected booking requests."}
            </p>
          </div>

          <span className="text-xs font-medium bg-white border border-line text-sub rounded-full px-3 py-1">
            {activeBookings.length} booking
            {activeBookings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* =================================================
            NO BOOKINGS IN CURRENT TAB
        ================================================= */}

        {activeBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-line p-10 text-center">
            <div className="text-4xl mb-4">
              {activeTab === "upcoming" && "📅"}
              {activeTab === "completed" && "✅"}
              {activeTab === "cancelled" && "❌"}
            </div>

            <h2 className="text-lg font-semibold text-ink">
              {activeTab === "upcoming" &&
                "No Upcoming Bookings"}

              {activeTab === "completed" &&
                "No Completed Bookings"}

              {activeTab === "cancelled" &&
                "No Cancelled Bookings"}
            </h2>

            <p className="text-sub mt-2">
              {activeTab === "upcoming" &&
                "You don't have any upcoming bookings."}

              {activeTab === "completed" &&
                "You haven't completed any services yet."}

              {activeTab === "cancelled" &&
                "You don't have any cancelled or rejected bookings."}
            </p>
          </div>
        ) : (
          /* =================================================
             BOOKING CARDS
          ================================================= */

          <div className="space-y-5">
            {activeBookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onReschedule={setReschedulingBooking}
                onCancel={handleCancelBooking}
                onReview={setReviewingBooking}
                justReviewed={justReviewed}
                isSelected={
                  String(booking.bookingId) ===
                  String(selectedBookingId)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* ===================================================
          RESCHEDULE MODAL
      =================================================== */}

      {reschedulingBooking && (
        <RescheduleModal
          booking={reschedulingBooking}
          onClose={() =>
            setReschedulingBooking(null)
          }
          onRescheduled={handleRescheduled}
        />
      )}

      {/* ===================================================
          REVIEW MODAL
      =================================================== */}

      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={() =>
            setReviewingBooking(null)
          }
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}
