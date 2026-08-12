import { useEffect, useState } from "react";
import StatCard from "../../components/ui/StatCard";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ProviderDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Temporary for testing
  // Later replace with:
  // const providerId = user.providerId;
  const providerId = 1;

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      const [serviceRes, bookingRes, reviewRes] = await Promise.all([
        fetch(`${API_URL}/api/services/provider/${providerId}`, {
          headers,
        }),
        fetch(`${API_URL}/api/bookings/provider/${providerId}`, {
          headers,
        }),
        fetch(`${API_URL}/api/reviews/provider/${providerId}`, {
          headers,
        }),
      ]);

      const serviceData = serviceRes.ok
        ? await serviceRes.json()
        : [];

      const bookingData = bookingRes.ok
        ? await bookingRes.json()
        : [];

      const reviewData = reviewRes.ok
        ? await reviewRes.json()
        : [];

      setServices(serviceData);
      setBookings(bookingData);
      setReviews(reviewData);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        alert("Unable to update booking.");
        return;
      }

      alert(`Booking ${status.toLowerCase()} successfully.`);

      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const totalServices = services.length;
  const totalBookings = bookings.length;

  const pending = bookings.filter(
    (b) => b.status === "REQUESTED"
  ).length;

  const accepted = bookings.filter(
    (b) => b.status === "ACCEPTED"
  ).length;

  const completed = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const topStats = [
    {
      label: "My Services",
      value: totalServices,
    },
    {
      label: "Bookings",
      value: totalBookings,
    },
    {
      label: "Rating",
      value: `${avgRating} ★`,
    },
  ];

  const secondStats = [
    {
      label: "Pending",
      value: pending,
    },
    {
      label: "Accepted",
      value: accepted,
    },
    {
      label: "Completed",
      value: completed,
    },
    {
      label: "Reviews",
      value: reviews.length,
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
        <div className="flex justify-end mt-6">
          <button
            onClick={() => navigate("/dashboard/provider/add-service")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium"
          >
            + Add Service
          </button>
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

              {bookings.map((booking) => (

                <div
                  key={booking.bookingId}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:justify-between md:items-center"
                >

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
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          booking.status === "REQUESTED"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>

                    </div>

                  </div>

                  {booking.status === "REQUESTED" && (

                    <div className="flex gap-3 mt-4 md:mt-0">

                      <button
                        onClick={() =>
                          updateStatus(
                            booking.bookingId,
                            "ACCEPTED"
                          )
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          updateStatus(
                            booking.bookingId,
                            "REJECTED"
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                      >
                        Reject
                      </button>

                    </div>

                  )}

                </div>

              ))}

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
    </div>
  );
}
