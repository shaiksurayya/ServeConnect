import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard'

export default function CustomerDashboard() {
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  let user = null

try {
  const storedUser = localStorage.getItem("user")

  if (storedUser && storedUser !== "undefined") {
    user = JSON.parse(storedUser)
  }
} catch (error) {
  console.error("Invalid user data in localStorage:", error)
  localStorage.removeItem("user")
}

const userId = user?.userId
const token = localStorage.getItem("token")
  useEffect(() => {
    if (userId) {
      fetchDashboard()
    } else {
      setLoading(false)
    }
  }, [])
  console.log("User:", user)
console.log("User ID:", userId)
console.log("Token:", token)

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/dashboard/customer/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
if (!response.ok) {
  const error = await response.text()
  console.log("Backend Error:", error)
  throw new Error(error)
}

      const data = await response.json()
      console.log('Dashboard Response:', data)
      setDashboard(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        Failed to load dashboard.
      </div>
    )
  }

  const recentBookings = dashboard.recentBookings || []
  const recommendedServices = dashboard.recommendedServices || []

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display font-700 text-2xl text-ink">
          Hello {dashboard.name || user?.name} 👋
        </h1>

        <p className="text-sm text-sub mt-1 mb-8">
          Here's a look at your bookings.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Bookings"
            value={dashboard.totalBookings ?? 0}
          />

          <StatCard
            label="Completed"
            value={dashboard.completedBookings ?? 0}
          />

          <StatCard
            label="Reviews"
            value={dashboard.totalReviews ?? 0}
          />
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mt-6">
          <h2 className="font-display font-600 text-base text-ink mb-4">
            Upcoming Booking
          </h2>

          {dashboard.upcomingBooking ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-sub">
                  {dashboard.upcomingBooking.bookingDate}
                </div>

                <div className="text-sm font-semibold text-ink mt-1">
                  {dashboard.upcomingBooking.serviceName}
                </div>
              </div>

              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {dashboard.upcomingBooking.status}
              </span>
            </div>
          ) : (
            <p>No upcoming bookings.</p>
          )}
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mt-6">
          <h2 className="font-display font-600 text-base text-ink mb-4">
            Recent Bookings
          </h2>

          {recentBookings.length === 0 ? (
            <p>No recent bookings.</p>
          ) : (
            recentBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="flex items-center justify-between mb-4"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {booking.serviceName}
                  </div>

                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 inline-block mt-1">
                    {booking.status}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/bookings')}
                  className="text-xs font-medium text-primary"
                >
                  View details →
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mt-6">
          <h2 className="font-display font-600 text-base text-ink mb-4">
            Recommended Services
          </h2>

          {recommendedServices.length === 0 ? (
            <p>No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendedServices.map((service) => (
                <button
                  key={service}
                  onClick={() => navigate('/services')}
                  className="border border-line rounded-lg py-3 text-sm text-ink hover:border-primary hover:text-primary transition-colors"
                >
                  {service}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}