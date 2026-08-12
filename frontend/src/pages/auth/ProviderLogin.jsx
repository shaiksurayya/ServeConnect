import { useNavigate } from 'react-router-dom'

export default function ProviderLogin() {
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const email = e.target[0].value
    const password = e.target[1].value

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        alert("Invalid credentials")
        return
      }

      const data = await response.json()

      console.log("Login Response:", data)

      // Allow only providers
      if (data.role !== "PROVIDER") {
        alert("This account is not registered as a provider.")
        return
      }

      localStorage.setItem("token", data.token)

      const user = {
  id: data.userId,
  providerId: data.providerId,
  name: data.name,
  email: data.email,
  role: data.role,
}

      localStorage.setItem("user", JSON.stringify(user))

      navigate("/dashboard/provider")
    } catch (err) {
      console.error(err)
      alert("Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-primaryLight flex items-center justify-center px-6 font-body text-ink">
      <div className="w-full max-w-sm bg-white border border-line rounded-2xl p-8">
        <button
          onClick={() => navigate('/role-select')}
          className="text-sm text-sub mb-6"
        >
          ← Back to roles
        </button>

        <h1 className="font-display font-600 text-2xl text-ink">
          Provider login
        </h1>

        <p className="text-sm text-sub mt-1 mb-6">
          Manage your bookings and jobs.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-sub">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-sm text-sub">Password</label>
            <input
              type="password"
              required
              className="mt-1 w-full border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primaryDark transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-sm text-sub mt-6">
          New here?{" "}
          <button
            onClick={() => navigate('/role-select?intent=signup')}
            className="text-primary font-medium"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  )
}