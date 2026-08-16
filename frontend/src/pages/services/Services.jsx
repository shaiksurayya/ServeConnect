import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080'

const categories = [
  'AC Repair',
  'Electrician',
  'Tutor',
  'Beautician',
  'Plumbing'
]

export default function Services() {
  const navigate = useNavigate()

  const [allServices, setAllServices] = useState([])
  const [serviceReviews, setServiceReviews] = useState({})
  const [expandedReviews, setExpandedReviews] = useState({})
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [minRating, setMinRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/services`)

      if (!response.ok) {
        throw new Error('Failed to load services')
      }

      const data = await response.json()

      setAllServices(data)

      await loadReviewsForServices(data)
    } catch (err) {
      console.error('Error:', err)
      setError(
        'Unable to load services right now. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadReviewsForServices = async (services) => {
    const reviewsMap = {}

    await Promise.all(
      services.map(async (service) => {
        try {
          const response = await fetch(
            `${API_URL}/api/reviews/service/${service.serviceId}`
          )

          if (!response.ok) {
            reviewsMap[service.serviceId] = []
            return
          }

          const reviews = await response.json()

          reviewsMap[service.serviceId] = reviews
        } catch (error) {
          console.error(
            `Failed to load reviews for service ${service.serviceId}`,
            error
          )

          reviewsMap[service.serviceId] = []
        }
      })
    )

    setServiceReviews(reviewsMap)
  }

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    )
  }

  const toggleReviews = (serviceId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }))
  }

  const getAverageRating = (serviceId) => {
    const reviews = serviceReviews[serviceId] || []

    if (reviews.length === 0) {
      return 0
    }

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    )

    return total / reviews.length
  }

  const filtered = allServices.filter((s) => {
    const matchesSearch =
      s.title
        .toLowerCase()
        .includes(search.toLowerCase())

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(s.categoryName)

    const matchesPrice =
      s.price <= maxPrice

    const rating = getAverageRating(s.serviceId)

    const matchesRating =
      rating >= minRating

    return (
      matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesRating
    )
  })

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">

      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-[220px_1fr] gap-8">

        {/* FILTERS */}

        <aside className="space-y-6">

          <div>
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search service..."
              className="w-full border border-line rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>

            <h3 className="text-sm font-semibold text-ink mb-2">
              Category
            </h3>

            <div className="space-y-1.5">

              {categories.map((cat) => (

                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm text-sub cursor-pointer"
                >

                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() =>
                      toggleCategory(cat)
                    }
                    className="accent-primary"
                  />

                  {cat}

                </label>

              ))}

            </div>

          </div>

          <div>

            <h3 className="text-sm font-semibold text-ink mb-2">
              Price
            </h3>

            <input
              type="range"
              min="100"
              max="1500"
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(Number(e.target.value))
              }
              className="w-full accent-primary"
            />

            <div className="text-xs text-sub mt-1">
              Up to ₹{maxPrice}
            </div>

          </div>

          <div>

            <h3 className="text-sm font-semibold text-ink mb-2">
              Rating
            </h3>

            <div className="flex gap-1">

              {[4, 3, 2, 1].map((r) => (

                <button
                  key={r}
                  onClick={() =>
                    setMinRating(
                      minRating === r ? 0 : r
                    )
                  }
                  className={`text-xs px-2 py-1 rounded-full border ${
                    minRating === r
                      ? 'bg-primary text-white border-primary'
                      : 'border-line text-sub'
                  }`}
                >
                  {r}★+
                </button>

              ))}

            </div>

          </div>

        </aside>

        {/* RESULTS */}

        <div>

          <h1 className="font-display font-700 text-xl text-ink mb-6">
            {loading
              ? 'Loading services...'
              : `${filtered.length} service${
                  filtered.length !== 1
                    ? 's'
                    : ''
                } found`}
          </h1>

          {error && (

            <div className="bg-white border border-line rounded-xl p-6 text-center mb-6">

              <p className="text-red-600 text-sm">
                {error}
              </p>

              <button
                onClick={loadServices}
                className="mt-3 text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primaryLight transition-colors"
              >
                Try again
              </button>

            </div>

          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filtered.map((s) => {

              const reviews =
                serviceReviews[s.serviceId] || []

              const averageRating =
                getAverageRating(s.serviceId)

              const isReviewsExpanded =
                expandedReviews[s.serviceId]

              return (

                <div
                  key={s.serviceId}
                  onClick={() =>
                    navigate(`/services/${s.serviceId}`)
                  }
                  className="bg-white border border-line rounded-xl p-5 cursor-pointer hover:shadow-md hover:border-primary transition-all"
                >

                  {/* SERVICE */}

                  <div className="text-sm font-semibold text-ink">
                    {s.title}
                  </div>

                  <div className="text-sm text-sub mt-1">
                    Provider: {s.providerName}
                  </div>

                  <div className="text-lg font-display font-700 text-ink mt-2">
                    ₹{s.price}
                  </div>

                  <div className="text-xs text-sub mt-0.5">
                    {s.duration} mins
                  </div>

                  <div
                    className={`text-xs font-medium mt-1 ${
                      s.availability
                        ? 'text-green-600'
                        : 'text-red-500'
                    }`}
                  >
                    {s.availability
                      ? 'Available'
                      : 'Currently unavailable'}
                  </div>

                  {/* RATING */}

                  <div className="mt-3 pt-3 border-t border-line">

                    {reviews.length > 0 ? (

                      <>

                        {/* RATING SUMMARY */}

                        <div className="flex items-center gap-2">

                          <span className="text-amber-500 text-sm">
                            {'★'.repeat(
                              Math.round(
                                averageRating
                              )
                            )}
                            {'☆'.repeat(
                              5 -
                                Math.round(
                                  averageRating
                                )
                            )}
                          </span>

                          <span className="text-sm font-semibold text-ink">
                            {averageRating.toFixed(1)}
                          </span>

                          <span className="text-xs text-sub">
                            ({reviews.length}{' '}
                            {reviews.length === 1
                              ? 'review'
                              : 'reviews'})
                          </span>

                        </div>

                        {/* VIEW REVIEWS BUTTON */}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleReviews(s.serviceId)
                          }}
                          className="text-xs text-primary font-medium mt-2 hover:underline"
                        >
                          {isReviewsExpanded
                            ? 'Hide reviews'
                            : 'View reviews'}
                        </button>

                        {/* REVIEWS - ONLY SHOWN AFTER CLICK */}

                        {isReviewsExpanded && (

                          <div className="mt-3 space-y-3">

                            {reviews
                              .slice(-2)
                              .reverse()
                              .map((review) => (

                                <div
                                  key={review.reviewId}
                                  className="bg-surface rounded-lg p-3"
                                >

                                  <div className="flex items-center justify-between">

                                    <span className="text-xs font-semibold text-ink">
                                      {review.customerName}
                                    </span>

                                    <span className="text-amber-500 text-xs">
                                      {'★'.repeat(
                                        review.rating
                                      )}
                                      {'☆'.repeat(
                                        5 -
                                          review.rating
                                      )}
                                    </span>

                                  </div>

                                  {review.comment && (

                                    <p className="text-xs text-sub mt-1">
                                      "{review.comment}"
                                    </p>

                                  )}

                                </div>

                              ))}

                          </div>

                        )}

                      </>

                    ) : (

                      <div className="text-xs text-sub">
                        No reviews yet
                      </div>

                    )}

                  </div>

                  {/* BOOK */}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/book/${s.serviceId}`)
                    }}
                    disabled={!s.availability}
                    className="w-full mt-4 text-sm font-medium text-white bg-primary rounded-lg py-2 hover:bg-primaryDark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Book Now
                  </button>

                </div>

              )
            })}

            {!loading &&
              !error &&
              filtered.length === 0 && (

                <p className="text-sm text-sub col-span-full">
                  No services match your filters.
                </p>

              )}

          </div>

        </div>

      </div>

    </div>
  )
}
