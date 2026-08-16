import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import Home from '../pages/Home.jsx'
import RoleSelect from '../pages/RoleSelect.jsx'
import Register from '../pages/Register.jsx'
import AboutUs from '../pages/AboutUs.jsx'
import ContactUs from '../pages/ContactUs.jsx'
import Bookings from '../pages/booking/Bookings.jsx'
import Reviews from '../pages/Reviews.jsx'
import Profile from '../pages/Profile.jsx'
import Services from '../pages/services/Services.jsx'
import BookService from '../pages/services/BookService.jsx'
import DashboardSelect from '../pages/dashboard/DashboardSelect.jsx'
import AdminDashboard from '../pages/dashboard/AdminDashboard.jsx'
import ProviderDashboard from '../pages/dashboard/ProviderDashboard.jsx'
import CustomerDashboard from '../pages/dashboard/CustomerDashboard.jsx'
import CustomerLogin from '../pages/auth/CustomerLogin.jsx'
import ProviderLogin from '../pages/auth/ProviderLogin.jsx'
import AdminLogin from '../pages/auth/AdminLogin.jsx'
import AddService from '../pages/dashboard/AddService.jsx'
import UpcomingBookings from '../pages/dashboard/UpcomingBookings.jsx'
import ProviderReviews from '../pages/dashboard/ProviderReviews.jsx'
import ServiceDetails from "../pages/services/ServiceDetails";

export default function AppRoutes() {
  return (
    <Routes>
      {/* MainLayout renders the Navbar once, so it stays fixed
          in place no matter which page below is active. */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/role-select" element={<RoleSelect />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/provider" element={<ProviderLogin />} />
        <Route path="/login/admin" element={<AdminLogin />} />

        <Route path="/services" element={<Services />} />
        <Route path="/book/:id" element={<BookService />} />
        <Route path="/services/:serviceId" element={<ServiceDetails />}/>
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<DashboardSelect />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/provider" element={<ProviderDashboard />} />
        <Route path="/dashboard/provider/bookings" element={<UpcomingBookings />} />
        <Route path="/dashboard/provider/reviews" element={<ProviderReviews />} />
        <Route path="/dashboard/provider/add-service" element={<AddService />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Route>
    </Routes>
  )
}

