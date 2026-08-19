import { useEffect, useState } from "react";

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

function RescheduleModal({ booking, onClose, onRescheduled }) {
  const [bookingDate, setBookingDate] = useState(booking.bookingDate || "");
  const [bookingTime, setBookingTime] = useState(booking.bookingTime || "");
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
          body: JSON.stringify({ bookingDate, bookingTime }),
        }
      );

      if (!response.ok) {
        let message = "Unable to reschedule booking. Please try again.";

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
        let message = "Unable to submit review. Please try again.";

        try {
          const body = await response.json();

          if (body?.message) {
            message = body.message;
          }
        } catch (_) {
          // Non-JSON error body
        }

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

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [justReviewed, setJustReviewed] = useState(null);

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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
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

  const handleRescheduled = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === updatedBooking.bookingId ? updatedBooking : b
      )
    );
    setReschedulingBooking(null);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
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
          b.bookingId === bookingId ? updatedBooking : b
        )
      );
      alert("Booking cancelled successfully.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while cancelling the booking.");
    }
  };

  const handleReviewSubmitted = (bookingId, savedReview) => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg">
        Loading bookings...
      </div>
    );
  }

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

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Page Header */}
        <h1 className="font-display font-700 text-2xl text-ink">
          My Bookings
        </h1>

        <p className="text-sm text-sub mt-1 mb-8">
          Track and manage your service requests.
        </p>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-line p-10 text-center">
            <h2 className="text-lg font-semibold">
              No Bookings Found
            </h2>

            <p className="text-sub mt-2">
              You haven't booked any service yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((b) => (
              <div
                key={b.bookingId}
                className="bg-white border border-line rounded-xl p-6 shadow-sm"
              >

                {/* Booking Header */}
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

                {/* Provider Contact Details */}
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

                {justReviewed === b.bookingId && (
                  <div className="text-xs text-green-600 mt-3">
                    Thanks for your review!
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 pt-4 border-t border-line flex flex-wrap justify-end gap-3">
                  {(b.status === "REQUESTED" || b.status === "ACCEPTED") && (
                    <>
                      <button
                        onClick={() => setReschedulingBooking(b)}
                        className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancelBooking(b.bookingId)}
                        className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
                      >
                        Cancel Booking
                      </button>
                    </>
                  )}

                  {b.status === "COMPLETED" && (
                    b.reviewed ? (
                      <span className="text-xs font-medium text-sub border border-line rounded-lg px-3 py-1.5">
                        Reviewed
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          setReviewingBooking(b)
                        }
                        className="text-xs font-medium text-primary border border-primary rounded-lg px-3 py-1.5 hover:bg-primaryLight transition-colors"
                      >
                        Review Provider
                      </button>
                    )
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {reschedulingBooking && (
        <RescheduleModal
          booking={reschedulingBooking}
          onClose={() => setReschedulingBooking(null)}
          onRescheduled={handleRescheduled}
        />
      )}

      {reviewingBooking && (
        <ReviewModal
          booking={reviewingBooking}
          onClose={() => setReviewingBooking(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}