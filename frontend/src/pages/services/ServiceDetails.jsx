import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadServiceDetails();
  }, [serviceId]);

  const loadServiceDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const [serviceResponse, reviewsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/services/${serviceId}`),
          fetch(`${API_URL}/api/reviews/service/${serviceId}`),
        ]);

      if (!serviceResponse.ok) {
        throw new Error("Unable to load service");
      }

      if (!reviewsResponse.ok) {
        throw new Error("Unable to load reviews");
      }

      const serviceData = await serviceResponse.json();
      const reviewsData = await reviewsResponse.json();

      setService(serviceData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Service details error:", error);
      setError(
        "Unable to load service details right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-surface flex items-center justify-center">
        <p className="text-lg font-medium text-ink">
          Loading service details...
        </p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="bg-surface min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white border border-line rounded-xl p-10 text-center">
            <h2 className="text-lg font-semibold text-red-600">
              {error || "Service not found"}
            </h2>

            <button
              onClick={() => navigate("/services")}
              className="mt-5 text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primaryLight transition-colors"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back button */}

        <button
          onClick={() => navigate("/services")}
          className="text-sm text-sub hover:text-primary transition-colors mb-6"
        >
          ← Back to Services
        </button>

        {/* Service Details Card */}

        <div className="bg-white border border-line rounded-xl p-6 md:p-8">

          {/* Header */}

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

            <div>

              <div className="flex items-center gap-3 flex-wrap">

                <h1 className="font-display font-bold text-2xl text-ink">
                  {service.title}
                </h1>

                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    service.availability
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {service.availability
                    ? "Available"
                    : "Currently unavailable"}
                </span>

              </div>

              <p className="text-sm text-sub mt-2">
                Category:{" "}
                <span className="font-medium text-ink">
                  {service.categoryName}
                </span>
              </p>

              <p className="text-sm text-sub mt-1">
                Provider:{" "}
                <span className="font-medium text-ink">
                  {service.providerName}
                </span>
              </p>

            </div>

            {/* Price */}

            <div className="md:text-right">

              <div className="text-2xl font-display font-bold text-ink">
                ₹{service.price}
              </div>

              <div className="text-sm text-sub mt-1">
                {service.duration} minutes
              </div>

            </div>

          </div>

          {/* Description */}

          <div className="mt-8 pt-6 border-t border-line">

            <h2 className="text-lg font-semibold text-ink">
              About this service
            </h2>

            <p className="text-sm text-sub mt-3 leading-6">
              {service.description ||
                "No description provided for this service."}
            </p>

          </div>

          {/* Rating Summary */}

          <div className="mt-8 pt-6 border-t border-line">

            <h2 className="text-lg font-semibold text-ink">
              Customer Reviews
            </h2>

            {reviews.length > 0 ? (

              <div className="mt-4">

                <div className="flex items-center gap-3">

                  <span className="text-2xl font-bold text-ink">
                    {averageRating.toFixed(1)}
                  </span>

                  <div>

                    <div className="text-amber-500 text-lg">
                      {"★".repeat(
                        Math.round(averageRating)
                      )}
                      {"☆".repeat(
                        5 -
                          Math.round(averageRating)
                      )}
                    </div>

                    <p className="text-xs text-sub">
                      Based on {reviews.length}{" "}
                      {reviews.length === 1
                        ? "review"
                        : "reviews"}
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <p className="text-sm text-sub mt-3">
                No reviews yet for this service.
              </p>

            )}

          </div>

          {/* Individual Reviews */}

          {reviews.length > 0 && (

            <div className="mt-6 space-y-4">

              {reviews.map((review) => (

                <div
                  key={review.reviewId}
                  className="bg-surface border border-line rounded-lg p-4"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div>

                      <p className="text-sm font-semibold text-ink">
                        {review.customerName}
                      </p>

                      {review.createdAt && (
                        <p className="text-xs text-sub mt-0.5">
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString()}
                        </p>
                      )}

                    </div>

                    <div className="text-amber-500 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>

                  </div>

                  {review.comment && (

                    <p className="text-sm text-sub mt-3 leading-5">
                      "{review.comment}"
                    </p>

                  )}

                </div>

              ))}

            </div>

          )}

          {/* Book Now */}

          <div className="mt-8 pt-6 border-t border-line">

            <button
              onClick={() =>
                navigate(`/book/${service.serviceId}`)
              }
              disabled={!service.availability}
              className="w-full bg-primary text-white rounded-lg py-3 text-sm font-medium hover:bg-primaryDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {service.availability
                ? "Book This Service"
                : "Service Unavailable"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}