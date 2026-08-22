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

export default function UpcomingBookings() {
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("upcoming");

  // Booking ID received from notification
  const selectedBookingId =
    location.state?.bookingId;

  const token = localStorage.getItem("token");

  /* =========================================================
     FETCH BOOKINGS
  ========================================================= */

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings/provider`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to fetch bookings");
      }

      const data = await response.json();

      setBookings(data);
    } catch (error) {
      console.error("Bookings error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     OPEN EXACT BOOKING FROM NOTIFICATION
  ========================================================= */

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

    // Automatically open the correct tab
    if (
      selectedBooking.status === "COMPLETED"
    ) {
      setActiveTab("completed");
    } else if (
      selectedBooking.status === "REJECTED" ||
      selectedBooking.status === "CANCELLED"
    ) {
      setActiveTab("cancelled");
    } else {
      setActiveTab("upcoming");
    }

    // Scroll to the exact booking after rendering
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
    }, 100);
  }, [selectedBookingId, bookings]);

  /* =========================================================
     ACCEPT BOOKING
     REQUESTED -> ACCEPTED
  ========================================================= */

  const acceptBooking = async (bookingId) => {
    try {
      setProcessingBookingId(bookingId);

      const response = await fetch(
        `${API_URL}/api/bookings/provider/${bookingId}/status?status=ACCEPTED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "Accept booking failed:",
          response.status,
          responseText
        );

        alert(
          responseText || "Unable to accept booking."
        );

        return;
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? {
                ...booking,
                status: "ACCEPTED",
              }
            : booking
        )
      );

      alert("Booking accepted successfully.");
    } catch (error) {
      console.error("Accept booking error:", error);

      alert(
        "Something went wrong while accepting the booking."
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  /* =========================================================
     REJECT BOOKING
     REQUESTED -> REJECTED
  ========================================================= */

  const rejectBooking = async (bookingId) => {
    try {
      setProcessingBookingId(bookingId);

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "Reject booking failed:",
          response.status,
          responseText
        );

        alert(
          responseText || "Unable to reject booking."
        );

        return;
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? {
                ...booking,
                status: "REJECTED",
              }
            : booking
        )
      );

      alert("Booking rejected successfully.");

      setActiveTab("cancelled");
    } catch (error) {
      console.error("Reject booking error:", error);

      alert(
        "Something went wrong while rejecting the booking."
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  /* =========================================================
     COMPLETE BOOKING
     ACCEPTED -> COMPLETED
  ========================================================= */

  const completeBooking = async (bookingId) => {
    try {
      setProcessingBookingId(bookingId);

      const response = await fetch(
        `${API_URL}/api/bookings/provider/${bookingId}/status?status=COMPLETED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        alert(
          responseText || "Unable to complete booking."
        );

        return;
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.bookingId === bookingId
            ? {
                ...booking,
                status: "COMPLETED",
              }
            : booking
        )
      );

      alert(
        "Booking marked as completed successfully."
      );

      setActiveTab("completed");
    } catch (error) {
      console.error(
        "Complete booking error:",
        error
      );

      alert(
        "Something went wrong while completing the booking."
      );
    } finally {
      setProcessingBookingId(null);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="bg-surface min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="text-lg font-medium text-ink">
          Loading bookings...
        </p>
      </div>
    );
  }

  /* =========================================================
     FILTER BOOKINGS
  ========================================================= */

  const upcomingBookings = bookings.filter(
    (booking) =>
      booking.status === "REQUESTED" ||
      booking.status === "ACCEPTED" ||
      booking.status === "IN_PROGRESS"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status === "REJECTED" ||
      booking.status === "CANCELLED"
  );

  /* =========================================================
     ACTIVE BOOKINGS
  ========================================================= */

  let activeBookings = [];

  if (activeTab === "upcoming") {
    activeBookings = upcomingBookings;
  } else if (activeTab === "completed") {
    activeBookings = completedBookings;
  } else if (activeTab === "cancelled") {
    activeBookings = cancelledBookings;
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-ink">
            My Bookings
          </h1>

          <p className="text-sm text-sub mt-2">
            Manage the bookings made for your services.
          </p>
        </div>

        {/* TABS */}

        <div className="bg-white border border-line rounded-xl p-2 mb-8 grid grid-cols-3 gap-2">

          {/* UPCOMING */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("upcoming")
            }
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

          {/* COMPLETED */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("completed")
            }
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

          {/* CANCELLED */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("cancelled")
            }
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

        {/* ACTIVE TAB HEADER */}

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
                "Review and manage your requested and accepted bookings."}

              {activeTab === "completed" &&
                "Bookings that have been completed."}

              {activeTab === "cancelled" &&
                "Rejected or cancelled booking requests."}
            </p>
          </div>

          <span className="text-xs font-medium bg-white border border-line text-sub rounded-full px-3 py-1">
            {activeBookings.length} booking
            {activeBookings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* EMPTY STATE */}

        {activeBookings.length === 0 ? (
          <div className="bg-white border border-line rounded-xl p-10 shadow-sm text-center">

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

            <p className="text-gray-500 mt-2">
              {activeTab === "upcoming" &&
                "There are no requested or accepted bookings right now."}

              {activeTab === "completed" &&
                "You haven't completed any bookings yet."}

              {activeTab === "cancelled" &&
                "There are no rejected or cancelled bookings."}
            </p>
          </div>
        ) : (

          /* BOOKING CARDS */

          <div className="space-y-5">
            {activeBookings.map((booking) => {
              const isProcessing =
                processingBookingId ===
                booking.bookingId;

              const isSelected =
                String(booking.bookingId) ===
                String(selectedBookingId);

              return (
                <div
                  key={booking.bookingId}
                  id={`booking-${booking.bookingId}`}
                  className={`bg-white rounded-xl p-6 shadow-sm transition-all duration-500 ${
                    isSelected
                      ? "border-2 border-primary ring-4 ring-primary/20 shadow-lg"
                      : "border border-line"
                  }`}
                >

                  {/* Notification Selected Label */}

                  {isSelected && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 bg-primaryLight text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                        🔔 Opened from notification
                      </span>
                    </div>
                  )}

                  {/* TOP SECTION */}

                  <div className="flex flex-col md:flex-row md:justify-between gap-5">

                    {/* LEFT SIDE */}

                    <div className="flex-1">

                      {/* SERVICE TITLE + STATUS */}

                      <div className="flex flex-wrap items-center gap-3 mb-5">

                        <h2 className="font-semibold text-xl text-ink">
                          {booking.serviceTitle}
                        </h2>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            statusStyles[
                              booking.status
                            ] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* CUSTOMER DETAILS */}

                      <div className="border border-line rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-sm text-ink mb-3">
                          Customer Details
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">

                          <p>
                            <span className="font-medium text-ink">
                              Name:
                            </span>{" "}
                            {booking.customerName}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Email:
                            </span>{" "}
                            {booking.customerEmail ||
                              "Not available"}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Phone:
                            </span>{" "}
                            {booking.customerPhone ||
                              "Not available"}
                          </p>

                        </div>
                      </div>

                      {/* SERVICE DETAILS */}

                      <div className="border border-line rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-sm text-ink mb-3">
                          Service Details
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">

                          <p>
                            <span className="font-medium text-ink">
                              Service:
                            </span>{" "}
                            {booking.serviceTitle}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Date:
                            </span>{" "}
                            {booking.bookingDate}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Time:
                            </span>{" "}
                            {booking.bookingTime}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Address:
                            </span>{" "}
                            {booking.address}
                          </p>

                        </div>
                      </div>

                      {/* PAYMENT DETAILS */}

                      <div className="border border-line rounded-lg p-4">
                        <h3 className="font-semibold text-sm text-ink mb-3">
                          Payment Details
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600">

                          <p>
                            <span className="font-medium text-ink">
                              Amount:
                            </span>{" "}
                            ₹{booking.totalAmount}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Payment Method:
                            </span>{" "}
                            {booking.paymentMethod}
                          </p>

                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE - ACTIONS */}

                    <div className="flex flex-col items-start md:items-end gap-4">

                      {/* REQUESTED */}

                      {booking.status === "REQUESTED" && (
                        <div className="flex gap-3">

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              acceptBooking(
                                booking.bookingId
                              )
                            }
                            className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Accept"}
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              rejectBooking(
                                booking.bookingId
                              )
                            }
                            className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Reject"}
                          </button>

                        </div>
                      )}

                      {/* ACCEPTED */}

                      {booking.status === "ACCEPTED" && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            completeBooking(
                              booking.bookingId
                            )
                          }
                          className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isProcessing
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Mark as Completed"}
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
