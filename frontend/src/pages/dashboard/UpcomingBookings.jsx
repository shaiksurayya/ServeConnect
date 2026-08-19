import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);

  const token = localStorage.getItem("token");

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

  /*
   * ACCEPT BOOKING
   * REQUESTED -> ACCEPTED
   */
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

        alert(responseText || "Unable to accept booking.");
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
      alert("Something went wrong while accepting the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  /*
   * REJECT BOOKING
   * REQUESTED -> REJECTED
   */
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

        alert(responseText || "Unable to reject booking.");
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
    } catch (error) {
      console.error("Reject booking error:", error);
      alert("Something went wrong while rejecting the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  /*
   * COMPLETE BOOKING
   * ACCEPTED -> COMPLETED
   */
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
        alert(responseText || "Unable to complete booking.");
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

      alert("Booking marked as completed successfully.");
    } catch (error) {
      console.error("Complete booking error:", error);
      alert("Something went wrong while completing the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="text-lg font-medium text-ink">
          Loading upcoming bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="font-display font-bold text-3xl text-ink">
          Upcoming Bookings
        </h1>

        <p className="text-sm text-sub mt-2 mb-8">
          Manage the bookings made for your services.
        </p>

        {bookings.length === 0 ? (
          <div className="bg-white border border-line rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">
              No upcoming bookings available.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {bookings.map((booking) => {
              const isProcessing =
                processingBookingId === booking.bookingId;

              return (
                <div
                  key={booking.bookingId}
                  className="bg-white border border-line rounded-xl p-6 shadow-sm"
                >

                  {/* TOP SECTION */}
                  <div className="flex flex-col md:flex-row md:justify-between gap-5">

                    {/* LEFT */}
                    <div className="flex-1">

                      {/* SERVICE TITLE */}
                      <div className="flex items-center gap-3 mb-5">
                        <h2 className="font-semibold text-xl text-ink">
                          {booking.serviceTitle}
                        </h2>

                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "REQUESTED"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-700"
                              : booking.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "REJECTED" || booking.status === "CANCELLED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
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
                            {booking.customerEmail || "Not available"}
                          </p>

                          <p>
                            <span className="font-medium text-ink">
                              Phone:
                            </span>{" "}
                            {booking.customerPhone || "Not available"}
                          </p>

                        </div>
                      </div>

                      {/* SERVICE / BOOKING DETAILS */}
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

                      {/* ACCEPT + REJECT */}
                      {booking.status === "REQUESTED" && (
                        <div className="flex gap-3">

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              acceptBooking(booking.bookingId)
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
                              rejectBooking(booking.bookingId)
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

                      {/* COMPLETE */}
                      {booking.status === "ACCEPTED" && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            completeBooking(booking.bookingId)
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