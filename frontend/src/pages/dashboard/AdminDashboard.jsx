import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StatCard from '../../components/ui/StatCard.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const statusBadge = {
  REQUESTED: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'overview'

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null)
  const [users, setUsers] = useState([])
  const [providers, setProviders] = useState([])
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [bookings, setBookings] = useState([])
  const [reviews, setReviews] = useState([])

  // Filters & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Category Modal State
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', category: null })
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [categoryError, setCategoryError] = useState('')

  // Verify Admin Authentication
  useEffect(() => {
    if (!token || !user || user.role !== 'ADMIN') {
      navigate('/login/admin')
      return
    }
    loadDataForTab(activeTab)
  }, [activeTab, navigate, token])

  const setTab = (tab) => {
    setSearchParams({ tab })
    setSearchQuery('')
    setError('')
  }

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })

  // Load Data based on tab
  const loadDataForTab = async (tab) => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'overview') {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load dashboard overview')
        const data = await res.json()
        setDashboardStats(data)
      } else if (tab === 'users') {
        const res = await fetch(`${API_URL}/api/admin/users`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load users')
        setUsers(await res.json())
      } else if (tab === 'providers') {
        const res = await fetch(`${API_URL}/api/admin/providers`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load providers')
        setProviders(await res.json())
      } else if (tab === 'services') {
        const res = await fetch(`${API_URL}/api/admin/services`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load services')
        setServices(await res.json())
      } else if (tab === 'categories') {
        const res = await fetch(`${API_URL}/api/admin/categories`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load categories')
        setCategories(await res.json())
      } else if (tab === 'bookings') {
        const res = await fetch(`${API_URL}/api/admin/bookings`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load bookings')
        setBookings(await res.json())
      } else if (tab === 'reviews') {
        const res = await fetch(`${API_URL}/api/admin/reviews`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to load reviews')
        setReviews(await res.json())
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // ADMIN ACTIONS
  // =========================================================

  // User Actions
  const handleToggleUserStatus = async (userId, currentActive) => {
    setActionLoading(`user-${userId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/status?active=${!currentActive}`, {
        method: 'PUT',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Failed to update user status')
      }
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return
    setActionLoading(`user-del-${userId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Failed to delete user')
      }
      setUsers((prev) => prev.filter((u) => u.userId !== userId))
      alert('User deleted successfully.')
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Provider Actions
  const handleToggleProviderVerification = async (providerId, currentVerified) => {
    setActionLoading(`prov-${providerId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/providers/${providerId}/verify?verified=${!currentVerified}`, {
        method: 'PUT',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to update provider verification')
      const updated = await res.json()
      setProviders((prev) => prev.map((p) => (p.providerId === providerId ? updated : p)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Service Actions
  const handleToggleServiceAvailability = async (serviceId, currentAvailability) => {
    setActionLoading(`serv-${serviceId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/services/${serviceId}/availability?availability=${!currentAvailability}`, {
        method: 'PUT',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to update service availability')
      const updated = await res.json()
      setServices((prev) => prev.map((s) => (s.serviceId === serviceId ? updated : s)))
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteService = async (serviceId, serviceTitle) => {
    if (!window.confirm(`Are you sure you want to delete service "${serviceTitle}"?`)) return
    setActionLoading(`serv-del-${serviceId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete service')
      setServices((prev) => prev.filter((s) => s.serviceId !== serviceId))
      alert('Service deleted successfully.')
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Category Actions
  const openCreateCategoryModal = () => {
    setCategoryForm({ name: '', description: '' })
    setCategoryError('')
    setCategoryModal({ open: true, mode: 'create', category: null })
  }

  const openEditCategoryModal = (cat) => {
    setCategoryForm({ name: cat.name, description: cat.description || '' })
    setCategoryError('')
    setCategoryModal({ open: true, mode: 'edit', category: cat })
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    setCategoryError('')
    if (!categoryForm.name.trim()) {
      setCategoryError('Category name is required.')
      return
    }

    try {
      if (categoryModal.mode === 'create') {
        const res = await fetch(`${API_URL}/api/admin/categories`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(categoryForm),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || 'Failed to create category')
        }
        const created = await res.json()
        setCategories((prev) => [...prev, created])
      } else {
        const res = await fetch(`${API_URL}/api/admin/categories/${categoryModal.category.categoryId}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify(categoryForm),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          throw new Error(err?.message || 'Failed to update category')
        }
        const updated = await res.json()
        setCategories((prev) => prev.map((c) => (c.categoryId === updated.categoryId ? updated : c)))
      }
      setCategoryModal({ open: false, mode: 'create', category: null })
    } catch (err) {
      setCategoryError(err.message)
    }
  }

  const handleDeleteCategory = async (categoryId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? Existing services under this category may be affected.`)) return
    setActionLoading(`cat-del-${categoryId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete category')
      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryId))
      alert('Category deleted successfully.')
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(`book-${bookingId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to update booking status')
      const updated = await res.json()
      setBookings((prev) => prev.map((b) => (b.bookingId === bookingId ? updated : b)))
      alert(`Booking #${bookingId} status updated to ${newStatus}.`)
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Review Actions
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review?')) return
    setActionLoading(`rev-del-${reviewId}`)
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error('Failed to delete review')
      setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId))
      alert('Review deleted successfully.')
    } catch (err) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  // Helper date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-surface min-h-[calc(100vh-73px)]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-700 text-3xl text-ink">Admin Dashboard</h1>
              <span className="bg-primaryLight text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Administrator
              </span>
            </div>
            <p className="text-sm text-sub mt-1">Manage users, providers, services, bookings and reviews across ServeConnect.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadDataForTab(activeTab)}
              disabled={loading}
              className="border border-line bg-white hover:bg-surface text-ink px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Data
            </button>
          </div>
        </div>

        {/* =================================================
            NAVIGATION TABS
        ================================================= */}
        <div className="bg-white border border-line rounded-2xl p-1.5 mb-8 flex flex-wrap gap-1 shadow-xs overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'providers', label: '🧰 Providers' },
            { id: 'services', label: '📦 Services' },
            { id: 'categories', label: '🗂️ Categories' },
            { id: 'bookings', label: '📅 Bookings' },
            { id: 'reviews', label: '⭐ Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-sub hover:text-ink hover:bg-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Loading / Error */}
        {loading ? (
          <div className="bg-white border border-line rounded-2xl p-16 text-center shadow-xs">
            <div className="text-4xl animate-bounce mb-3">🛡️</div>
            <p className="text-ink font-medium text-base">Loading admin data...</p>
            <p className="text-xs text-sub mt-1">Fetching latest records from database</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 font-semibold mb-3">{error}</p>
            <button
              onClick={() => loadDataForTab(activeTab)}
              className="text-xs font-medium text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* =================================================
                TAB 1: OVERVIEW
            ================================================= */}
            {activeTab === 'overview' && dashboardStats && (
              <div className="space-y-8">
                {/* Top KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Total Users" value={dashboardStats.totalUsers} />
                  <StatCard label="Customers" value={dashboardStats.totalCustomers} />
                  <StatCard label="Providers" value={dashboardStats.totalProviders} />
                  <StatCard label="Services" value={dashboardStats.totalServices} />
                  <StatCard label="Categories" value={dashboardStats.totalCategories} />
                  <StatCard label="Total Reviews" value={dashboardStats.totalReviews} />
                </div>

                {/* Booking & Financial Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard label="Total Bookings" value={dashboardStats.totalBookings} />
                  <StatCard label="Requested" value={dashboardStats.requestedBookings} />
                  <StatCard label="Accepted" value={dashboardStats.acceptedBookings} />
                  <StatCard label="Completed" value={dashboardStats.completedBookings} />
                  <StatCard label="Cancelled/Rejected" value={dashboardStats.cancelledBookings + dashboardStats.rejectedBookings} />
                  <StatCard label="Completed Revenue" value={`₹${dashboardStats.totalCompletedRevenue || 0}`} />
                </div>

                {/* Booking Status Distribution Bar */}
                <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                  <h2 className="font-display font-700 text-base text-ink mb-4">Booking Pipeline Status</h2>
                  <div className="space-y-3">
                    {[
                      { status: 'Requested', count: dashboardStats.requestedBookings, color: 'bg-yellow-500' },
                      { status: 'Accepted', count: dashboardStats.acceptedBookings, color: 'bg-blue-500' },
                      { status: 'Completed', count: dashboardStats.completedBookings, color: 'bg-green-500' },
                      { status: 'Cancelled', count: dashboardStats.cancelledBookings, color: 'bg-red-400' },
                      { status: 'Rejected', count: dashboardStats.rejectedBookings, color: 'bg-gray-400' },
                    ].map((item) => {
                      const total = Math.max(dashboardStats.totalBookings, 1)
                      const percentage = Math.round((item.count / total) * 100)
                      return (
                        <div key={item.status} className="flex items-center gap-3">
                          <span className="text-xs font-medium text-sub w-24 shrink-0">{item.status}</span>
                          <div className="flex-1 bg-surface rounded-full h-3 overflow-hidden">
                            <div className={`h-3 rounded-full ${item.color}`} style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-ink w-16 text-right">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Two Column Recent Grids */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Recent Bookings */}
                  <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display font-700 text-base text-ink">Recent Bookings</h2>
                      <button onClick={() => setTab('bookings')} className="text-xs text-primary font-semibold hover:underline">
                        View All →
                      </button>
                    </div>
                    {dashboardStats.recentBookings?.length === 0 ? (
                      <p className="text-xs text-sub">No recent bookings recorded.</p>
                    ) : (
                      <div className="divide-y divide-line">
                        {dashboardStats.recentBookings.map((b) => (
                          <div key={b.bookingId} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div>
                              <p className="font-semibold text-ink">{b.serviceTitle} <span className="text-sub font-normal">#{b.bookingId}</span></p>
                              <p className="text-sub mt-0.5">{b.customerName} → {b.providerName || 'Provider'}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-0.5 rounded-full font-medium ${statusBadge[b.status] || 'bg-gray-100'}`}>
                                {b.status}
                              </span>
                              <p className="text-sub mt-1 font-medium">₹{b.totalAmount}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Reviews */}
                  <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display font-700 text-base text-ink">Recent Reviews</h2>
                      <button onClick={() => setTab('reviews')} className="text-xs text-primary font-semibold hover:underline">
                        View All →
                      </button>
                    </div>
                    {dashboardStats.recentReviews?.length === 0 ? (
                      <p className="text-xs text-sub">No reviews submitted yet.</p>
                    ) : (
                      <div className="divide-y divide-line">
                        {dashboardStats.recentReviews.map((r) => (
                          <div key={r.reviewId} className="py-3 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-ink">{r.customerName} <span className="text-sub font-normal">for {r.providerName}</span></span>
                              <span className="text-amber-500 font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                            </div>
                            <p className="text-sub italic">"{r.comment || 'No comment provided'}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                TAB 2: USERS MANAGEMENT
            ================================================= */}
            {activeTab === 'users' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">All Users ({users.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Activate or deactivate customer and provider accounts.</p>
                  </div>

                  {/* Search and Role Filter */}
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search by name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-line rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary w-64"
                    />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border border-line rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="CUSTOMER">Customers</option>
                      <option value="PROVIDER">Providers</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs text-sub uppercase">
                        <th className="pb-3 font-semibold">User</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold">Phone</th>
                        <th className="pb-3 font-semibold">Address</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {users
                        .filter((u) => {
                          const matchesQuery =
                            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            u.phone?.includes(searchQuery)
                          const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
                          return matchesQuery && matchesRole
                        })
                        .map((u) => {
                          const isActing = actionLoading === `user-${u.userId}` || actionLoading === `user-del-${u.userId}`
                          return (
                            <tr key={u.userId} className="hover:bg-surface/50 transition-colors">
                              <td className="py-3.5">
                                <p className="font-semibold text-ink text-sm">{u.name}</p>
                                <p className="text-xs text-sub">{u.email}</p>
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                  u.role === 'PROVIDER' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 text-xs text-sub">{u.phone || '-'}</td>
                              <td className="py-3.5 text-xs text-sub max-w-xs truncate">{u.address || '-'}</td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {u.isActive ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                {u.role !== 'ADMIN' && (
                                  <>
                                    <button
                                      disabled={isActing}
                                      onClick={() => handleToggleUserStatus(u.userId, u.isActive)}
                                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                        u.isActive
                                          ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                          : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                      }`}
                                    >
                                      {u.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                      disabled={isActing}
                                      onClick={() => handleDeleteUser(u.userId, u.name)}
                                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================
                TAB 3: PROVIDERS MANAGEMENT
            ================================================= */}
            {activeTab === 'providers' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">Service Providers ({providers.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Verify credentials and manage provider profile states.</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Search provider by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-line rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs text-sub uppercase">
                        <th className="pb-3 font-semibold">Provider</th>
                        <th className="pb-3 font-semibold">Experience</th>
                        <th className="pb-3 font-semibold">Rating</th>
                        <th className="pb-3 font-semibold">Verification</th>
                        <th className="pb-3 font-semibold">User Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {providers
                        .filter((p) =>
                          p.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((p) => {
                          const isActing = actionLoading === `prov-${p.providerId}`
                          return (
                            <tr key={p.providerId} className="hover:bg-surface/50 transition-colors">
                              <td className="py-3.5">
                                <p className="font-semibold text-ink text-sm">{p.userName}</p>
                                <p className="text-xs text-sub">{p.userEmail} • {p.userPhone || 'No phone'}</p>
                              </td>
                              <td className="py-3.5 text-xs font-medium text-ink">
                                {p.experience || 0} years
                              </td>
                              <td className="py-3.5">
                                <span className="text-amber-500 font-semibold text-xs">
                                  ★ {p.avgRating || '0.0'}
                                </span>
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  p.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {p.isVerified ? '✓ Verified' : 'Unverified'}
                                </span>
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {p.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                <button
                                  disabled={isActing}
                                  onClick={() => handleToggleProviderVerification(p.providerId, p.isVerified)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                    p.isVerified
                                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                      : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                  }`}
                                >
                                  {p.isVerified ? 'Revoke Verification' : 'Verify Provider'}
                                </button>
                                {p.userId && (
                                  <button
                                    onClick={() => handleToggleUserStatus(p.userId, p.isActive)}
                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                                      p.isActive
                                        ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                    }`}
                                  >
                                    {p.isActive ? 'Suspend' : 'Unsuspend'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================
                TAB 4: SERVICES MANAGEMENT
            ================================================= */}
            {activeTab === 'services' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">All Services ({services.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Manage published service listings and remove inappropriate services.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search service title, provider..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-line rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary w-60"
                    />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="border border-line rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="ALL">All Categories</option>
                      {Array.from(new Set(services.map((s) => s.categoryName).filter(Boolean))).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs text-sub uppercase">
                        <th className="pb-3 font-semibold">Service</th>
                        <th className="pb-3 font-semibold">Provider</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {services
                        .filter((s) => {
                          const matchesQuery =
                            s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
                          const matchesCat = categoryFilter === 'ALL' || s.categoryName === categoryFilter
                          return matchesQuery && matchesCat
                        })
                        .map((s) => {
                          const isActing = actionLoading === `serv-${s.serviceId}` || actionLoading === `serv-del-${s.serviceId}`
                          return (
                            <tr key={s.serviceId} className="hover:bg-surface/50 transition-colors">
                              <td className="py-3.5 max-w-xs">
                                <p className="font-semibold text-ink text-sm">{s.title}</p>
                                <p className="text-xs text-sub truncate">{s.description || 'No description'}</p>
                              </td>
                              <td className="py-3.5 text-xs font-medium text-ink">{s.providerName || '-'}</td>
                              <td className="py-3.5">
                                <span className="text-xs font-semibold text-sub bg-surface px-2.5 py-1 rounded-md border border-line">
                                  {s.categoryName || 'General'}
                                </span>
                              </td>
                              <td className="py-3.5 text-xs font-bold text-ink">₹{s.price}</td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                                  s.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {s.availability ? 'Available' : 'Unavailable'}
                                </span>
                              </td>
                              <td className="py-3.5 text-right space-x-2">
                                <button
                                  disabled={isActing}
                                  onClick={() => handleToggleServiceAvailability(s.serviceId, s.availability)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                                    s.availability
                                      ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                      : 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  {s.availability ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  disabled={isActing}
                                  onClick={() => handleDeleteService(s.serviceId, s.title)}
                                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================
                TAB 5: CATEGORIES MANAGEMENT
            ================================================= */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">Service Categories ({categories.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Add, edit, or remove marketplace service categories.</p>
                  </div>

                  <button
                    onClick={openCreateCategoryModal}
                    className="bg-primary hover:bg-primaryDark text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <span>+</span> Add Category
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div key={c.categoryId} className="border border-line rounded-xl p-4.5 bg-surface/30 hover:bg-white transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-ink text-base">{c.name}</h3>
                          <span className="text-[11px] text-sub font-mono">ID #{c.categoryId}</span>
                        </div>
                        <p className="text-xs text-sub leading-relaxed">{c.description || 'No description provided.'}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-line flex justify-end gap-2">
                        <button
                          onClick={() => openEditCategoryModal(c)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-line text-ink hover:bg-surface transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.categoryId, c.name)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                TAB 6: BOOKINGS MANAGEMENT
            ================================================= */}
            {activeTab === 'bookings' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">All Bookings ({bookings.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Monitor service requests and update booking states.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search booking ID, customer, service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-line rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary w-60"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border border-line rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="REQUESTED">Requested</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs text-sub uppercase">
                        <th className="pb-3 font-semibold">Booking</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Provider</th>
                        <th className="pb-3 font-semibold">Schedule</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {bookings
                        .filter((b) => {
                          const matchesQuery =
                            String(b.bookingId).includes(searchQuery) ||
                            b.serviceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.providerName?.toLowerCase().includes(searchQuery.toLowerCase())
                          const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter
                          return matchesQuery && matchesStatus
                        })
                        .map((b) => {
                          const isActing = actionLoading === `book-${b.bookingId}`
                          return (
                            <tr key={b.bookingId} className="hover:bg-surface/50 transition-colors">
                              <td className="py-3.5">
                                <p className="font-semibold text-ink text-sm">{b.serviceTitle}</p>
                                <p className="text-xs text-sub font-mono">#{b.bookingId}</p>
                              </td>
                              <td className="py-3.5">
                                <p className="text-xs font-semibold text-ink">{b.customerName}</p>
                                <p className="text-[11px] text-sub">{b.customerPhone || b.customerEmail || '-'}</p>
                              </td>
                              <td className="py-3.5">
                                <p className="text-xs font-semibold text-ink">{b.providerName || '-'}</p>
                                <p className="text-[11px] text-sub">{b.providerPhone || '-'}</p>
                              </td>
                              <td className="py-3.5 text-xs text-sub">
                                <p>📅 {b.bookingDate}</p>
                                <p>🕒 {b.bookingTime}</p>
                              </td>
                              <td className="py-3.5 text-xs font-bold text-ink">
                                ₹{b.totalAmount}
                              </td>
                              <td className="py-3.5">
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusBadge[b.status] || 'bg-gray-100'}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right">
                                <select
                                  disabled={isActing}
                                  value={b.status}
                                  onChange={(e) => handleUpdateBookingStatus(b.bookingId, e.target.value)}
                                  className="text-xs border border-line rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-primary font-medium"
                                >
                                  <option value="REQUESTED">REQUESTED</option>
                                  <option value="ACCEPTED">ACCEPTED</option>
                                  <option value="COMPLETED">COMPLETED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                  <option value="REJECTED">REJECTED</option>
                                </select>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================================================
                TAB 7: REVIEWS MANAGEMENT
            ================================================= */}
            {activeTab === 'reviews' && (
              <div className="bg-white border border-line rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-700 text-lg text-ink">Customer Reviews ({reviews.length})</h2>
                    <p className="text-xs text-sub mt-0.5">Inspect user ratings and moderate abusive reviews.</p>
                  </div>

                  <input
                    type="text"
                    placeholder="Search reviews by customer, provider, comment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-line rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-primary w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs text-sub uppercase">
                        <th className="pb-3 font-semibold">Review</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Provider</th>
                        <th className="pb-3 font-semibold">Rating</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {reviews
                        .filter((r) =>
                          r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((r) => {
                          const isActing = actionLoading === `rev-del-${r.reviewId}`
                          return (
                            <tr key={r.reviewId} className="hover:bg-surface/50 transition-colors">
                              <td className="py-3.5 max-w-sm">
                                <p className="text-xs text-ink italic leading-relaxed">"{r.comment || 'No comment text'}"</p>
                              </td>
                              <td className="py-3.5 text-xs font-medium text-ink">{r.customerName}</td>
                              <td className="py-3.5 text-xs font-medium text-ink">{r.providerName || '-'}</td>
                              <td className="py-3.5">
                                <span className="text-amber-500 font-bold text-xs">
                                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                </span>
                              </td>
                              <td className="py-3.5 text-xs text-sub">{formatDate(r.createdAt)}</td>
                              <td className="py-3.5 text-right">
                                <button
                                  disabled={isActing}
                                  onClick={() => handleDeleteReview(r.reviewId)}
                                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                  Remove Review
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================
          ADD / EDIT CATEGORY MODAL
      ================================================= */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-line shadow-2xl w-full max-w-md p-6">
            <h3 className="font-display font-700 text-lg text-ink">
              {categoryModal.mode === 'create' ? 'Add New Category' : 'Edit Category'}
            </h3>
            <p className="text-xs text-sub mt-1 mb-5">
              Categories help organize services on the marketplace.
            </p>

            {categoryError && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {categoryError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Sanitization"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block mb-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Short explanation of services in this category..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full border border-line rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ open: false, mode: 'create', category: null })}
                  className="flex-1 border border-line text-ink rounded-xl py-2.5 text-xs font-semibold hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-primaryDark transition-colors"
                >
                  {categoryModal.mode === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
