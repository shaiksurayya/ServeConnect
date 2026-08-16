import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function ProviderReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const dashboardRes = await fetch(
        `${API_URL}/api/dashboard/provider`,
        {
          headers,
        }
      );

      if (!dashboardRes.ok) {
        throw new Error("Unable to load provider information");
      }

      const dashboardData = await dashboardRes.json();

      if (!dashboardData?.providerId) {
        setReviews([]);
        return;
      }

      const reviewRes = await fetch(
        `${API_URL}/api/reviews/provider/${dashboardData.providerId}`,
        {
          headers,
        }
      );

      if (!reviewRes.ok) {
        throw new Error("Unable to load reviews");
      }

      const reviewData = await reviewRes.json();

      setReviews(reviewData);
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-[calc(100vh-73px)] flex items-center justify-center">
        <p className="text-lg font-medium text-ink">
          Loading reviews...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <h1 className="font-display font-bold text-3xl text-ink">
          Reviews Given
        </h1>

        <p className="text-sm text-sub mt-2 mb-8">
          Reviews and ratings received from your customers.
        </p>

        {/* Reviews */}
        {reviews.length === 0 ? (
          <div className="bg-white border border-line rounded-xl p-8 shadow-sm text-center">
            <p className="text-gray-500">
              No reviews available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {reviews.map((review) => (
              <div
                key={review.reviewId}
                className="bg-white border border-line rounded-xl p-6 shadow-sm"
              >

                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">

                  {/* Customer */}
                  <div>
                    <h2 className="font-semibold text-lg text-ink">
                      {review.customerName}
                    </h2>

                    <p className="text-sm text-sub mt-1">
                      Customer Review
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="text-yellow-500 font-semibold text-lg">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                </div>

                {/* Comment */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {review.comment}
                  </p>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}