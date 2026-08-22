import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080'

const publicLinks = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

const privateLinks = [
  { label: 'Add Service', path: '/dashboard/provider/add-service' },
  { label: 'Upcoming Bookings', path: '/dashboard/provider/bookings' },
  { label: 'Reviews Given', path: '/dashboard/provider/reviews' },
]

const customerLinks = [
  { label: 'Services', path: '/services' },
  { label: 'Bookings', path: '/bookings' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const notificationRef = useRef(null)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  let user = null

  try {
    const storedUser = localStorage.getItem('user')

    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Invalid user data in localStorage:', error)
    localStorage.removeItem('user')
  }

  const isLoggedIn = !!user
  const loginMode = localStorage.getItem('loginMode')

  const dashboardPath =
    loginMode === 'CUSTOMER'
      ? '/dashboard/customer'
      : loginMode === 'PROVIDER'
      ? '/dashboard/provider'
      : '/dashboard/customer'

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token')

    if (!token || !isLoggedIn) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      const data = await response.json()

      setNotifications(data)

      const unread = data.filter(
        (notification) => !notification.isRead
      ).length

      setUnreadCount(unread)
    } catch (error) {
      console.error(
        'Unable to load notifications:',
        error
      )
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    fetchNotifications()

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [isLoggedIn])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )
    }
  }, [])

  const markNotificationAsRead = async (notificationId) => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return false
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notificationId === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      )

      setUnreadCount((prev) =>
        prev > 0 ? prev - 1 : 0
      )

      return true
    } catch (error) {
      console.error(
        'Unable to mark notification as read:',
        error
      )

      return false
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        `${API_URL}/api/notifications/read-all`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error(
        'Unable to mark all notifications as read:',
        error
      )
    }
  }

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.isRead) {
      await markNotificationAsRead(
        notification.notificationId
      )
    }

    // Close notification dropdown
    setShowNotifications(false)

    // If notification is related to a booking,
    // navigate to the correct booking page
    if (notification.relatedBookingId) {
      if (loginMode === 'PROVIDER') {
        navigate('/dashboard/provider/bookings')
      } else if (loginMode === 'CUSTOMER') {
        navigate('/bookings')
      }
    }
  }

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) {
      return ''
    }

    const date = new Date(createdAt)

    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_BOOKING':
        return '🔔'

      case 'BOOKING_ACCEPTED':
        return '✅'

      case 'BOOKING_REJECTED':
        return '❌'

      case 'BOOKING_CANCELLED':
        return '🚫'

      case 'BOOKING_COMPLETED':
        return '🎉'

      default:
        return '🔔'
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('loginMode')
    localStorage.removeItem('chatMessages')

    navigate('/')
    window.location.reload()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <span className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-display font-700">
            S
          </span>

          <div className="text-left">
            <div className="font-display font-700 text-lg leading-none text-ink">
              ServeConnect
            </div>

            <div className="text-xs text-sub leading-none mt-0.5">
              Local Service Marketplace
            </div>
          </div>
        </button>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink/80">

          {publicLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={
                location.pathname === link.path
                  ? 'text-primary font-medium'
                  : 'hover:text-primary transition-colors'
              }
            >
              {link.label}
            </button>
          ))}

          {isLoggedIn &&
            loginMode === 'PROVIDER' &&
            privateLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={
                  location.pathname === link.path
                    ? 'text-primary font-medium'
                    : 'hover:text-primary transition-colors'
                }
              >
                {link.label}
              </button>
            ))}

          {isLoggedIn &&
            loginMode === 'CUSTOMER' &&
            customerLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={
                  location.pathname === link.path
                    ? 'text-primary font-medium'
                    : 'hover:text-primary transition-colors'
                }
              >
                {link.label}
              </button>
            ))}

          {isLoggedIn && (
            <button
              onClick={() => navigate(dashboardPath)}
              className={
                location.pathname === dashboardPath
                  ? 'text-primary font-medium'
                  : 'hover:text-primary transition-colors'
              }
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-3">

          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <div
                ref={notificationRef}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications(
                      (prev) => !prev
                    )
                  }
                  className="relative w-10 h-10 rounded-full border border-line flex items-center justify-center text-xl hover:bg-surface transition-colors"
                  title="Notifications"
                >
                  🔔

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99
                        ? '99+'
                        : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-line rounded-xl shadow-lg overflow-hidden z-50">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                      <div>
                        <h3 className="font-semibold text-ink">
                          Notifications
                        </h3>

                        {unreadCount > 0 && (
                          <p className="text-xs text-sub mt-0.5">
                            {unreadCount} unread
                          </p>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notifications */}
                    <div className="max-h-96 overflow-y-auto">

                      {notifications.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <div className="text-3xl mb-2">
                            🔔
                          </div>

                          <p className="text-sm font-medium text-ink">
                            No notifications
                          </p>

                          <p className="text-xs text-sub mt-1">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <button
                              key={
                                notification.notificationId
                              }
                              type="button"
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              className={`w-full text-left px-4 py-3 border-b border-line hover:bg-surface transition-colors ${
                                !notification.isRead
                                  ? 'bg-primaryLight/30'
                                  : 'bg-white'
                              }`}
                            >
                              <div className="flex gap-3">

                                <div className="text-lg">
                                  {getNotificationIcon(
                                    notification.type
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">

                                  <p className="text-sm text-ink">
                                    {notification.message}
                                  </p>

                                  <p className="text-[11px] text-sub mt-1">
                                    {formatNotificationTime(
                                      notification.createdAt
                                    )}
                                  </p>

                                </div>

                                {!notification.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                )}

                              </div>
                            </button>
                          )
                        )
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                title={user?.name || 'Profile'}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold"
              >
                {(user?.name?.charAt(0) || 'U').toUpperCase()}
              </button>

              <span className="hidden md:block text-sm font-medium text-ink">
                {user?.name || 'User'}
              </span>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 border border-red-600 rounded-lg px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                onClick={() =>
                  navigate('/role-select?intent=login')
                }
                className="text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primaryLight transition-colors"
              >
                Login
              </button>

              {/* Register */}
              <button
                onClick={() =>
                  navigate('/role-select?intent=signup')
                }
                className="text-sm font-medium text-white bg-primary rounded-lg px-4 py-2 hover:bg-primaryDark transition-colors"
              >
                Register
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  )
}
