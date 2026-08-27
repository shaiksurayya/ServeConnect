import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { useNavigate } from "react-router-dom";
import BookingChat from "../../components/chat/BookingChat";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [chattingBooking, setChattingBooking] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [serviceRes, bookingRes, dashboardRes] = await Promise.all([
        fetch(`${API_URL}/api/services/provider`, {
          headers,
        }),

        fetch(`${API_URL}/api/bookings/provider`, {
          headers,
        }),

        fetch(`${API_URL}/api/dashboard/provider`, {
          headers,
        }),
      ]);

      const serviceData = serviceRes.ok
        ? await serviceRes.json()
        : [];

      const bookingData = bookingRes.ok
        ? await bookingRes.json()
        : [];

      const dashboardData = dashboardRes.ok
        ? await dashboardRes.json()
        : null;

      // Reviews are fetched using the authenticated provider ID
      let reviewData = [];

      if (dashboardData?.providerId) {
        const reviewRes = await fetch(
          `${API_URL}/api/reviews/provider/${dashboardData.providerId}`,
          {
            headers,
          }
        );

        reviewData = reviewRes.ok
          ? await reviewRes.json()
          : [];
      }

      setServices(serviceData);
      setBookings(bookingData);
      setReviews(reviewData);
      setDashboardStats(dashboardData);

      setError("");
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ACCEPT BOOKING
   *
   * Keep the existing working Accept flow.
   * Only REQUESTED bookings can be accepted.
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

      // Update ONLY the selected booking
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

      // Refresh dashboard statistics
      await fetchDashboard();
    } catch (err) {
      console.error("Accept booking error:", err);
      alert("Something went wrong while accepting the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  /*
   * REJECT BOOKING
   *
   * This is intentionally separate from Accept.
   *
   * Only the selected REQUESTED booking is rejected.
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

      // Update ONLY the rejected booking.
      // Other REQUESTED bookings remain untouched.
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

      // Refresh dashboard statistics
      await fetchDashboard();
    } catch (err) {
      console.error("Reject booking error:", err);
      alert("Something went wrong while rejecting the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  /*
   * COMPLETE BOOKING
   *
   * Only ACCEPTED bookings can be completed.
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
        console.error(
          "Complete booking failed:",
          response.status,
          responseText
        );

        alert(responseText || "Unable to complete booking.");
        return;
      }

      // Update ONLY the selected booking
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

      // Refresh dashboard statistics
      await fetchDashboard();
    } catch (err) {
      console.error("Complete booking error:", err);
      alert("Something went wrong while completing the booking.");
    } finally {
      setProcessingBookingId(null);
    }
  };

  const toggleServiceAvailability = async (serviceId, currentAvailability) => {
    try {
      const response = await fetch(
        `${API_URL}/api/services/provider/${serviceId}/availability?availability=${!currentAvailability}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Failed to update service availability.");
        return;
      }

      const updatedService = await response.json();
      setServices((prev) =>
        prev.map((s) => (s.serviceId === serviceId ? updatedService : s))
      );
    } catch (err) {
      console.error("Toggle availability error:", err);
      alert("Something went wrong.");
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/services/${serviceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Failed to delete service.");
        return;
      }

      alert("Service deleted successfully.");

      setServices((prevServices) =>
        prevServices.filter(
          (service) => service.serviceId !== serviceId
        )
      );
    } catch (err) {
      console.error("Delete service error:", err);
      alert("Something went wrong.");
    }
  };

  const topStats = [
    {
      label: "Total Bookings",
      value: dashboardStats?.totalBookings || 0,
    },
    {
      label: "Completed Earnings",
      value: `₹${dashboardStats?.totalCompletedEarnings ?? 0}`,
    },
    {
      label: "Rating",
      value: `${dashboardStats?.averageRating || 0.0} ★`,
    },
  ];

  const secondStats = [
    {
      label: "Pending / Requested",
      value: dashboardStats?.pendingBookings || 0,
    },
    {
      label: "Accepted",
      value: dashboardStats?.acceptedBookings || 0,
    },
    {
      label: "Completed",
      value: dashboardStats?.completedBookings || 0,
    },
    {
      label: "Rejected",
      value: dashboardStats?.rejectedBookings || 0,
    },
    {
      label: "Cancelled",
      value: dashboardStats?.cancelledBookings || 0,
    },
    {
      label: "My Services",
      value: dashboardStats?.totalServices || 0,
    },
    {
      label: "Total Reviews",
      value: dashboardStats?.totalReviews || 0,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg font-medium">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="font-display font-bold text-3xl text-ink">
          Welcome, {user?.name} 👋
        </h1>

        <p className="text-sm text-sub mt-2 mb-8">
          Here's what's happening with your services.
        </p>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Second Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {secondStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Add Service */}
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-xl font-semibold">
            My Services
          </h2>

          <button
            onClick={() =>
              navigate("/dashboard/provider/add-service")
            }
            className="bg-primary hover:bg-primaryDark text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            + Add Service
          </button>
        </div>

        {/* Services List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.length === 0 ? (
            <p className="text-gray-500 col-span-full">
              No services available.
            </p>
          ) : (
            services.map((service) => (
              <div
                key={service.serviceId}
                className="bg-white border border-line rounded-xl p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg text-ink">
                    {service.title}
                  </h3>

                  <p className="text-sm text-sub mt-2">
                    {service.description}
                  </p>

                  <div className="text-lg font-display font-bold text-ink mt-3">
                    ₹{service.price}
                  </div>

                  <div className="text-xs text-sub mt-1">
                    {service.duration} mins
                  </div>

                  <div
                    className={`text-xs font-medium mt-1.5 ${
                      service.availability
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {service.availability
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      toggleServiceAvailability(
                        service.serviceId,
                        service.availability
                      )
                    }
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      service.availability
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    }`}
                  >
                    {service.availability
                      ? "Mark Unavailable"
                      : "Mark Available"}
                  </button>

                  <button
                    onClick={() =>
                      deleteService(service.serviceId)
                    }
                    className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>


        {/* Upcoming Bookings */}
        <div className="bg-white border border-line rounded-xl p-6 mt-8 shadow-sm">

          <h2 className="text-xl font-semibold mb-5">
            Upcoming Bookings
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">
              No bookings available.
            </p>
          ) : (
            <div className="space-y-4">

              {bookings.map((booking) => {

                const isProcessing =
                  processingBookingId === booking.bookingId;

                return (
                  <div
                    key={booking.bookingId}
                    className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center"
                  >

                    {/* Booking Details */}
                    <div>

                      <h3 className="font-semibold text-lg">
                        {booking.serviceTitle}
                      </h3>

                      <p className="text-sm text-gray-600 mt-1">
                        Customer :
                        <span className="font-medium">
                          {" "}
                          {booking.customerName}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600">
                        Date : {booking.bookingDate}
                      </p>

                      <p className="text-sm text-gray-600">
                        Time : {booking.bookingTime}
                      </p>

                      <p className="text-sm text-gray-600">
                        Address : {booking.address}
                      </p>

                      <p className="text-sm text-gray-600">
                        Amount : ₹{booking.totalAmount}
                      </p>

                      <div className="mt-3">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "REQUESTED"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-700"
                              : booking.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status}
                        </span>

                      </div>

                    </div>

                    {/* Booking Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 md:mt-0 items-center">
                      <button
                        type="button"
                        onClick={() => setChattingBooking(booking)}
                        className="bg-primaryLight text-primary hover:bg-primary hover:text-white px-3 py-2 rounded-lg text-xs font-medium border border-primary/20 transition-colors flex items-center gap-1"
                      >
                        <span>💬</span> Chat
                      </button>

                      {booking.status === "REQUESTED" && (
                        <>
                          {/* Accept */}
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              acceptBooking(booking.bookingId)
                            }
                            className={`bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Accept"}
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() =>
                              rejectBooking(booking.bookingId)
                            }
                            className={`bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {isProcessing
                              ? "Processing..."
                              : "Reject"}
                          </button>
                        </>
                      )}

                      {/* Complete */}
                      {booking.status === "ACCEPTED" && (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            completeBooking(booking.bookingId)
                          }
                          className={`bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition-colors ${
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
                );
              })}

            </div>
          )}

        </div>

        {/* Reviews */}
        <div className="bg-white border border-line rounded-xl p-6 mt-8 shadow-sm">

          <h2 className="text-xl font-semibold mb-5">
            Customer Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">
              No reviews available.
            </p>
          ) : (
            <div className="space-y-4">

              {reviews.map((review) => (

                <div
                  key={review.reviewId}
                  className="border rounded-lg p-4"
                >

                  <div className="flex justify-between items-center">

                    <h3 className="font-semibold">
                      {review.customerName}
                    </h3>

                    <span className="text-yellow-500 font-semibold">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>

                  </div>

                  <p className="text-gray-600 mt-2">
                    {review.comment}
                  </p>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

      {/* CHAT MODAL */}
      {chattingBooking && (
        <BookingChat
          booking={chattingBooking}
          onClose={() => setChattingBooking(null)}
        />
      )}
    </div>
  );
}
