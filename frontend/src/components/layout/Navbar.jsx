import { useNavigate, useLocation } from 'react-router-dom'

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

  // Safely read user from localStorage
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

          {/* Public Links */}
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

          {/* Provider Links */}
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

          {/* Customer Links */}
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

          {/* Dashboard */}
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
                onClick={() => navigate('/role-select?intent=login')}
                className="text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primaryLight transition-colors"
              >
                Login
              </button>

              {/* Register */}
              <button
                onClick={() => navigate('/role-select?intent=signup')}
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